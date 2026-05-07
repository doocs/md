/**
 * Stirling PDF HTTP client.
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import { createReadStream, readFileSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { basename, dirname, join, resolve } from 'path';

export class StirlingPdfClient {
  constructor({ baseUrl, apiKey } = {}) {
    this.baseUrl = (baseUrl || process.env.STIRLING_PDF_URL || 'https://pdf.tc.abp.top').replace(/\/+$/, '');
    this.apiKey = apiKey || process.env.STIRLING_PDF_API_KEY || '';
    this.timeout = 120_000;
  }

  get headers() {
    const h = {};
    if (this.apiKey) h['X-API-KEY'] = this.apiKey;
    return h;
  }

  /** Check server health. */
  async health() {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/info/status`, {
        headers: this.headers,
        signal: AbortSignal.timeout(this.timeout),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return { status: 'unreachable', url: this.baseUrl };
    }
  }

  /**
   * Upload file(s) to an endpoint.
   * @param {string} endpoint
   * @param {object} filesMap  { fieldName: filePath, ... }
   * @param {object} [data]    extra form fields
   * @param {string} [outputPath]
   */
  async upload(endpoint, filesMap, data = {}, outputPath) {
    const form = new FormData();
    for (const [field, filePath] of Object.entries(filesMap)) {
      const abs = resolve(filePath);
      form.append(field, createReadStream(abs), {
        filename: basename(abs),
        contentType: 'application/octet-stream',
      });
    }
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined && v !== null && v !== '') form.append(k, String(v));
    }

    const res = await fetch(`${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`, {
      method: 'POST',
      headers: { ...this.headers, ...form.getHeaders() },
      body: form,
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    const ct = res.headers.get('content-type') || '';
    const result = { status: res.status, contentType: ct };

    if (ct.includes('application/json')) {
      result.data = await res.json();
    } else if (outputPath) {
      const buf = Buffer.from(await res.arrayBuffer());
      const out = resolve(outputPath);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, buf);
      result.output = out;
      result.size = buf.length;
    } else {
      result.bytes = Buffer.from(await res.arrayBuffer());
    }

    return result;
  }

  /** POST JSON. */
  async postJson(endpoint, payload) {
    const res = await fetch(`${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.headers },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.timeout),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    return ct.includes('json') ? await res.json() : { status: res.status };
  }

  /** GET endpoint. */
  async get(endpoint) {
    const res = await fetch(`${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`, {
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeout),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    return ct.includes('json') ? await res.json() : { status: res.status };
  }
}
