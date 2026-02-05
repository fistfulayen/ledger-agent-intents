/**
 * Get user intents endpoint
 * GET /api/users/:userId/intents
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { IntentStatus } from "@agent-intents/shared";
import { methodRouter, jsonSuccess, getQueryParam, getQueryNumber } from "../../_lib/http.js";
import { getIntentsByUser } from "../../_lib/intentsRepo.js";
import { requireSession, normalizeWalletAddress } from "../../_lib/auth.js";

const VALID_STATUSES: IntentStatus[] = [
	"pending",
	"approved",
	"rejected",
	"signed",
	"confirmed",
	"failed",
	"expired",
];

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		// Require session and only allow fetching for the authenticated wallet.
		let sessionWallet: string;
		try {
			const session = await requireSession(req);
			sessionWallet = session.walletAddress;
		} catch {
			res.status(401).json({ success: false, error: "Unauthorized" });
			return;
		}

		const { userId } = req.query;
		const userIdStr = Array.isArray(userId) ? userId[0] : userId;

		if (!userIdStr) {
			res.status(400).json({ success: false, error: "User ID required" });
			return;
		}

		let requestedWallet: string;
		try {
			requestedWallet = normalizeWalletAddress(userIdStr);
		} catch {
			res.status(400).json({ success: false, error: "Invalid userId" });
			return;
		}

		if (requestedWallet !== sessionWallet) {
			res.status(403).json({ success: false, error: "Forbidden" });
			return;
		}

		// Parse optional filters
		const statusParam = getQueryParam(req, "status");
		const status = statusParam && VALID_STATUSES.includes(statusParam as IntentStatus)
			? (statusParam as IntentStatus)
			: undefined;

		const limit = getQueryNumber(req, "limit", 50, 1, 100);

		const intents = await getIntentsByUser({
			userId: userIdStr,
			status,
			limit,
		});

		jsonSuccess(res, { intents });
	},
});
