/**
 * Verify EIP-712 signature and establish a session cookie.
 * POST /api/auth/verify
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import { methodRouter, jsonError, jsonSuccess, parseBody } from "../_lib/http.js";
import {
	buildAuthenticateTypedData,
	setSessionCookie,
	verifyTypedDataSignature,
} from "../_lib/auth.js";
import { sql } from "../_lib/db.js";

type Body = {
	challengeId: string;
	signature: `0x${string}` | string;
};

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		const body = parseBody<Body>(req);
		if (!body.challengeId) {
			jsonError(res, "challengeId required", 400);
			return;
		}
		if (!body.signature) {
			jsonError(res, "signature required", 400);
			return;
		}

		const challengeRes = await sql`
      SELECT id, wallet_address, nonce, chain_id, issued_at, expires_at, used_at
      FROM auth_challenges
      WHERE id = ${body.challengeId}
      LIMIT 1
    `;
		if (challengeRes.rows.length === 0) {
			jsonError(res, "Challenge not found", 404);
			return;
		}

		const row = challengeRes.rows[0] as {
			id: string;
			wallet_address: string;
			nonce: string;
			chain_id: number;
			issued_at: Date;
			expires_at: Date;
			used_at: Date | null;
		};

		if (row.used_at) {
			jsonError(res, "Challenge already used", 400);
			return;
		}

		const now = Date.now();
		if (row.expires_at.getTime() <= now) {
			jsonError(res, "Challenge expired", 400);
			return;
		}

		const issuedAt = Math.floor(row.issued_at.getTime() / 1000);
		const expiresAt = Math.floor(row.expires_at.getTime() / 1000);
		const typedData = buildAuthenticateTypedData({
			chainId: row.chain_id,
			walletAddress: row.wallet_address,
			nonce: row.nonce,
			issuedAt,
			expiresAt,
		});

		let recovered: string;
		try {
			recovered = await verifyTypedDataSignature({
				typedData,
				signature: body.signature as `0x${string}`,
			});
		} catch (e) {
			jsonError(res, e instanceof Error ? e.message : "Invalid signature", 400);
			return;
		}

		if (recovered !== row.wallet_address) {
			jsonError(res, "Signature does not match wallet", 403);
			return;
		}

		// Mark challenge as used (anti-replay)
		await sql`UPDATE auth_challenges SET used_at = NOW() WHERE id = ${row.id}`;

		const sessionId = randomUUID();
		const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
		await sql`
      INSERT INTO auth_sessions (id, wallet_address, expires_at)
      VALUES (${sessionId}, ${row.wallet_address}, ${sessionExpiresAt.toISOString()})
    `;

		setSessionCookie(res, sessionId, sessionExpiresAt);
		jsonSuccess(res, { walletAddress: row.wallet_address });
	},
});

