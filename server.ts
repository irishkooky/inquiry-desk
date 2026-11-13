import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classify, matchedKeyword, splitInquiries, CATEGORIES } from './classify.ts';

const PORT = 3000;
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const SAMPLES = path.join(ROOT, 'samples', 'inquiries.txt');
/** 一括分類で一度に受け付ける最大件数（うっかり巨大な貼り付けをしたとき用） */
const BATCH_LIMIT = 500;

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

/** リクエスト本文の JSON から text を取り出す。JSON として壊れていれば null */
async function readText(req: http.IncomingMessage): Promise<string | null> {
  const raw = await readBody(req);
  try {
    const json: { text?: unknown } = JSON.parse(raw || '{}');
    return typeof json.text === 'string' ? json.text : '';
  } catch {
    return null;
  }
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/classify') {
      const text = await readText(req);
      if (text === null) {
        sendJson(res, 400, { error: 'invalid json' });
        return;
      }
      const category = classify(text);
      sendJson(res, 200, { category, keyword: matchedKeyword(text), text });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/classify/batch') {
      const text = await readText(req);
      if (text === null) {
        sendJson(res, 400, { error: 'invalid json' });
        return;
      }
      const lines = splitInquiries(text);
      if (lines.length === 0) {
        sendJson(res, 400, { error: '問い合わせが1件もありません' });
        return;
      }
      if (lines.length > BATCH_LIMIT) {
        sendJson(res, 400, { error: `一度に分類できるのは${BATCH_LIMIT}件までです（${lines.length}件）` });
        return;
      }
      const counts: Record<string, number> = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
      const results = lines.map((line) => {
        const category = classify(line);
        counts[category] = (counts[category] ?? 0) + 1;
        return { category, keyword: matchedKeyword(line), text: line };
      });
      sendJson(res, 200, { results, counts });
      return;
    }

    if (req.method === 'GET' && req.url === '/api/categories') {
      sendJson(res, 200, { categories: CATEGORIES });
      return;
    }

    if (req.method === 'GET' && req.url === '/api/samples') {
      // 先頭が # の行は説明コメントなので除く
      const lines = splitInquiries(fs.readFileSync(SAMPLES, 'utf8')).filter((l) => !l.startsWith('#'));
      sendJson(res, 200, { lines });
      return;
    }

    let filePath = path.join(PUBLIC, req.url === '/' || !req.url ? 'index.html' : req.url);
    if (!filePath.startsWith(PUBLIC)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    const type =
      ext === '.html' ? 'text/html; charset=utf-8' :
      ext === '.js' ? 'text/javascript; charset=utf-8' :
      ext === '.css' ? 'text/css; charset=utf-8' :
      'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    // サーバーのコンソールにも出す（どこで落ちたかを追いやすくするため）
    console.error(`[500] ${req.method} ${req.url}`, err);
    const message = err instanceof Error ? err.message : String(err);
    sendJson(res, 500, { error: message });
  }
});

const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
  console.log(`起動しました http://localhost:${PORT}`);
});
