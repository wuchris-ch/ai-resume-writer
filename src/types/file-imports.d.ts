declare module 'mammoth/mammoth.browser' {
  export function extractRawText(options: { arrayBuffer: ArrayBuffer }): Promise<{ value: string }>
}

declare module 'pdfjs-dist/build/pdf.worker.min.mjs' {
  const workerSrc: string
  export default workerSrc
}
