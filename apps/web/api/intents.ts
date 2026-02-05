/**
 * Create intent endpoint
 * POST /api/intents
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { CreateIntentRequest, IntentUrgency } from "@agent-intents/shared";
import { v4 as uuidv4 } from "uuid";
import { methodRouter, jsonSuccess, jsonError, parseBody } from "./_lib/http.js";
import { createIntent } from "./_lib/intentsRepo.js";

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		const body = parseBody<CreateIntentRequest & { userId?: string }>(req);

		// For hackathon, accept userId in body or default to 'demo-user'
		const userId = body.userId || "demo-user";

		// Validate required fields
		if (!body.agentId || !body.details) {
			jsonError(res, "Missing required fields", 400);
			return;
		}

		// Generate ID
		const id = `int_${Date.now()}_${uuidv4().slice(0, 8)}`;

		// Calculate expiration
		const expiresAt = body.expiresInMinutes
			? new Date(Date.now() + body.expiresInMinutes * 60 * 1000).toISOString()
			: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Default 24h

		const intent = await createIntent({
			id,
			userId,
			agentId: body.agentId,
			agentName: body.agentName || body.agentId,
			details: body.details,
			urgency: body.urgency || "normal",
			expiresAt,
		});

		console.log(
			`[Intent Created] ${intent.id} by ${intent.agentName}: ${intent.details.amount} ${intent.details.token} to ${intent.details.recipient}`
		);

		jsonSuccess(res, { intent }, 201);
	},
});
