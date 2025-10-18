import { v4 as uuid } from 'uuid'
import DEFAULT_CONTENT from '@/assets/example/markdown.md?raw'

const data = {
  posts: [
    {
      id: uuid(),
      title: `内容1`,
      content: DEFAULT_CONTENT,
      history: [
        { datetime: new Date().toLocaleString(`zh-cn`), content: DEFAULT_CONTENT },
      ],
      createDatetime: new Date(),
      updateDatetime: new Date(),
    },
  ],
}

export {
  data,
}
