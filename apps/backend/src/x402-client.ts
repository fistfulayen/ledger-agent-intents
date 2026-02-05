/**
 * x402 Client Utilities
 *
 * Helper functions for agents to handle x402 payment flows.
 * This module provides the building blocks for integrating x402 payments
 * into any agent or application.
 */

import type {
	CreateIntentRequest,
	Intent,
	X402AcceptedExactEvm,
	X402Resource,
	X402SettlementReceipt,
} from "@agent-intents/shared";

// =============================================================================
// Types
// =============================================================================

export interface X402PaymentRequired {
	x402Version: number;
	resource: X402Resource;
	accepted: X402AcceptedExactEvm[];
}

export interface X402ClientConfig {
	/** Base URL of the intents API */
	apiBaseUrl: string;
	/** User wallet address */
	userWallet: string;
	/** Agent ID */
	agentId: string;
	/** Agent display name */
	agentName: string;
	/** Polling interval in milliseconds (default: 2000) */
	pollIntervalMs?: number;
	/** Maximum wait time in milliseconds (default: 300000 = 5 minutes) */
	maxWaitMs?: number;
}

export interface X402FetchResult {
	/** Whether the request was successful */
	success: boolean;
	/** The response data if successful */
	data?: unknown;
	/** Error message if failed */
	error?: string;
	/** The intent that was created/used for payment */
	intent?: Intent;
	/** Settlement receipt if payment was processed */
	settlementReceipt?: X402SettlementReceipt;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Decode base64-encoded PAYMENT-REQUIRED header
 */
export function decodePaymentRequired(header: string): X402PaymentRequired {
	const decoded = Buffer.from(header, "base64").toString("utf-8");
	return JSON.parse(decoded);
}

/**
 * Decode base64-encoded PAYMENT-RESPONSE header
 */
export function decodePaymentResponse(header: string): X402SettlementReceipt {
	const decoded = Buffer.from(header, "base64").toString("utf-8");
	return JSON.parse(decoded);
}

/**
 * Parse CAIP-2 network string to chain ID
 */
export function parseChainId(network: string): number {
	const match = /^eip155:(\d+)$/.exec(network);
	return match?.[1] ? Number(match[1]) : 0;
}

/**
 * Format atomic amount to human-readable string
 */
export function formatAtomicAmount(amount: string, decimals: number): string {
	const num = BigInt(amount);
	const divisor = BigInt(10 ** decimals);
	const intPart = num / divisor;
	const fracPart = num % divisor;
	const fracStr = fracPart.toString().padStart(decimals, "0").replace(/0+$/, "");
	return fracStr ? `${intPart}.${fracStr}` : intPart.toString();
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// =============================================================================
// x402 Client Class
// =============================================================================

export class X402Client {
	private config: Required<X402ClientConfig>;

	constructor(config: X402ClientConfig) {
		this.config = {
			pollIntervalMs: 2000,
			maxWaitMs: 300000,
			...config,
		};
	}

	/**
	 * Create an intent for an x402 payment
	 */
	async createIntent(
		resource: X402Resource,
		accepted: X402AcceptedExactEvm
	): Promise<Intent | null> {
		const intentRequest: CreateIntentRequest & { userId: string } = {
			userId: this.config.userWallet,
			agentId: this.config.agentId,
			agentName: this.config.agentName,
			details: {
				type: "transfer",
				token: "USDC",
				tokenAddress: accepted.asset,
				amount: formatAtomicAmount(accepted.amount, 6),
				recipient: accepted.payTo,
				chainId: parseChainId(accepted.network),
				memo: `API payment for ${extractDomain(resource.url)}`,
				resource: resource.url,
				category: "api_payment",
				x402: {
					resource,
					accepted,
				},
			},
			urgency: "normal",
			expiresInMinutes: 10,
		};

		const response = await fetch(`${this.config.apiBaseUrl}/api/intents`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(intentRequest),
		});

		const data = await response.json();
		return data.intent ?? null;
	}

	/**
	 * Get an intent by ID
	 */
	async getIntent(intentId: string): Promise<Intent | null> {
		const response = await fetch(
			`${this.config.apiBaseUrl}/api/intents/${intentId}`
		);
		const data = await response.json();
		return data.intent ?? null;
	}

	/**
	 * Poll for intent authorization
	 */
	async waitForAuthorization(intentId: string): Promise<Intent | null> {
		const startTime = Date.now();

		while (Date.now() - startTime < this.config.maxWaitMs) {
			const intent = await this.getIntent(intentId);

			if (!intent) {
				return null;
			}

			if (intent.status === "authorized") {
				return intent;
			}

			if (intent.status === "rejected" || intent.status === "expired") {
				return null;
			}

			await sleep(this.config.pollIntervalMs);
		}

		return null;
	}

	/**
	 * Update intent with settlement receipt
	 */
	async confirmIntent(
		intentId: string,
		receipt: X402SettlementReceipt
	): Promise<Intent | null> {
		const response = await fetch(
			`${this.config.apiBaseUrl}/api/intents/${intentId}/status`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					status: "confirmed",
					settlementReceipt: receipt,
				}),
			}
		);

		const data = await response.json();
		return data.intent ?? null;
	}

	/**
	 * Handle a 402 response by creating an intent and waiting for authorization
	 * Returns the payment signature header to use for retry
	 */
	async handlePaymentRequired(
		paymentRequiredHeader: string
	): Promise<{ paymentSignatureHeader: string; intent: Intent } | null> {
		// Decode the header
		const paymentRequired = decodePaymentRequired(paymentRequiredHeader);

		// Get the first accepted scheme (EVM exact)
		const accepted = paymentRequired.accepted[0];
		if (!accepted) {
			console.error("No accepted payment scheme found");
			return null;
		}

		// Create intent
		const intent = await this.createIntent(
			paymentRequired.resource,
			accepted
		);
		if (!intent) {
			console.error("Failed to create intent");
			return null;
		}

		console.log(`Intent created: ${intent.id}`);
		console.log("Waiting for user authorization...");

		// Wait for authorization
		const authorizedIntent = await this.waitForAuthorization(intent.id);
		if (!authorizedIntent) {
			console.error("Authorization failed or timed out");
			return null;
		}

		// Extract payment signature
		const paymentSignatureHeader =
			authorizedIntent.details.x402?.paymentSignatureHeader;
		if (!paymentSignatureHeader) {
			console.error("No payment signature header found");
			return null;
		}

		return { paymentSignatureHeader, intent: authorizedIntent };
	}

	/**
	 * Complete the payment flow by confirming with settlement receipt
	 */
	async completePayment(
		intentId: string,
		paymentResponseHeader: string
	): Promise<Intent | null> {
		const receipt = decodePaymentResponse(paymentResponseHeader);
		return this.confirmIntent(intentId, receipt);
	}
}

