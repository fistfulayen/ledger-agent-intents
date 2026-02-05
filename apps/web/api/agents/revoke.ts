/**
 * Agent revoke endpoint
 * POST /api/agents/revoke  { id: "uuid" }
 *
 * Dedicated endpoint to avoid Vercel routing issues with DELETE on
 * dynamic [id] routes.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodRouter, jsonSuccess, jsonError, parseBody } from "../_lib/http.js";
import { revokeMember } from "../_lib/agentsRepo.js";

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		const body = parseBody<{ id?: string }>(req);
		const id = body.id;

		if (!id) {
			jsonError(res, "Missing agent ID in request body", 400);
			return;
		}

		const member = await revokeMember(id);
		if (!member) {
			jsonError(res, "Agent not found or already revoked", 404);
			return;
		}

		console.log(`[Agent Revoked] ${member.id} "${member.label}" for trustchain ${member.trustchainId}`);
		jsonSuccess(res, { member });
	},
});
