/**
 * Update intent status endpoint
 * PATCH /api/intents/:id/status
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { IntentStatus, X402PaymentPayload, X402SettlementReceipt } from "@agent-intents/shared";
import { methodRouter, jsonSuccess, jsonError, parseBody } from "../../_lib/http.js";
import { getIntentById, updateIntentStatus } from "../../_lib/intentsRepo.js";

interface UpdateStatusBody {
	status: IntentStatus;
	txHash?: string;
	note?: string;
	paymentSignatureHeader?: string;
	paymentPayload?: X402PaymentPayload;
	settlementReceipt?: X402SettlementReceipt;
}

const VALID_STATUSES: IntentStatus[] = [
	"pending",
	"approved",
	"rejected",
	"signed",
	"authorized", // x402 payment authorization ready for agent
	"confirmed",
	"failed",
	"expired",
];

export default methodRouter({
	PATCH: async (req: VercelRequest, res: VercelResponse) => {
		const { id } = req.query;
		const intentId = Array.isArray(id) ? id[0] : id;

		if (!intentId) {
			jsonError(res, "Intent ID required", 400);
			return;
		}

		const existing = await getIntentById(intentId);
		if (!existing) {
			jsonError(res, "Intent not found", 404);
			return;
		}

		const body = parseBody<UpdateStatusBody>(req);

		if (!body.status || !VALID_STATUSES.includes(body.status)) {
			jsonError(res, "Valid status required", 400);
			return;
		}

		const intent = await updateIntentStatus({
			id: intentId,
			status: body.status,
			txHash: body.txHash,
			note: body.note,
			paymentSignatureHeader: body.paymentSignatureHeader,
			paymentPayload: body.paymentPayload,
			settlementReceipt: body.settlementReceipt,
		});

		if (!intent) {
			jsonError(res, "Intent not found", 404);
			return;
		}

		console.log(
			`[Intent ${body.status.toUpperCase()}] ${intent.id}${body.txHash ? ` tx: ${body.txHash}` : ""}`
		);

		jsonSuccess(res, { intent });
	},
});