// =============================================================================
// High-Level Fetch Wrapper
// =============================================================================

/**
 * Fetch wrapper that automatically handles x402 payment flows
 *
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param x402Config - x402 client configuration
 * @returns Fetch result with payment information
 */
export async function x402Fetch(
	url: string,
	options: RequestInit = {},
	x402Config: X402ClientConfig
): Promise<X402FetchResult> {
	const client = new X402Client(x402Config);

	// Make initial request
	const response = await fetch(url, options);

	// If not a 402, return the response as-is
	if (response.status !== 402) {
		if (response.ok) {
			return {
				success: true,
				data: await response.json().catch(() => response.text()),
			};
		}
		return {
			success: false,
			error: `HTTP ${response.status}: ${response.statusText}`,
		};
	}

	// Handle 402 Payment Required
	const paymentRequiredHeader = response.headers.get("PAYMENT-REQUIRED");
	if (!paymentRequiredHeader) {
		return {
			success: false,
			error: "402 response missing PAYMENT-REQUIRED header",
		};
	}

	// Process payment
	const paymentResult = await client.handlePaymentRequired(paymentRequiredHeader);
	if (!paymentResult) {
		return {
			success: false,
			error: "Payment authorization failed",
		};
	}

	// Retry with payment signature
	const retryResponse = await fetch(url, {
		...options,
		headers: {
			...options.headers,
			"PAYMENT-SIGNATURE": paymentResult.paymentSignatureHeader,
		},
	});

	if (!retryResponse.ok) {
		return {
			success: false,
			error: `Retry failed: HTTP ${retryResponse.status}`,
			intent: paymentResult.intent,
		};
	}

	// Extract settlement receipt
	const paymentResponseHeader = retryResponse.headers.get("PAYMENT-RESPONSE");
	let settlementReceipt: X402SettlementReceipt | undefined;

	if (paymentResponseHeader) {
		settlementReceipt = decodePaymentResponse(paymentResponseHeader);

		// Confirm the intent with receipt
		await client.confirmIntent(paymentResult.intent.id, settlementReceipt);
	}

	return {
		success: true,
		data: await retryResponse.json().catch(() => retryResponse.text()),
		intent: paymentResult.intent,
		settlementReceipt,
	};
}
