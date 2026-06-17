export async function fileUpload(content: string, file: File): Promise<string> {
  const { fileUpload: upload } = await import(`./providers`)
  return upload(content, file)
}
