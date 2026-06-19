import type {
  AcceptCollabInviteResponse,
  CollabDetailResponse,
  CollabInviteRequest,
  CollabInviteResponse,
  CollabListItem,
  CollabMember,
  CollabPullResponse,
  CollabPushRequest,
  CollabPushResponse,
  CreateCollabRequest,
  CreateCollabResponse,
} from '@md/shared/types'
import { MdApiClient } from '@/services/account/client'
import { isAccountConfigured } from '@/services/account/config'

export type {
  AcceptCollabInviteResponse,
  CollabDetailResponse,
  CollabDocument,
  CollabInviteRequest,
  CollabInviteResponse,
  CollabListItem,
  CollabMember,
  CollabPullResponse,
  CollabPushRequest,
  CollabPushResponse,
  CollabRole,
  CollabStyleBundle,
  CreateCollabRequest,
  CreateCollabResponse,
} from '@md/shared/types'

export function isCollabConfigured(): boolean {
  return isAccountConfigured()
}

export function isCollabUiEnabled(): boolean {
  const flag = import.meta.env.VITE_COLLAB_UI_ENABLED
  if (flag === `false` || flag === `0`)
    return false
  return isCollabConfigured()
}

export class CollabClient extends MdApiClient {
  list(): Promise<{ documents: CollabListItem[] }> {
    return this.request(`GET`, `/collab`)
  }

  create(payload: CreateCollabRequest): Promise<CreateCollabResponse> {
    return this.request(`POST`, `/collab`, payload)
  }

  get(id: string): Promise<CollabDetailResponse> {
    return this.request(`GET`, `/collab/${id}`)
  }

  remove(id: string): Promise<{ ok: true }> {
    return this.request(`DELETE`, `/collab/${id}`)
  }

  pull(id: string, since: number): Promise<CollabPullResponse> {
    return this.request(`GET`, `/collab/${id}/pull?since=${since}`)
  }

  push(id: string, payload: CollabPushRequest): Promise<CollabPushResponse> {
    return this.request(`POST`, `/collab/${id}/push`, payload)
  }

  invite(id: string, payload: CollabInviteRequest): Promise<CollabInviteResponse> {
    return this.request(`POST`, `/collab/${id}/invite`, payload)
  }

  acceptInvite(token: string): Promise<AcceptCollabInviteResponse> {
    return this.request(`POST`, `/collab/invites/${token}/accept`)
  }

  listMembers(id: string): Promise<{ members: CollabMember[] }> {
    return this.request(`GET`, `/collab/${id}/members`)
  }

  updateMember(id: string, userId: string, role: `editor` | `viewer` | null): Promise<{ members: CollabMember[] }> {
    return this.request(`PATCH`, `/collab/${id}/members/${userId}`, { role })
  }
}
