import type { Context } from 'hono'
import type {
  AcceptCollabInviteResponse,
  CollabDetailResponse,
  CollabInviteRequest,
  CollabInviteResponse,
  CollabPullResponse,
  CollabPushRequest,
  CollabPushResponse,
  CollabRole,
  CreateCollabRequest,
  CreateCollabResponse,
} from './collab-types'
import type { Env } from './types'
import {
  acceptCollabInvite,
  getCollabDocument,
  getMemberRole,
  insertCollabDocument,
  insertCollabInvite,
  listCollabDocumentsForUser,
  listCollabMembers,
  pullCollabDocument,
  pushCollabDocument,
  softDeleteCollabDocument,
  updateCollabMemberRole,
} from './collab-db'
import { validateCollabStyleBundle } from './collab-style'
import { defaultOrigin } from './origin'

type CollabContext = Context<{ Bindings: Env, Variables: { userId: string } }>

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function parseDocumentId(value: string | undefined): string | null {
  if (!value || !UUID_RE.test(value))
    return null
  return value
}

function parseInviteToken(value: string | undefined): string | null {
  if (!value || value.length < 16)
    return null
  return value
}

const MAX_CONTENT_BYTES = 2 * 1024 * 1024
const MAX_TITLE_LENGTH = 256
const MAX_POST_ID_LENGTH = 64
const DEFAULT_INVITE_HOURS = 24 * 7

function canWrite(role: CollabRole): boolean {
  return role === `owner` || role === `editor`
}

async function requireMembership(
  c: CollabContext,
  documentId: string,
): Promise<{ role: CollabRole } | Response> {
  const role = await getMemberRole(c.env.DB, documentId, c.get(`userId`))
  if (!role)
    return c.json({ error: `forbidden` }, 403)
  return { role }
}

function parseTitle(value: unknown): string | null {
  if (typeof value !== `string`)
    return null
  const title = value.trim()
  if (!title || title.length > MAX_TITLE_LENGTH)
    return null
  return title
}

function parseContent(value: unknown): string | null {
  if (typeof value !== `string`)
    return null
  if (value.length > MAX_CONTENT_BYTES)
    return null
  return value
}

function parseSourcePostId(value: unknown): string | null {
  if (value === undefined || value === null)
    return null
  if (typeof value !== `string`)
    return null
  const id = value.trim()
  if (!id || id.length > MAX_POST_ID_LENGTH)
    return null
  return id
}

function buildInviteUrl(c: CollabContext, token: string): string {
  const base = defaultOrigin(c.env)
  const url = new URL(base)
  url.searchParams.set(`collab_invite`, token)
  return url.toString()
}

export async function listCollabHandler(c: CollabContext) {
  const items = await listCollabDocumentsForUser(c.env.DB, c.get(`userId`))
  return c.json({ documents: items })
}

export async function createCollabHandler(c: CollabContext) {
  let body: CreateCollabRequest
  try {
    body = await c.req.json<CreateCollabRequest>()
  }
  catch {
    return c.json({ error: `invalid_body` }, 400)
  }

  const title = parseTitle(body.title)
  const content = parseContent(body.content)
  if (!title || content === null)
    return c.json({ error: `invalid_document` }, 400)

  const styleResult = validateCollabStyleBundle(body.style)
  if (!styleResult.ok)
    return c.json({ error: styleResult.error }, 400)

  const now = Date.now()
  const id = crypto.randomUUID()
  const userId = c.get(`userId`)

  const document = await insertCollabDocument(c.env.DB, {
    id,
    ownerUserId: userId,
    sourcePostId: parseSourcePostId(body.sourcePostId),
    title,
    content,
    style: styleResult.style,
    now,
  })

  const response: CreateCollabResponse = { id, document }
  return c.json(response, 201)
}

export async function getCollabHandler(c: CollabContext) {
  const documentId = parseDocumentId(c.req.param(`id`))
  if (!documentId)
    return c.json({ error: `invalid_id` }, 400)
  const membership = await requireMembership(c, documentId)
  if (membership instanceof Response)
    return membership

  const document = await getCollabDocument(c.env.DB, documentId)
  if (!document || document.deleted)
    return c.json({ error: `not_found` }, 404)

  const members = await listCollabMembers(c.env.DB, documentId)
  const response: CollabDetailResponse = {
    document,
    role: membership.role,
    members,
  }
  return c.json(response)
}

export async function deleteCollabHandler(c: CollabContext) {
  const documentId = parseDocumentId(c.req.param(`id`))
  if (!documentId)
    return c.json({ error: `invalid_id` }, 400)
  const membership = await requireMembership(c, documentId)
  if (membership instanceof Response)
    return membership

  if (membership.role !== `owner`)
    return c.json({ error: `forbidden` }, 403)

  await softDeleteCollabDocument(c.env.DB, documentId)
  return c.json({ ok: true })
}

export async function pullCollabHandler(c: CollabContext) {
  const documentId = parseDocumentId(c.req.param(`id`))
  if (!documentId)
    return c.json({ error: `invalid_id` }, 400)
  const membership = await requireMembership(c, documentId)
  if (membership instanceof Response)
    return membership

  const sinceRaw = c.req.query(`since`)
  const since = Number.parseInt(sinceRaw ?? `0`, 10)
  const cursor = Number.isFinite(since) && since > 0 ? since : 0

  try {
    const { document, cursor: newCursor } = await pullCollabDocument(c.env.DB, documentId, cursor)
    const response: CollabPullResponse = {
      document,
      role: membership.role,
      cursor: newCursor,
    }
    return c.json(response)
  }
  catch {
    return c.json({ error: `not_found` }, 404)
  }
}

