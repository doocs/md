/**
 * PDF operations — full Stirling-PDF API coverage (~75 endpoints).
 * Each function returns { client, endpoint, files, data, output } descriptor
 * that the CLI runner executes via client.upload().
 */

/** Shorthand: single file upload. */
function single(file, endpoint, data = {}) {
  return { files: { fileInput: file }, endpoint, data };
}

/** Multiple files as fileInput_0, fileInput_1, ... */
function multi(files, endpoint, data = {}) {
  const fm = {};
  files.forEach((f, i) => { fm[`fileInput_${i}`] = f; });
  return { files: fm, endpoint, data };
}

// ── Merge & Split ────────────────────────────────────────────

export const merge = (files, { output, order }) => {
  const data = {};
  if (order) data.fileOrder = order;
  return { ...multi(files, 'merge-pdfs', data), output };
};

export const splitPages = (file, { output }) =>
  ({ ...single(file, 'split-pages'), output });

export const splitRange = (file, { output, ranges }) =>
  ({ ...single(file, 'split-pdfs', { pageRanges: ranges }), output });

export const splitSize = (file, { output, size, docCount }) => {
  const data = {};
  if (size) data.size = size;
  if (docCount) data.docCount = String(docCount);
  return { ...single(file, 'split-pdf-by-size-or-count', data), output };
};

export const splitChapters = (file, { output }) =>
  ({ ...single(file, 'split-pdf-by-chapters'), output });

export const splitSections = (file, { output }) =>
  ({ ...single(file, 'split-pdf-by-sections'), output });

export const splitPoster = (file, { output }) =>
  ({ ...single(file, 'split-for-poster-print'), output });

// ── Convert PDF → X ─────────────────────────────────────────

export const pdfToImg = (file, { outputDir, format = 'png', dpi = 150, singleImg = false }) =>
  ({ ...single(file, 'pdf/img', { imageFormat: format, dpi: String(dpi), singleImage: String(singleImg) }), output: `${outputDir}/pdf_images.zip` });

export const pdfToHtml = (file, { output }) =>
  ({ ...single(file, 'pdf/html'), output });

export const pdfToText = (file, { output }) =>
  ({ ...single(file, 'pdf/text'), output });

export const pdfToWord = (file, { output }) =>
  ({ ...single(file, 'pdf/word'), output });

export const pdfToPptx = (file, { output }) =>
  ({ ...single(file, 'pdf/presentation'), output });

export const pdfToXlsx = (file, { output }) =>
  ({ ...single(file, 'pdf/xlsx'), output });

export const pdfToCsv = (file, { output }) =>
  ({ ...single(file, 'extract-csv'), output });

export const pdfToXml = (file, { output }) =>
  ({ ...single(file, 'pdf/xml'), output });

export const pdfToEpub = (file, { output }) =>
  ({ ...single(file, 'pdf/epub'), output });

export const pdfToPdfa = (file, { output, level }) => {
  const data = {};
  if (level) data.complianceLevel = level;
  return { ...single(file, 'pdf/pdfa', data), output };
};

export const pdfToCbr = (file, { output }) =>
  ({ ...single(file, 'pdf/cbr'), output });

export const pdfToCbz = (file, { output }) =>
  ({ ...single(file, 'pdf/cbz'), output });

export const pdfToVideo = (file, { output, format = 'png', fps = 1, duration = 5, transitionMs = 500, audio }) => {
  const data = { imageFormat: format, fps: String(fps), duration: String(duration), transitionMs: String(transitionMs) };
  const op = single(file, 'pdf/video', data);
  if (audio) op.files.audioFile = audio;
  return { ...op, output };
};

export const pdfToVector = (file, { output, formatType = 'svg' }) =>
  ({ ...single(file, 'pdf/vector', { formatType }), output });

export const pdfToJson = (file, { output }) =>
  ({ ...single(file, 'pdf-to-json'), output });

// ── Convert X → PDF ─────────────────────────────────────────

export const imgToPdf = (files, { output }) =>
  ({ ...multi(files, 'img/pdf'), output });

export const htmlToPdf = (file, { output }) =>
  ({ ...single(file, 'html/pdf'), output });

export const urlToPdf = (_, { url, output }) =>
  ({ files: {}, endpoint: 'url/pdf', data: { urlInput: url }, output });

export const mdToPdf = (file, { output }) =>
  ({ ...single(file, 'markdown/pdf'), output });

export const svgToPdf = (file, { output }) =>
  ({ ...single(file, 'svg/pdf'), output });

export const fileToPdf = (file, { output }) =>
  ({ ...single(file, 'file/pdf'), output });

export const ebookToPdf = (file, { output }) =>
  ({ ...single(file, 'ebook/pdf'), output });

export const emlToPdf = (file, { output }) =>
  ({ ...single(file, 'eml/pdf'), output });

