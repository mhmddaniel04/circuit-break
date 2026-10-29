// Vercel serverless function: POST /api/hint
// The API key lives only here (Vercel → Settings → Environment Variables), never in the browser.
import { handleHintHttp } from '../server/hintRoute.js';

export function POST(request: Request): Promise<Response> {
  return handleHintHttp(request, process.env);
}