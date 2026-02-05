/**
 * Return authenticated wallet.
 * GET /api/me
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodRouter, jsonError, jsonSuccess } from "./_lib/http.js";

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		// Auth is disabled; keep endpoint for compatibility.
		const wallet = (req.query.wallet as string | undefined) ?? "";
		if (!wallet) {
			jsonError(res, "Auth disabled (no session)", 401);
			return;
		}
		jsonSuccess(res, { walletAddress: wallet.toLowerCase() });
	},
});

