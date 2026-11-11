// Vercel serverless function: POST /api/chat (the "Ask Bit" chatbot)
// The API key lives only here (Vercel → Settings → Environment Variables), never in the browser.
import { handleChatHttp } from '../server/chatRoute.js';

export function POST(request: Request): Promise<Response> {
  return handleChatHttp(request, process.env);
}
