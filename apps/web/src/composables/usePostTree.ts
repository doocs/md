export interface PostTreeInput {
  id: string
  title: string
  updateDatetime: Date
  parentId?: string | null
}

export interface FlatPostTreeNode {
  id: string
  title: string
  updateDatetime: Date
  depth: number
}

interface TreeNode extends FlatPostTreeNode {
  children: TreeNode[]
}

export function buildPostTree(posts: PostTreeInput[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  for (const p of posts) {
    map.set(p.id, {
      id: p.id,
      title: p.title,
      updateDatetime: p.updateDatetime,
      depth: 0,
      children: [],
    })
  }

  const roots: TreeNode[] = []
  for (const p of posts) {
    const node = map.get(p.id)
    if (!node)
      continue
    if (p.parentId && map.has(p.parentId))
      map.get(p.parentId)!.children.push(node)
    else
      roots.push(node)
  }

  function sortChildren(nodes: TreeNode[]) {
    nodes.sort((a, b) => new Date(b.updateDatetime).getTime() - new Date(a.updateDatetime).getTime())
    nodes.forEach(n => sortChildren(n.children))
  }
  sortChildren(roots)
  return roots
}

export function flattenPostTree(
  nodes: TreeNode[],
  depth = 0,
): FlatPostTreeNode[] {
  const result: FlatPostTreeNode[] = []
  for (const node of nodes) {
    result.push({
      id: node.id,
      title: node.title,
      updateDatetime: node.updateDatetime,
      depth,
    })
    if (node.children.length)
      result.push(...flattenPostTree(node.children, depth + 1))
  }
  return result
}

export function filterFlatPosts(
  posts: FlatPostTreeNode[],
  query: string,
): FlatPostTreeNode[] {
  const q = query.toLowerCase().trim()
  if (!q)
    return posts
  return posts.filter(p => p.title.toLowerCase().includes(q))
}
