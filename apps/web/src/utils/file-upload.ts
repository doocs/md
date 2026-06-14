export async function fileUpload(content: string, file: File): Promise<string> {
  const { fileUpload: upload } = await import(`./file`)
  return upload(content, file)
}