export const vectorToPdf = (file, { output }) =>
  ({ ...single(file, 'vector/pdf'), output });

export const jsonToPdf = (file, { output }) =>
  ({ ...single(file, 'json-to-pdf'), output });

// ── Compress ─────────────────────────────────────────────────

export const compress = (file, { output, quality = 3 }) =>
  ({ ...single(file, 'compress-pdf', { qualityLevel: String(quality) }), output });

export const decompress = (file, { output }) =>
  ({ ...single(file, 'decompress-pdf'), output });

// ── Page Manipulation ────────────────────────────────────────

export const rotate = (file, { output, angle = 90 }) =>
  ({ ...single(file, 'rotate-pdf', { angle: String(angle) }), output });

export const scalePages = (file, { output, factor = 1.5, size }) => {
  const data = { scaleFactor: String(factor) };
  if (size) data.pageSize = size;
  return { ...single(file, 'scale-pages', data), output };
};

export const crop = (file, { output, x = 0, y = 0, width = 0, height = 0 }) =>
  ({ ...single(file, 'crop', { x: String(x), y: String(y), width: String(width), height: String(height) }), output });

export const removePages = (file, { output, ranges }) =>
  ({ ...single(file, 'remove-pages', { pageRanges: ranges }), output });

export const rearrangePages = (file, { output, order }) =>
  ({ ...single(file, 'rearrange-pages', { pageOrder: order }), output });

export const removeBlanks = (file, { output, threshold = 0.1, whitePercent = 99 }) =>
  ({ ...single(file, 'remove-blanks', { threshold: String(threshold), whitePercent: String(whitePercent) }), output });

export const toSinglePage = (file, { output }) =>
  ({ ...single(file, 'to-single-page'), output });

export const multiPageLayout = (file, { output, rows = 1, cols = 2 }) =>
  ({ ...single(file, 'multi-page-layout', { rowsPerPage: String(rows), colsPerPage: String(cols) }), output });

export const booklet = (file, { output }) =>
  ({ ...single(file, 'booklet'), output });

export const poster = (file, { output, perSheet = 1 }) =>
  ({ ...single(file, 'poster', { pagesPerSheet: String(perSheet) }), output });

// ── Watermark & Stamp ────────────────────────────────────────

export const watermark = (file, { output, text, fontSize = 30, opacity = 0.5, rotation = 45 }) =>
  ({ ...single(file, 'add-watermark', { watermarkText: text, fontSize: String(fontSize), opacity: String(opacity), rotation: String(rotation) }), output });

export const pageNumbers = (file, { output, text = '{n}/{total}', position = 'bottom-right', start = 1 }) =>
  ({ ...single(file, 'add-page-numbers', { customText: text, position, startingNumber: String(start) }), output });

export const stamp = (file, { output, stampFile, allPages = false }) => {
  const op = single(file, 'add-stamp', { allPages: String(allPages) });
  op.files.stampFile = stampFile;
  return { ...op, output };
};

export const overlay = (file, { output, overlayFile }) => {
  const op = single(file, 'overlay-pdfs');
  op.files.overlayFile = overlayFile;
  return { ...op, output };
};

export const overlayImage = (file, { output, image, x = 0, y = 0, width = 0, height = 0 }) => {
  const op = single(file, 'add-image', { x: String(x), y: String(y), width: String(width), height: String(height) });
  op.files.overlayImage = image;
  return { ...op, output };
};

// ── Security ─────────────────────────────────────────────────

export const lock = (file, { output, password, ownerPassword, keyLength = 256 }) => {
  const data = { password, keyLength: String(keyLength) };
  if (ownerPassword) data.ownerPassword = ownerPassword;
  return { ...single(file, 'add-password', data), output };
};

export const unlock = (file, { output, password }) =>
  ({ ...single(file, 'remove-password', { password }), output });

export const sign = (file, { output, cert, certPassword = '', reason = '', location: loc = '', name = '' }) => {
  const op = single(file, 'timestamp-pdf', { certPassword, reason, location: loc, name });
  op.files.certFile = cert;
  return { ...op, output };
};

export const removeSignature = (file, { output }) =>
  ({ ...single(file, 'remove-cert-sign'), output });

export const timestamp = (file, { output, cert, certPassword = '', tsaUrl }) => {
  const data = { certPassword };
  if (tsaUrl) data.tsaUrl = tsaUrl;
  const op = single(file, 'timestamp-pdf', data);
  op.files.certFile = cert;
  return { ...op, output };
};

export const validate = (file, _opts) =>
  single(file, 'validate-signature');

export const verify = (file, _opts) =>
  single(file, 'verify-pdf');

export const sanitize = (file, { output, removeJs = true, removeEmbedded = true, removeMetadata = true, removeLinks = false, removeFonts = false }) =>
  ({ ...single(file, 'sanitize-pdf', { removeJavaScript: String(removeJs), removeEmbeddedFiles: String(removeEmbedded), removeMetadata: String(removeMetadata), removeLinks: String(removeLinks), removeFonts: String(removeFonts) }), output });

