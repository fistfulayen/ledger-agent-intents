/**
 * Verify EIP-712 signature and establish a session cookie.
 * POST /api/auth/verify
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodRouter, jsonError } from "../_lib/http.js";

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		// Auth is intentionally disabled for now.
		jsonError(res, "Wallet auth is disabled", 501);
	},
});

