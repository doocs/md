#!/usr/bin/env node

/**
 * pdf-cli — Stirling PDF CLI for doocs/md
 * 102 commands covering all Stirling-PDF API endpoints.
 */

import { Command } from 'commander';
import { StirlingPdfClient } from './lib/client.js';
import * as ops from './lib/operations.js';
import { existsSync, writeFileSync } from 'fs';

let jsonMode = false;
let client;

function emit(result, msg) {
  if (jsonMode) {
    const out = { ...result };
    delete out.bytes;
    console.log(JSON.stringify(out, null, 2));
    return;
  }
  if (msg) console.log(msg);
  for (const [k, v] of Object.entries(result)) {
    if (k === 'bytes') continue;
    console.log(`  ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
  }
}

function requireFile(p) {
  if (!existsSync(p)) { console.error(`Error: File not found: ${p}`); process.exit(1); }
  return p;
}

/** Execute an operation descriptor via the client. */
async function run(op) {
  try {
    const result = await client.upload(op.endpoint, op.files, op.data, op.output);
    emit(result, op.output ? `✅ → ${op.output}` : undefined);
  } catch (err) {
    console.error(jsonMode ? JSON.stringify({ error: err.message }) : `❌ ${err.message}`);
    process.exit(1);
  }
}

const program = new Command();

program
  .name('pdf-cli')
  .description('Stirling PDF CLI — manipulate PDFs via Stirling-PDF server (80+ commands)')
  .version('1.0.0')
  .option('--json', 'Emit machine-readable JSON')
  .option('--url <url>', 'Stirling PDF server URL', process.env.STIRLING_PDF_URL)
  .option('--key <key>', 'API key', process.env.STIRLING_PDF_API_KEY)
  .action(async () => {
    const opts = program.opts();
    jsonMode = opts.json;
    client = new StirlingPdfClient({ baseUrl: opts.url, apiKey: opts.key });
    // Default: show health
    console.log(`Server: ${client.baseUrl}`);
    emit(await client.health());
  });

// ── Health ───────────────────────────────────────────────────

program.command('health').description('Check server health').action(async () => {
  jsonMode = program.opts().json;
  client ??= new StirlingPdfClient(program.opts());
  console.log(`Server: ${client.baseUrl}`);
  emit(await client.health());
});

// ── Merge ────────────────────────────────────────────────────

program.command('merge')
  .description('Merge multiple PDFs into one')
  .argument('<files...>', 'PDF files to merge')
  .requiredOption('-o, --output <path>', 'Output file')
  .option('--order <order>', 'Custom page order')
  .action(async (files, opts) => {
    files.forEach(requireFile);
    await run(ops.merge(files, opts));
  });

// ── Split ────────────────────────────────────────────────────

const split = program.command('split').description('Split PDF files');

split.command('pages')
  .description('Split into individual pages')
  .argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.splitPages(requireFile(file), opts)); });

split.command('range')
  .description('Extract page ranges')
  .argument('<file>').requiredOption('-o, --output <path>').requiredOption('--ranges <ranges>', 'e.g. 1-3,5,7-9')
  .action(async (file, opts) => { await run(ops.splitRange(requireFile(file), opts)); });

split.command('size')
  .description('Split by file size or count')
  .argument('<file>').requiredOption('-o, --output <path>').option('--size <size>').option('--doc-count <n>', parseInt)
  .action(async (file, opts) => { await run(ops.splitSize(requireFile(file), opts)); });

split.command('chapters')
  .description('Split by chapters/bookmarks')
  .argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.splitChapters(requireFile(file), opts)); });

split.command('sections')
  .description('Split by sections')
  .argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.splitSections(requireFile(file), opts)); });

split.command('poster')
  .description('Split for poster printing')
  .argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.splitPoster(requireFile(file), opts)); });

// ── Convert PDF → X ─────────────────────────────────────────

const cvt = program.command('convert').description('Convert PDF to/from other formats');

cvt.command('to-img').description('PDF → images').argument('<file>').requiredOption('-o, --output-dir <dir>')
  .option('--format <fmt>', 'png|jpg|jpeg|webp', 'png').option('--dpi <n>', parseInt, 150).option('--single', 'Single image', false)
  .action(async (file, opts) => { await run(ops.pdfToImg(requireFile(file), opts)); });

cvt.command('to-html').description('PDF → HTML').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.pdfToHtml(requireFile(file), opts)); });

cvt.command('to-text').description('Extract text').argument('<file>').option('-o, --output <path>')
  .action(async (file, opts) => {
    requireFile(file);
    const r = await client.upload('pdf/text', { fileInput: file }, {}, opts.output);
    if (opts.output) { emit(r, `✅ → ${opts.output}`); }
    else if (r.bytes) { process.stdout.write(r.bytes); }
    else { emit(r); }
  });

cvt.command('to-word').description('PDF → DOCX').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.pdfToWord(requireFile(file), opts)); });

cvt.command('to-pptx').description('PDF → PPTX').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.pdfToPptx(requireFile(file), opts)); });

cvt.command('to-xlsx').description('PDF → XLSX').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.pdfToXlsx(requireFile(file), opts)); });

cvt.command('to-csv').description('PDF tables → CSV').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.pdfToCsv(requireFile(file), opts)); });

cvt.command('to-xml').description('PDF → XML').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.pdfToXml(requireFile(file), opts)); });

cvt.command('to-epub').description('PDF → EPUB').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.pdfToEpub(requireFile(file), opts)); });

cvt.command('to-pdfa').description('PDF → PDF/A').argument('<file>').requiredOption('-o, --output <path>').option('--level <level>')
  .action(async (file, opts) => { await run(ops.pdfToPdfa(requireFile(file), opts)); });

cvt.command('to-cbr').description('PDF → CBR').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.pdfToCbr(requireFile(file), opts)); });

cvt.command('to-cbz').description('PDF → CBZ').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.pdfToCbz(requireFile(file), opts)); });

cvt.command('to-video').description('PDF → video slideshow').argument('<file>').requiredOption('-o, --output <path>')
  .option('--fps <n>', parseInt, 1).option('--duration <s>', parseInt, 5).option('--audio <path>')
  .action(async (file, opts) => { await run(ops.pdfToVideo(requireFile(file), opts)); });

cvt.command('to-vector').description('Export vector graphics').argument('<file>').requiredOption('-o, --output <path>').option('--format <fmt>', 'svg')
  .action(async (file, opts) => { await run(ops.pdfToVector(requireFile(file), opts)); });

cvt.command('to-json').description('PDF → JSON').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.pdfToJson(requireFile(file), opts)); });

// ── Convert X → PDF ─────────────────────────────────────────

cvt.command('from-img').description('Images → PDF').argument('<files...>').requiredOption('-o, --output <path>')
  .action(async (files, opts) => { files.forEach(requireFile); await run(ops.imgToPdf(files, opts)); });

cvt.command('from-html').description('HTML → PDF').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.htmlToPdf(requireFile(file), opts)); });

cvt.command('from-url').description('URL → PDF').argument('<url>').requiredOption('-o, --output <path>')
  .action(async (url, opts) => { await run(ops.urlToPdf(null, { url, ...opts })); });

cvt.command('from-markdown').description('Markdown → PDF').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.mdToPdf(requireFile(file), opts)); });

cvt.command('from-svg').description('SVG → PDF').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.svgToPdf(requireFile(file), opts)); });

cvt.command('from-ebook').description('Ebook → PDF').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.ebookToPdf(requireFile(file), opts)); });

cvt.command('from-email').description('EML → PDF').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.emlToPdf(requireFile(file), opts)); });

cvt.command('from-vector').description('Vector → PDF').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.vectorToPdf(requireFile(file), opts)); });

cvt.command('to-pdf').description('Any file → PDF').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.fileToPdf(requireFile(file), opts)); });

cvt.command('from-json').description('JSON → PDF').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.jsonToPdf(requireFile(file), opts)); });

// ── Compress ─────────────────────────────────────────────────

program.command('compress').description('Compress PDF').argument('<file>').requiredOption('-o, --output <path>')
  .option('--quality <1-4>', parseInt, 3)
  .action(async (file, opts) => { await run(ops.compress(requireFile(file), opts)); });

program.command('decompress').description('Decompress PDF').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.decompress(requireFile(file), opts)); });

// ── Page ─────────────────────────────────────────────────────

const page = program.command('page').description('Page manipulation');

page.command('rotate').argument('<file>').requiredOption('-o, --output <path>').option('--angle <deg>', parseInt, 90)
  .action(async (file, opts) => { await run(ops.rotate(requireFile(file), opts)); });

page.command('scale').argument('<file>').requiredOption('-o, --output <path>').option('--factor <n>', parseFloat, 1.5)
  .action(async (file, opts) => { await run(ops.scalePages(requireFile(file), opts)); });

page.command('crop').argument('<file>').requiredOption('-o, --output <path>')
  .option('--x <n>', parseFloat, 0).option('--y <n>', parseFloat, 0).option('--width <n>', parseFloat, 0).option('--height <n>', parseFloat, 0)
  .action(async (file, opts) => { await run(ops.crop(requireFile(file), opts)); });

page.command('remove').argument('<file>').requiredOption('-o, --output <path>').requiredOption('--ranges <ranges>')
  .action(async (file, opts) => { await run(ops.removePages(requireFile(file), opts)); });

page.command('rearrange').argument('<file>').requiredOption('-o, --output <path>').requiredOption('--order <order>')
  .action(async (file, opts) => { await run(ops.rearrangePages(requireFile(file), opts)); });

page.command('remove-blanks').argument('<file>').requiredOption('-o, --output <path>')
  .option('--threshold <n>', parseFloat, 0.1).option('--white-percent <n>', parseFloat, 99)
  .action(async (file, opts) => { await run(ops.removeBlanks(requireFile(file), opts)); });

page.command('single').argument('<file>').requiredOption('-o, --output <path>').description('Merge to single long page')
  .action(async (file, opts) => { await run(ops.toSinglePage(requireFile(file), opts)); });

page.command('nup').argument('<file>').requiredOption('-o, --output <path>')
  .option('--rows <n>', parseInt, 1).option('--cols <n>', parseInt, 2)
  .action(async (file, opts) => { await run(ops.multiPageLayout(requireFile(file), opts)); });

page.command('booklet').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.booklet(requireFile(file), opts)); });

page.command('poster').argument('<file>').requiredOption('-o, --output <path>').option('--per-sheet <n>', parseInt, 1)
  .action(async (file, opts) => { await run(ops.poster(requireFile(file), opts)); });

// ── Watermark & Stamp ────────────────────────────────────────

program.command('watermark').argument('<file>').requiredOption('-o, --output <path>')
  .requiredOption('--text <text>').option('--font-size <n>', parseInt, 30).option('--opacity <n>', parseFloat, 0.5).option('--rotation <deg>', parseInt, 45)
  .action(async (file, opts) => { await run(ops.watermark(requireFile(file), opts)); });

program.command('page-numbers').argument('<file>').requiredOption('-o, --output <path>')
  .option('--text <fmt>', '{n}/{total}').option('--position <pos>', 'bottom-right').option('--start <n>', parseInt, 1)
  .action(async (file, opts) => { await run(ops.pageNumbers(requireFile(file), opts)); });

program.command('stamp').argument('<file>').requiredOption('--stamp-file <path>').requiredOption('-o, --output <path>')
  .option('--all-pages', false)
  .action(async (file, opts) => { requireFile(opts.stampFile); await run(ops.stamp(requireFile(file), opts)); });

program.command('overlay').argument('<file>').requiredOption('--overlay-file <path>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { requireFile(opts.overlayFile); await run(ops.overlay(requireFile(file), opts)); });

program.command('overlay-image').argument('<file>').requiredOption('--image <path>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { requireFile(opts.image); await run(ops.overlayImage(requireFile(file), opts)); });

// ── Security ─────────────────────────────────────────────────

const sec = program.command('security').description('PDF security');

sec.command('lock').argument('<file>').requiredOption('-o, --output <path>')
  .requiredOption('--password <pw>').option('--owner-password <pw>').option('--key-length <n>', parseInt, 256)
  .action(async (file, opts) => { await run(ops.lock(requireFile(file), opts)); });

sec.command('unlock').argument('<file>').requiredOption('-o, --output <path>').requiredOption('--password <pw>')
  .action(async (file, opts) => { await run(ops.unlock(requireFile(file), opts)); });

sec.command('sign').argument('<file>').requiredOption('-o, --output <path>').requiredOption('--cert <path>')
  .option('--cert-password <pw>', '').option('--reason <s>', '').option('--location <s>', '').option('--name <s>', '')
  .action(async (file, opts) => { requireFile(opts.cert); await run(ops.sign(requireFile(file), opts)); });

sec.command('remove-signature').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.removeSignature(requireFile(file), opts)); });

sec.command('timestamp').argument('<file>').requiredOption('-o, --output <path>').requiredOption('--cert <path>')
  .option('--cert-password <pw>', '').option('--tsa-url <url>')
  .action(async (file, opts) => { requireFile(opts.cert); await run(ops.timestamp(requireFile(file), opts)); });

sec.command('validate').argument('<file>')
  .action(async (file) => { await run(ops.validate(requireFile(file), {})); });

sec.command('verify').argument('<file>')
  .action(async (file) => { await run(ops.verify(requireFile(file), {})); });

sec.command('sanitize').argument('<file>').requiredOption('-o, --output <path>')
  .option('--remove-js', true).option('--remove-embedded', true).option('--remove-metadata', true)
  .option('--remove-links', false).option('--remove-fonts', false)
  .action(async (file, opts) => { await run(ops.sanitize(requireFile(file), opts)); });

sec.command('redact').argument('<file>').requiredOption('-o, --output <path>')
  .option('--text <text...>', 'Text to redact').option('--regex', false).option('--color <color>', 'black').option('--whole-word', false)
  .action(async (file, opts) => {
    if (!opts.text || !opts.text.length) { console.error('Provide at least one --text'); process.exit(1); }
    await run(ops.redact(requireFile(file), { ...opts, text: opts.text }));
  });

// ── Info ─────────────────────────────────────────────────────

const info = program.command('info').description('PDF information');

info.command('all').argument('<file>').action(async (f) => { await run(ops.infoAll(requireFile(f), {})); });
info.command('basic').argument('<file>').action(async (f) => { await run(ops.infoBasic(requireFile(f), {})); });
info.command('security').argument('<file>').action(async (f) => { await run(ops.infoSecurity(requireFile(f), {})); });
info.command('fonts').argument('<file>').action(async (f) => { await run(ops.infoFonts(requireFile(f), {})); });
info.command('pages').argument('<file>').action(async (f) => { await run(ops.infoPages(requireFile(f), {})); });
info.command('dimensions').argument('<file>').action(async (f) => { await run(ops.infoDimensions(requireFile(f), {})); });
info.command('annotations').argument('<file>').action(async (f) => { await run(ops.infoAnnotations(requireFile(f), {})); });

const meta = program.command('metadata').description('Edit PDF metadata');

meta.command('set').argument('<file>').requiredOption('-o, --output <path>')
  .option('--title <s>', '').option('--author <s>', '').option('--subject <s>', '')
  .option('--keywords <s>', '').option('--creator <s>', '').option('--producer <s>', '')
  .action(async (file, opts) => { await run(ops.setMetadata(requireFile(file), opts)); });

// ── OCR ──────────────────────────────────────────────────────

program.command('ocr').argument('<file>').requiredOption('-o, --output <path>')
  .option('--languages <langs>', 'eng').option('--sidecar').option('--deskew').option('--clean').option('--clean-final')
  .option('--dpi <n>', parseInt, 300)
  .action(async (file, opts) => { await run(ops.ocr(requireFile(file), opts)); });

program.command('javascript').argument('<file>').description('Show embedded JavaScript')
  .action(async (file) => { await run(ops.showJs(requireFile(file), {})); });

// ── Images ───────────────────────────────────────────────────

const imgs = program.command('images').description('PDF image operations');

imgs.command('extract').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.extractImages(requireFile(file), opts)); });

imgs.command('extract-scans').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.extractScans(requireFile(file), opts)); });

imgs.command('remove').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.removeImages(requireFile(file), opts)); });

// ── Forms ────────────────────────────────────────────────────

const form = program.command('form').description('PDF form operations');

form.command('fields').argument('<file>').action(async (f) => { await run(ops.formFields(requireFile(f), {})); });
form.command('fields-coords').argument('<file>').action(async (f) => { await run(ops.formFieldsCoords(requireFile(f), {})); });

form.command('fill').argument('<file>').requiredOption('-o, --output <path>').option('--data <json>')
  .action(async (file, opts) => {
    const data = opts.data ? JSON.parse(opts.data) : {};
    await run(ops.formFill(requireFile(file), { output: opts.output, data }));
  });

form.command('modify').argument('<file>').requiredOption('-o, --output <path>').option('--data <json>')
  .action(async (file, opts) => {
    const data = opts.data ? JSON.parse(opts.data) : {};
    await run(ops.formModify(requireFile(file), { output: opts.output, data }));
  });

form.command('delete').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.formDelete(requireFile(file), opts)); });

form.command('unlock').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.formUnlock(requireFile(file), opts)); });

form.command('flatten').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.formFlatten(requireFile(file), opts)); });

// ── Attachments ──────────────────────────────────────────────

program.command('attach').argument('<file>').requiredOption('-o, --output <path>').argument('[attachments...]')
  .action(async (file, attachments, opts) => {
    requireFile(file);
    attachments.forEach(requireFile);
    await run(ops.addAttachments(file, { output: opts.output, attachments }));
  });

program.command('list-attachments').argument('<file>')
  .action(async (file) => { await run(ops.listAttachments(requireFile(file), {})); });

program.command('add-comments').argument('<file>').requiredOption('-o, --output <path>').option('--data <json>', '{}')
  .action(async (file, opts) => { await run(ops.addComments(requireFile(file), { output: opts.output, data: JSON.parse(opts.data) })); });

// ── Filters ──────────────────────────────────────────────────

const flt = program.command('filter').description('Filter pages');

flt.command('by-size').argument('<file>').requiredOption('-o, --output <path>')
  .option('--min <n>', parseFloat, 0).option('--max <n>', parseFloat, 0).option('--unit <u>', 'bytes')
  .action(async (file, opts) => { await run(ops.filterBySize(requireFile(file), opts)); });

flt.command('by-dimensions').argument('<file>').requiredOption('-o, --output <path>')
  .option('--width <n>', parseFloat, 0).option('--height <n>', parseFloat, 0).option('--tolerance <n>', parseFloat, 0.01)
  .action(async (file, opts) => { await run(ops.filterByDimensions(requireFile(file), opts)); });

// ── Misc ─────────────────────────────────────────────────────

program.command('auto-rename').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.autoRename(requireFile(file), opts)); });

program.command('auto-split').argument('<file>').requiredOption('-o, --output <path>').option('--mode <mode>', 'every-page')
  .action(async (file, opts) => { await run(ops.autoSplit(requireFile(file), opts)); });

program.command('repair').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.repair(requireFile(file), opts)); });

program.command('scan-effect').argument('<file>').requiredOption('-o, --output <path>')
  .action(async (file, opts) => { await run(ops.scanEffect(requireFile(file), opts)); });

program.command('mobile-scan').argument('<files...>').requiredOption('-o, --output <path>')
  .action(async (files, opts) => { files.forEach(requireFile); await run(ops.mobileScan(files, opts)); });

program.command('print').argument('<file>').description('Send to printer')
  .action(async (file) => { await run(ops.printFile(requireFile(file), {})); });

program.command('invert-color').argument('<file>').requiredOption('-o, --output <path>')
  .option('--replace-color <c>', '').option('--invert', false)
  .action(async (file, opts) => { await run(ops.invertColor(requireFile(file), opts)); });

program.command('toc').argument('<file>').requiredOption('-o, --output <path>').option('--data <json>', '{}')
  .action(async (file, opts) => { await run(ops.toc(requireFile(file), { output: opts.output, data: JSON.parse(opts.data) })); });

// Initialize client for all subcommands
program.hook('preAction', () => {
  if (!client) {
    const opts = program.opts();
    jsonMode = opts.json;
    client = new StirlingPdfClient({ baseUrl: opts.url, apiKey: opts.key });
  }
});

program.parse();