export async function pushCollabHandler(c: CollabContext) {
  const documentId = parseDocumentId(c.req.param(`id`))
  if (!documentId)
    return c.json({ error: `invalid_id` }, 400)
  const membership = await requireMembership(c, documentId)
  if (membership instanceof Response)
    return membership

  if (!canWrite(membership.role))
    return c.json({ error: `forbidden` }, 403)

  let body: CollabPushRequest
  try {
    body = await c.req.json<CollabPushRequest>()
  }
  catch {
    return c.json({ error: `invalid_body` }, 400)
  }

  if (body.content !== undefined) {
    const content = parseContent(body.content)
    if (content === null)
      return c.json({ error: `invalid_content` }, 400)
    body.content = content
  }

  if (body.title !== undefined) {
    const title = parseTitle(body.title)
    if (!title)
      return c.json({ error: `invalid_title` }, 400)
    body.title = title
  }

  if (body.style !== undefined) {
    const styleResult = validateCollabStyleBundle(body.style)
    if (!styleResult.ok)
      return c.json({ error: styleResult.error }, 400)
    body.style = styleResult.style
  }

  try {
    const result = await pushCollabDocument(c.env.DB, documentId, body)
    const response: CollabPushResponse = {
      document: result.document,
      cursor: result.cursor,
      merged: {
        contentAccepted: result.contentAccepted,
        styleAccepted: result.styleAccepted,
      },
    }
    return c.json(response)
  }
  catch (e) {
    if (e instanceof Error && e.message === `not_found`)
      return c.json({ error: `not_found` }, 404)
    throw e
  }
}

export async function createInviteHandler(c: CollabContext) {
  const documentId = parseDocumentId(c.req.param(`id`))
  if (!documentId)
    return c.json({ error: `invalid_id` }, 400)
  const membership = await requireMembership(c, documentId)
  if (membership instanceof Response)
    return membership

  if (membership.role !== `owner`)
    return c.json({ error: `forbidden` }, 403)

  let body: CollabInviteRequest
  try {
    body = await c.req.json<CollabInviteRequest>()
  }
  catch {
    return c.json({ error: `invalid_body` }, 400)
  }

  if (body.role !== `editor` && body.role !== `viewer`)
    return c.json({ error: `invalid_role` }, 400)

  const now = Date.now()
  const hours = body.expiresInHours ?? DEFAULT_INVITE_HOURS
  const expiresAt = hours > 0 ? now + hours * 60 * 60 * 1000 : null
  const maxUses = body.maxUses ?? null
  const token = crypto.randomUUID().replace(/-/g, ``)

  await insertCollabInvite(c.env.DB, {
    token,
    documentId,
    role: body.role,
    createdBy: c.get(`userId`),
    expiresAt,
    maxUses: maxUses != null && maxUses > 0 ? maxUses : null,
    now,
  })

  const response: CollabInviteResponse = {
    token,
    role: body.role,
    expiresAt,
    maxUses: maxUses != null && maxUses > 0 ? maxUses : null,
    inviteUrl: buildInviteUrl(c, token),
  }
  return c.json(response)
}

export async function acceptInviteHandler(c: CollabContext) {
  const token = parseInviteToken(c.req.param(`token`))
  if (!token)
    return c.json({ error: `invalid_token` }, 400)
  try {
    const result = await acceptCollabInvite(c.env.DB, token, c.get(`userId`))
    const response: AcceptCollabInviteResponse = {
      documentId: result.documentId,
      role: result.role,
    }
    return c.json(response)
  }
  catch (e) {
    if (e instanceof Error) {
      if (e.message === `invite_not_found`)
        return c.json({ error: `invite_not_found` }, 404)
      if (e.message === `invite_expired`)
        return c.json({ error: `invite_expired` }, 410)
      if (e.message === `invite_exhausted`)
        return c.json({ error: `invite_exhausted` }, 410)
      if (e.message === `not_found`)
        return c.json({ error: `not_found` }, 404)
    }
    throw e
  }
}

export async function listMembersHandler(c: CollabContext) {
  const documentId = parseDocumentId(c.req.param(`id`))
  if (!documentId)
    return c.json({ error: `invalid_id` }, 400)
  const membership = await requireMembership(c, documentId)
  if (membership instanceof Response)
    return membership

  if (membership.role !== `owner`)
    return c.json({ error: `forbidden` }, 403)

  const members = await listCollabMembers(c.env.DB, documentId)
  return c.json({ members })
}

export async function updateMemberHandler(c: CollabContext) {
  const documentId = parseDocumentId(c.req.param(`id`))
  const targetUserId = parseDocumentId(c.req.param(`userId`))
  if (!documentId || !targetUserId)
    return c.json({ error: `invalid_id` }, 400)
  const membership = await requireMembership(c, documentId)
  if (membership instanceof Response)
    return membership

  if (membership.role !== `owner`)
    return c.json({ error: `forbidden` }, 403)

  if (targetUserId === c.get(`userId`))
    return c.json({ error: `cannot_modify_self` }, 400)

  const targetRole = await getMemberRole(c.env.DB, documentId, targetUserId)
  if (!targetRole || targetRole === `owner`)
    return c.json({ error: `not_found` }, 404)

  let body: { role?: `editor` | `viewer` | null }
  try {
    body = await c.req.json<{ role?: `editor` | `viewer` | null }>()
  }
  catch {
    return c.json({ error: `invalid_body` }, 400)
  }

  if (body.role !== undefined && body.role !== `editor` && body.role !== `viewer` && body.role !== null)
    return c.json({ error: `invalid_role` }, 400)

  await updateCollabMemberRole(c.env.DB, documentId, targetUserId, body.role ?? null)
  const members = await listCollabMembers(c.env.DB, documentId)
  return c.json({ members })
}
