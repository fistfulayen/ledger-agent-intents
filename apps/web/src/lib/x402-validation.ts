/**
 * x402 validation utilities for client-side checks before signing.
 */

import type { X402AcceptedExactEvm, X402Resource } from "@agent-intents/shared";

// =============================================================================
// Constants
// =============================================================================

/** Supported x402 EVM networks (Base mainnet + Base Sepolia for MVP) */
const SUPPORTED_X402_NETWORKS = new Set(["eip155:8453", "eip155:84532"]);

// =============================================================================
// Validation result type
// =============================================================================

export interface X402ValidationResult {
	valid: boolean;
	error?: string;
}

// =============================================================================
// Validation helpers
// =============================================================================

/**
 * Validate a URL is http(s).
 */
export function isValidHttpUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === "https:" || parsed.protocol === "http:";
	} catch {
		return false;
	}
}

/**
 * Validate an Ethereum address (0x + 40 hex chars).
 */
export function isValidEvmAddress(address: string): boolean {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate a uint256 decimal string (positive integer, no decimals).
 */
export function isValidUint256String(value: string): boolean {
	if (!/^\d+$/.test(value)) return false;
	try {
		const num = BigInt(value);
		// Max uint256
		return num >= 0n && num <= 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;
	} catch {
		return false;
	}
}

/**
 * Parse CAIP-2 eip155 network to chain ID.
 */
export function parseEip155ChainId(network: string): number | null {
	const match = /^eip155:(\d+)$/.exec(network);
	if (!match?.[1]) return null;
	return Number(match[1]);
}

/**
 * Validate x402 resource object.
 */
export function validateX402Resource(resource: X402Resource | undefined): X402ValidationResult {
	if (!resource) {
		return { valid: false, error: "Missing x402 resource" };
	}
	if (!resource.url) {
		return { valid: false, error: "Missing resource URL" };
	}
	if (!isValidHttpUrl(resource.url)) {
		return { valid: false, error: "Invalid resource URL (must be http/https)" };
	}
	return { valid: true };
}

/**
 * Validate x402 accepted payment requirements for EVM exact scheme.
 */
export function validateX402Accepted(accepted: X402AcceptedExactEvm | undefined): X402ValidationResult {
	if (!accepted) {
		return { valid: false, error: "Missing x402 payment requirements" };
	}

	// Scheme
	if (accepted.scheme !== "exact") {
		return { valid: false, error: `Unsupported x402 scheme: ${accepted.scheme}` };
	}

	// Network
	if (!SUPPORTED_X402_NETWORKS.has(accepted.network)) {
		return {
			valid: false,
			error: `Unsupported x402 network: ${accepted.network}. Supported: Base, Base Sepolia`,
		};
	}

	// Asset address
	if (!isValidEvmAddress(accepted.asset)) {
		return { valid: false, error: "Invalid asset address" };
	}

	// PayTo address
	if (!isValidEvmAddress(accepted.payTo)) {
		return { valid: false, error: "Invalid payTo address" };
	}

	// Amount (atomic units)
	if (!isValidUint256String(accepted.amount)) {
		return { valid: false, error: "Invalid amount (must be a positive integer in atomic units)" };
	}

	// EIP-712 domain name and version (required for reliable signature)
	if (!accepted.extra?.name) {
		return { valid: false, error: "Missing EIP-712 domain name (extra.name required)" };
	}
	if (!accepted.extra?.version) {
		return { valid: false, error: "Missing EIP-712 domain version (extra.version required)" };
	}

	return { valid: true };
}

/**
 * Full validation of x402 context before signing.
 */
export function validateX402ForSigning(
	resource: X402Resource | undefined,
	accepted: X402AcceptedExactEvm | undefined,
): X402ValidationResult {
	const resourceResult = validateX402Resource(resource);
	if (!resourceResult.valid) return resourceResult;

	const acceptedResult = validateX402Accepted(accepted);
	if (!acceptedResult.valid) return acceptedResult;

	return { valid: true };
}

/**
 * Format atomic units to human-readable amount.
 */
export function formatAtomicAmount(atomicAmount: string, decimals: number): string {
	try {
		const num = BigInt(atomicAmount);
		const divisor = BigInt(10 ** decimals);
		const intPart = num / divisor;
		const fracPart = num % divisor;
		const fracStr = fracPart.toString().padStart(decimals, "0").replace(/0+$/, "");
		if (fracStr) {
			return `${intPart}.${fracStr}`;
		}
		return intPart.toString();
	} catch {
		return atomicAmount;
	}
}

/**
 * Extract domain from URL for display.
 */
export function extractDomain(url: string): string {
	try {
		const parsed = new URL(url);
		return parsed.hostname;
	} catch {
		return url;
	}
}
