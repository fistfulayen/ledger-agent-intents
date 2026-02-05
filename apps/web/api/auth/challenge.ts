/**
 * Issue an EIP-712 authentication challenge for a wallet.
 * POST /api/auth/challenge
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodRouter, jsonError } from "../_lib/http.js";

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		// Auth is intentionally disabled for now.
		jsonError(res, "Wallet auth is disabled", 501);
	},
});