export const redact = (file, { output, text = [], regex = false, color = 'black', wholeWord = false }) => {
  const data = { useRegex: String(regex), redactionColor: color, wholeWordSearch: String(wholeWord) };
  text.forEach((t, i) => { data[`redactText_${i}`] = t; });
  return { ...single(file, 'auto-redact', data), output };
};

// ── Info ─────────────────────────────────────────────────────

export const infoAll = (file, _opts) => single(file, 'get-info-on-pdf');
export const infoBasic = (file, _opts) => single(file, 'basic-info');
export const infoSecurity = (file, _opts) => single(file, 'security-info');
export const infoFonts = (file, _opts) => single(file, 'font-info');
export const infoPages = (file, _opts) => single(file, 'page-count');
export const infoDimensions = (file, _opts) => single(file, 'page-dimensions');
export const infoAnnotations = (file, _opts) => single(file, 'annotation-info');
export const showJs = (file, _opts) => single(file, 'show-javascript');

export const setMetadata = (file, { output, title = '', author = '', subject = '', keywords = '', creator = '', producer = '' }) => {
  const data = {};
  for (const [k, v] of [['title', title], ['author', author], ['subject', subject], ['keywords', keywords], ['creator', creator], ['producer', producer]]) {
    if (v) data[k] = v;
  }
  return { ...single(file, 'update-metadata', data), output };
};

// ── OCR ──────────────────────────────────────────────────────

export const ocr = (file, { output, languages = 'eng', sidecar = false, deskew = false, clean = false, cleanFinal = false, dpi = 300 }) =>
  ({ ...single(file, 'ocr-pdf', { languages, sidecar: String(sidecar), deskew: String(deskew), clean: String(clean), cleanFinal: String(cleanFinal), dpi: String(dpi) }), output });

// ── Images ───────────────────────────────────────────────────

export const extractImages = (file, { output }) => single(file, 'extract-images', {}, output);
export const extractScans = (file, { output }) => single(file, 'extract-image-scans', {}, output);
export const removeImages = (file, { output }) => ({ ...single(file, 'remove-image-pdf'), output });

// ── Forms ────────────────────────────────────────────────────

export const formFields = (file, _opts) => single(file, 'fields');
export const formFieldsCoords = (file, _opts) => single(file, 'fields-with-coordinates');
export const formFill = (file, { output, data = {} }) => ({ ...single(file, 'fill', data), output });
export const formModify = (file, { output, data = {} }) => ({ ...single(file, 'modify-fields', data), output });
export const formDelete = (file, { output }) => ({ ...single(file, 'delete-fields'), output });
export const formUnlock = (file, { output }) => ({ ...single(file, 'unlock-pdf-forms'), output });
export const formFlatten = (file, { output }) => ({ ...single(file, 'flatten'), output });

// ── Attachments ──────────────────────────────────────────────

export const addAttachments = (file, { output, attachments }) => {
  const op = single(file, 'add-attachments');
  attachments.forEach((a, i) => { op.files[`fileInput_${i}`] = a; });
  return { ...op, output };
};

export const listAttachments = (file, _opts) => single(file, 'list-attachments');
export const addComments = (file, { output, data = {} }) => ({ ...single(file, 'add-comments', data), output });

// ── Filters ──────────────────────────────────────────────────

export const filterBySize = (file, { output, min = 0, max = 0, unit = 'bytes' }) =>
  ({ ...single(file, 'filter-file-size', { minSize: String(min), maxSize: String(max), sizeUnit: unit }), output });

export const filterByDimensions = (file, { output, width = 0, height = 0, tolerance = 0.01, unitOfMeasurement = 'px' }) =>
  ({ ...single(file, 'filter-page-size', { pageWidth: String(width), pageHeight: String(height), tolerance: String(tolerance), unitOfMeasurement }), output });

// ── Misc ─────────────────────────────────────────────────────

export const autoRename = (file, { output }) => ({ ...single(file, 'auto-rename'), output });
export const autoSplit = (file, { output, mode = 'every-page' }) => ({ ...single(file, 'auto-split-pdf', { splitMode: mode }), output });
export const repair = (file, { output }) => ({ ...single(file, 'repair'), output });
export const scanEffect = (file, { output }) => ({ ...single(file, 'scanner-effect'), output });
export const mobileScan = (files, { output }) => ({ ...multi(files, 'api/v1/mobile-scanner/scan'), output });
export const printFile = (file, _opts) => single(file, 'print-file');
export const invertColor = (file, { output, replaceColor = '', invert = false }) =>
  ({ ...single(file, 'replace-and-invert-color', { replaceColor, invertColor: String(invert) }), output });
export const toc = (file, { output, data = {} }) => ({ ...single(file, 'edit-table-of-contents', data), output });
