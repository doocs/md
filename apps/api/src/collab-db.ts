import type {
  CollabDocument,
  CollabHistoryEntry,
  CollabInviteRole,
  CollabListItem,
  CollabMember,
  CollabRole,
  CollabStyleBundle,
} from './collab-types'
import { defaultCollabStyleBundle, parseCollabStyleBundle } from './collab-style'

interface CollabDocumentRow {
  id: string
  owner_user_id: string
  source_post_id: string | null
  title: string
  content: string
  style: string
  content_updated_at: number
  style_updated_at: number
  history: string
  created_at: number
  server_updated_at: number
  deleted: number
}

interface CollabInviteRow {
  token: string
  document_id: string
  role: string
  created_by: string
  expires_at: number | null
  max_uses: number | null
  use_count: number
  created_at: number
}

function parseHistory(raw: string): CollabHistoryEntry[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  }
  catch {
    return []
  }
}

function rowToDocument(row: CollabDocumentRow): CollabDocument {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    sourcePostId: row.source_post_id,
    title: row.title,
    content: row.content,
    style: parseCollabStyleBundle(row.style) ?? defaultCollabStyleBundle(),
    contentUpdatedAt: row.content_updated_at,
    styleUpdatedAt: row.style_updated_at,
    history: parseHistory(row.history),
    createdAt: row.created_at,
    updatedAt: row.server_updated_at,
    deleted: row.deleted === 1,
  }
}

export async function getMemberRole(
  db: D1Database,
  documentId: string,
  userId: string,
): Promise<CollabRole | null> {
  const row = await db
    .prepare(`SELECT role FROM collab_members WHERE document_id = ? AND user_id = ?`)
    .bind(documentId, userId)
    .first<{ role: string }>()
  if (!row)
    return null
  if (row.role === `owner` || row.role === `editor` || row.role === `viewer`)
    return row.role
  return null
}

export async function getCollabDocumentRow(
  db: D1Database,
  documentId: string,
): Promise<CollabDocumentRow | null> {
  return db
    .prepare(`SELECT * FROM collab_documents WHERE id = ?`)
    .bind(documentId)
    .first<CollabDocumentRow>()
}

export async function getCollabDocument(
  db: D1Database,
  documentId: string,
): Promise<CollabDocument | null> {
  const row = await getCollabDocumentRow(db, documentId)
  return row ? rowToDocument(row) : null
}

export async function listCollabDocumentsForUser(
  db: D1Database,
  userId: string,
): Promise<CollabListItem[]> {
  const result = await db
    .prepare(
      `SELECT d.id, d.title, d.content_updated_at, d.style_updated_at, d.server_updated_at,
              m.role, u.login AS owner_login
       FROM collab_members m
       JOIN collab_documents d ON d.id = m.document_id
       JOIN users u ON u.id = d.owner_user_id
       WHERE m.user_id = ? AND d.deleted = 0
       ORDER BY d.server_updated_at DESC`,
    )
    .bind(userId)
    .all<{
    id: string
    title: string
    content_updated_at: number
    style_updated_at: number
    server_updated_at: number
    role: string
    owner_login: string
  }>()

  return (result.results ?? []).map(row => ({
    id: row.id,
    title: row.title,
    role: row.role as CollabRole,
    ownerLogin: row.owner_login,
    contentUpdatedAt: row.content_updated_at,
    styleUpdatedAt: row.style_updated_at,
    updatedAt: row.server_updated_at,
  }))
}

export async function listCollabMembers(
  db: D1Database,
  documentId: string,
): Promise<CollabMember[]> {
  const result = await db
    .prepare(
      `SELECT m.user_id, m.role, m.joined_at, u.login, u.name, u.avatar
       FROM collab_members m
       JOIN users u ON u.id = m.user_id
       WHERE m.document_id = ?
       ORDER BY CASE m.role WHEN 'owner' THEN 0 WHEN 'editor' THEN 1 ELSE 2 END, m.joined_at ASC`,
    )
    .bind(documentId)
    .all<{
    user_id: string
    role: string
    joined_at: number
    login: string
    name: string | null
    avatar: string | null
  }>()

  return (result.results ?? []).map(row => ({
    userId: row.user_id,
    login: row.login,
    name: row.name,
    avatar: row.avatar,
    role: row.role as CollabRole,
    joinedAt: row.joined_at,
  }))
}

