import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAddress, recoverTypedDataAddress } from "viem";
import { sql } from "./db.js";

const SESSION_COOKIE_NAME = "ai_session";

export function normalizeWalletAddress(addr: string): string {
	const trimmed = addr.trim();
	if (!isAddress(trimmed)) {
		throw new Error("Invalid wallet address");
	}
	return trimmed.toLowerCase();
}

export function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
	if (!cookieHeader) return {};
	const out: Record<string, string> = {};
	for (const part of cookieHeader.split(";")) {
		const [rawKey, ...rawValParts] = part.trim().split("=");
		if (!rawKey) continue;
		out[rawKey] = decodeURIComponent(rawValParts.join("=") || "");
	}
	return out;
}

export function setSessionCookie(res: VercelResponse, sessionId: string, expiresAt: Date) {
	const isProd = process.env.NODE_ENV === "production";
	const cookie = [
		`${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		isProd ? "Secure" : "",
		`Expires=${expiresAt.toUTCString()}`,
	].filter(Boolean).join("; ");
	res.setHeader("Set-Cookie", cookie);
}

export function clearSessionCookie(res: VercelResponse) {
	const isProd = process.env.NODE_ENV === "production";
	const cookie = [
		`${SESSION_COOKIE_NAME}=`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		isProd ? "Secure" : "",
		"Expires=Thu, 01 Jan 1970 00:00:00 GMT",
	].filter(Boolean).join("; ");
	res.setHeader("Set-Cookie", cookie);
}

export async function requireSession(req: VercelRequest): Promise<{ sessionId: string; walletAddress: string }> {
	const cookies = parseCookieHeader(req.headers.cookie);
	const sessionId = cookies[SESSION_COOKIE_NAME];
	if (!sessionId) {
		throw new Error("Unauthorized");
	}

	const now = new Date().toISOString();
	const result = await sql`
    SELECT id, wallet_address
    FROM auth_sessions
    WHERE id = ${sessionId} AND expires_at > ${now}
    LIMIT 1
  `;
	if (result.rows.length === 0) {
		throw new Error("Unauthorized");
	}

	const row = result.rows[0] as { id: string; wallet_address: string };
	return { sessionId: row.id, walletAddress: row.wallet_address };
}

export type AuthenticateTypedData = {
	domain: {
		name: string;
		version: string;
		chainId: bigint;
		verifyingContract: `0x${string}`;
	};
	types: {
		EIP712Domain: Array<{ name: string; type: string }>;
		Authenticate: Array<{ name: string; type: string }>;
	};
	primaryType: "Authenticate";
	message: {
		wallet: `0x${string}`;
		nonce: string;
		issuedAt: bigint;
		expiresAt: bigint;
	};
};

export function buildAuthenticateTypedData(params: {
	chainId: number;
	walletAddress: string;
	nonce: string;
	issuedAt: number; // epoch seconds
	expiresAt: number; // epoch seconds
}): AuthenticateTypedData {
	return {
		domain: {
			name: "AgentIntents",
			version: "1",
			chainId: BigInt(params.chainId),
			verifyingContract: "0x0000000000000000000000000000000000000000",
		},
		types: {
			EIP712Domain: [
				{ name: "name", type: "string" },
				{ name: "version", type: "string" },
				{ name: "chainId", type: "uint256" },
				{ name: "verifyingContract", type: "address" },
			],
			Authenticate: [
				{ name: "wallet", type: "address" },
				{ name: "nonce", type: "string" },
				{ name: "issuedAt", type: "uint256" },
				{ name: "expiresAt", type: "uint256" },
			],
		},
		primaryType: "Authenticate",
		message: {
			wallet: params.walletAddress as `0x${string}`,
			nonce: params.nonce,
			issuedAt: BigInt(params.issuedAt),
			expiresAt: BigInt(params.expiresAt),
		},
	};
}

export async function verifyTypedDataSignature(params: {
	typedData: AuthenticateTypedData;
	signature: `0x${string}`;
}): Promise<string> {
	const recovered = await recoverTypedDataAddress({
		domain: params.typedData.domain,
		types: params.typedData.types,
		primaryType: params.typedData.primaryType,
		message: params.typedData.message,
		signature: params.signature,
	});
	return recovered.toLowerCase();
}

