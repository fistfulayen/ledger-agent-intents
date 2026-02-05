/**
 * Get intent by ID endpoint
 * GET /api/intents/:id
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodRouter, jsonSuccess, jsonError } from "../_lib/http.js";
import { getIntentById } from "../_lib/intentsRepo.js";
import { requireSession } from "../_lib/auth.js";

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		let sessionWallet: string;
		try {
			const session = await requireSession(req);
			sessionWallet = session.walletAddress;
		} catch {
			jsonError(res, "Unauthorized", 401);
			return;
		}

		const { id } = req.query;
		const intentId = Array.isArray(id) ? id[0] : id;

		if (!intentId) {
			jsonError(res, "Intent ID required", 400);
			return;
		}

		const intent = await getIntentById(intentId);

		if (!intent) {
			jsonError(res, "Intent not found", 404);
			return;
		}

		if (intent.userId.toLowerCase() !== sessionWallet) {
			jsonError(res, "Forbidden", 403);
			return;
		}

		jsonSuccess(res, { intent });
	},
});
