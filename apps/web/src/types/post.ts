export interface PostHistory {
  /**
   * Epoch milliseconds for new entries.
   * Legacy locale/ISO strings may remain when they cannot be parsed reliably.
   */
  datetime: number | string
  content: string
}

export interface Post {
  id: string
  title: string
  content: string
  history: PostHistory[]
  createDatetime: Date
  updateDatetime: Date
  parentId?: string | null
  collapsed?: boolean
  /**
   * Tree path of the local folder file this post was opened from
   * (e.g. `my-folder/docs/intro.md`). Present only for posts loaded via the
   * folder panel; absent for ordinary in-app posts. Drives the relative-image
   * resolution and disk-sync paths.
   */
  sourceFilePath?: string
}

export interface PostItemDragState {
  dragSourceId: string | null
  dropTargetId: string | null
  setDragSourceId: (id: string | null) => void
  setDropTargetId: (id: string | null) => void
  handleDrop: (targetId: string | null) => void
  handleDragEnd: () => void
}

export interface PostItemSelectState {
  isSelectMode: boolean
  selectedIds: string[]
  onToggleSelect: (id: string) => void
}

export interface PostItemActions {
  startRenamePost: (id: string) => void
  openHistoryDialog: (id: string) => void
  startDelPost: (id: string) => void
  openAddPostDialog: (parentId: string) => void
}

export interface PostItemProps {
  parentId: string | null
  /** Posts grouped by parent id (`null` = root), pre-sorted. */
  childrenMap: Map<string | null, Post[]>
  actions: PostItemActions
  drag: PostItemDragState
  select?: PostItemSelectState
}
