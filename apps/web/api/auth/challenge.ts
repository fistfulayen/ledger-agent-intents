/**
 * Issue an EIP-712 authentication challenge for a wallet.
 * POST /api/auth/challenge
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import { methodRouter, jsonError, jsonSuccess, parseBody } from "../_lib/http.js";
import { buildAuthenticateTypedData, normalizeWalletAddress } from "../_lib/auth.js";
import { sql } from "../_lib/db.js";

type Body = {
	walletAddress: string;
	chainId: number;
};

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		const body = parseBody<Body>(req);

		if (!body.walletAddress) {
			jsonError(res, "walletAddress required", 400);
			return;
		}
		if (!body.chainId || typeof body.chainId !== "number") {
			jsonError(res, "chainId required", 400);
			return;
		}

		let walletAddress: string;
		try {
			walletAddress = normalizeWalletAddress(body.walletAddress);
		} catch (e) {
			jsonError(res, e instanceof Error ? e.message : "Invalid walletAddress", 400);
			return;
		}

		const id = randomUUID();
		const nonce = randomUUID();
		const issuedAt = Math.floor(Date.now() / 1000);
		const expiresAt = issuedAt + 5 * 60; // 5 minutes

		await sql`
      INSERT INTO auth_challenges (id, wallet_address, nonce, chain_id, issued_at, expires_at)
      VALUES (
        ${id},
        ${walletAddress},
        ${nonce},
        ${body.chainId},
        to_timestamp(${issuedAt}),
        to_timestamp(${expiresAt})
      )
    `;

		const typedData = buildAuthenticateTypedData({
			chainId: body.chainId,
			walletAddress,
			nonce,
			issuedAt,
			expiresAt,
		});

		jsonSuccess(res, { challengeId: id, typedData });
	},
});

