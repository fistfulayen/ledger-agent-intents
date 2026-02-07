/**
 * Proxy for Ledger DMK API calls.
 *
 * Forwards requests to Ledger backend APIs (CAL, Web3Checks, Metadata)
 * while injecting the LEDGER_API_KEY server-side so it is never exposed
 * to the browser.
 *
 * Usage:  GET/POST /api/ledger-proxy?target=cal&path=/dapps
 *         GET/POST /api/ledger-proxy?target=web3checks&path=/ethereum/scan/tx
 *         GET/POST /api/ledger-proxy?target=metadata&path=/v1/ethereum/...
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { env } from "./_lib/env.js";
import { setCorsHeaders } from "./_lib/http.js";
import { logger } from "./_lib/logger.js";

/** Ledger API key injected server-side */
const LEDGER_API_KEY = env.LEDGER_API_KEY;

/** Allowed upstream targets and their base URLs */
const UPSTREAM_TARGETS: Record<string, string> = {
	cal: "https://crypto-assets-service.api.ledger.com/v1",
	web3checks: "https://web3checks-backend.api.ledger.com/v3",
	metadata: "https://nft.api.live.ledger.com",
};

/** Headers we never forward to the upstream */
const STRIP_REQUEST_HEADERS = new Set([
	"host",
	"connection",
	"transfer-encoding",
	"cookie",
	"authorization",
]);

/** Headers we never forward back to the client */
const STRIP_RESPONSE_HEADERS = new Set(["transfer-encoding", "connection", "set-cookie"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
	setCorsHeaders(res, req);

	if (req.method === "OPTIONS") {
		res.status(200).end();
		return;
	}

	// Validate target
	const target = (Array.isArray(req.query.target) ? req.query.target[0] : req.query.target) ?? "";
	const baseUrl = UPSTREAM_TARGETS[target];
	if (!baseUrl) {
		res.status(400).json({
			error: `Invalid target: "${target}". Use: ${Object.keys(UPSTREAM_TARGETS).join(", ")}`,
		});
		return;
	}

	// Validate path
	const pathParam = (Array.isArray(req.query.path) ? req.query.path[0] : req.query.path) ?? "";
	if (!pathParam.startsWith("/")) {
		res.status(400).json({ error: 'Path must start with "/"' });
		return;
	}

	// Build upstream URL (preserve query params except target/path)
	const upstreamUrl = new URL(`${baseUrl}${pathParam}`);
	for (const [key, value] of Object.entries(req.query)) {
		if (key === "target" || key === "path") continue;
		const values = Array.isArray(value) ? value : [value];
		for (const v of values) {
			if (v !== undefined) upstreamUrl.searchParams.append(key, v);
		}
	}

	// Build upstream request headers
	const upstreamHeaders: Record<string, string> = {};
	for (const [key, value] of Object.entries(req.headers)) {
		if (STRIP_REQUEST_HEADERS.has(key.toLowerCase())) continue;
		if (typeof value === "string") {
			upstreamHeaders[key] = value;
		}
	}

	// Inject Ledger API key
	upstreamHeaders["X-Ledger-Client-Origin"] = LEDGER_API_KEY;

	try {
		const upstreamRes = await fetch(upstreamUrl.toString(), {
			method: req.method ?? "GET",
			headers: upstreamHeaders,
			body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
		});

		// Forward response headers
		for (const [key, value] of upstreamRes.headers.entries()) {
			if (STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) continue;
			res.setHeader(key, value);
		}

		// Forward status + body
		const body = await upstreamRes.arrayBuffer();
		res.status(upstreamRes.status).end(Buffer.from(body));
	} catch (err) {
		logger.error({ err, target, path: pathParam }, "Ledger proxy: upstream request failed");
		res.status(502).json({ error: "Upstream request failed" });
	}
}
