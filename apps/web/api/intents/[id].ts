/**
 * Get intent by ID endpoint
 * GET /api/intents/:id
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodRouter, jsonSuccess, jsonError } from "../_lib/http.js";
import { getIntentById } from "../_lib/intentsRepo.js";

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
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

		jsonSuccess(res, { intent });
	},
});