export async function insertCollabDocument(
  db: D1Database,
  input: {
    id: string
    ownerUserId: string
    sourcePostId: string | null
    title: string
    content: string
    style: CollabStyleBundle
    now: number
  },
): Promise<CollabDocument> {
  const history: CollabHistoryEntry[] = []
  await db
    .prepare(
      `INSERT INTO collab_documents
         (id, owner_user_id, source_post_id, title, content, style,
          content_updated_at, style_updated_at, history, created_at, server_updated_at, deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    )
    .bind(
      input.id,
      input.ownerUserId,
      input.sourcePostId,
      input.title,
      input.content,
      JSON.stringify(input.style),
      input.now,
      input.now,
      JSON.stringify(history),
      input.now,
      input.now,
    )
    .run()

  await db
    .prepare(
      `INSERT INTO collab_members (document_id, user_id, role, joined_at)
       VALUES (?, ?, 'owner', ?)`,
    )
    .bind(input.id, input.ownerUserId, input.now)
    .run()

  const doc = await getCollabDocument(db, input.id)
  if (!doc)
    throw new Error(`collab_insert_failed`)
  return doc
}

export async function pushCollabDocument(
  db: D1Database,
  documentId: string,
  input: {
    title?: string
    content?: string
    contentUpdatedAt?: number
    style?: CollabStyleBundle
    styleUpdatedAt?: number
  },
): Promise<{ document: CollabDocument, contentAccepted: boolean, styleAccepted: boolean, cursor: number }> {
  const row = await getCollabDocumentRow(db, documentId)
  if (!row || row.deleted === 1)
    throw new Error(`not_found`)

  const now = Date.now()
  let contentAccepted = false
  let styleAccepted = false

  let title = row.title
  let content = row.content
  let contentUpdatedAt = row.content_updated_at
  let style = row.style
  let styleUpdatedAt = row.style_updated_at

  if (input.content !== undefined && input.contentUpdatedAt !== undefined) {
    if (input.contentUpdatedAt > row.content_updated_at) {
      content = input.content
      contentUpdatedAt = input.contentUpdatedAt
      contentAccepted = true
      if (input.title !== undefined)
        title = input.title
    }
  }
  else if (input.title !== undefined && input.contentUpdatedAt !== undefined) {
    if (input.contentUpdatedAt > row.content_updated_at) {
      title = input.title
      contentUpdatedAt = input.contentUpdatedAt
      contentAccepted = true
    }
  }

  if (input.style !== undefined && input.styleUpdatedAt !== undefined) {
    if (input.styleUpdatedAt > row.style_updated_at) {
      style = JSON.stringify(input.style)
      styleUpdatedAt = input.styleUpdatedAt
      styleAccepted = true
    }
  }

  if (contentAccepted || styleAccepted) {
    await db
      .prepare(
        `UPDATE collab_documents SET
           title = ?,
           content = ?,
           style = ?,
           content_updated_at = ?,
           style_updated_at = ?,
           server_updated_at = ?
         WHERE id = ?`,
      )
      .bind(title, content, style, contentUpdatedAt, styleUpdatedAt, now, documentId)
      .run()
  }

  const document = await getCollabDocument(db, documentId)
  if (!document)
    throw new Error(`not_found`)

  return {
    document,
    contentAccepted,
    styleAccepted,
    cursor: contentAccepted || styleAccepted ? now : row.server_updated_at,
  }
}

export async function pullCollabDocument(
  db: D1Database,
  documentId: string,
  since: number,
): Promise<{ document: CollabDocument | null, cursor: number }> {
  const row = await getCollabDocumentRow(db, documentId)
  if (!row || row.deleted === 1)
    throw new Error(`not_found`)

  const cursor = Math.max(since, row.server_updated_at)
  if (row.server_updated_at <= since)
    return { document: null, cursor }

  return { document: rowToDocument(row), cursor: row.server_updated_at }
}

export async function softDeleteCollabDocument(
  db: D1Database,
  documentId: string,
): Promise<void> {
  const now = Date.now()
  await db
    .prepare(`UPDATE collab_documents SET deleted = 1, server_updated_at = ? WHERE id = ?`)
    .bind(now, documentId)
    .run()
}

export async function insertCollabInvite(
  db: D1Database,
  input: {
    token: string
    documentId: string
    role: CollabInviteRole
    createdBy: string
    expiresAt: number | null
    maxUses: number | null
    now: number
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO collab_invites
         (token, document_id, role, created_by, expires_at, max_uses, use_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    )
    .bind(
      input.token,
      input.documentId,
      input.role,
      input.createdBy,
      input.expiresAt,
      input.maxUses,
      input.now,
    )
    .run()
}

export async function getCollabInvite(
  db: D1Database,
  token: string,
): Promise<CollabInviteRow | null> {
  return db
    .prepare(`SELECT * FROM collab_invites WHERE token = ?`)
    .bind(token)
    .first<CollabInviteRow>()
}

export async function acceptCollabInvite(
  db: D1Database,
  token: string,
  userId: string,
): Promise<{ documentId: string, role: CollabRole }> {
  const invite = await getCollabInvite(db, token)
  if (!invite)
    throw new Error(`invite_not_found`)

  const now = Date.now()
  if (invite.expires_at != null && invite.expires_at < now)
    throw new Error(`invite_expired`)

  if (invite.max_uses != null && invite.use_count >= invite.max_uses)
    throw new Error(`invite_exhausted`)

  const doc = await getCollabDocumentRow(db, invite.document_id)
  if (!doc || doc.deleted === 1)
    throw new Error(`not_found`)

  const existingRole = await getMemberRole(db, invite.document_id, userId)
  if (existingRole) {
    return { documentId: invite.document_id, role: existingRole }
  }

  const role = invite.role === `editor` ? `editor` : `viewer`

  await db.batch([
    db
      .prepare(
        `INSERT INTO collab_members (document_id, user_id, role, joined_at)
         VALUES (?, ?, ?, ?)`,
      )
      .bind(invite.document_id, userId, role, now),
    db
      .prepare(`UPDATE collab_invites SET use_count = use_count + 1 WHERE token = ?`)
      .bind(token),
  ])

  return { documentId: invite.document_id, role }
}

export async function updateCollabMemberRole(
  db: D1Database,
  documentId: string,
  targetUserId: string,
  role: CollabInviteRole | null,
): Promise<void> {
  if (role === null) {
    await db
      .prepare(`DELETE FROM collab_members WHERE document_id = ? AND user_id = ? AND role != 'owner'`)
      .bind(documentId, targetUserId)
      .run()
    return
  }

  await db
    .prepare(`UPDATE collab_members SET role = ? WHERE document_id = ? AND user_id = ? AND role != 'owner'`)
    .bind(role, documentId, targetUserId)
    .run()
}
