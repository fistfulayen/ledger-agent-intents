/**
 * Health check endpoint
 * GET /api/health
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodRouter, jsonSuccess } from "./_lib/http.js";

export default methodRouter({
	GET: async (_req: VercelRequest, res: VercelResponse) => {
		jsonSuccess(res, {
			status: "ok",
			timestamp: new Date().toISOString(),
		});
	},
});
