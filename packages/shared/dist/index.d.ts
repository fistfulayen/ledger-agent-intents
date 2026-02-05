/**
 * Shared types for Ledger Agent Payments system
 */
export type IntentStatus = "pending" | "approved" | "rejected" | "signed" | "confirmed" | "failed" | "expired";
export type IntentType = "transfer" | "swap" | "nft" | "contract";
export type IntentUrgency = "low" | "normal" | "high" | "critical";
export type PaymentCategory = "api_payment" | "subscription" | "purchase" | "p2p_transfer" | "defi" | "bill_payment" | "donation" | "other";
export interface Merchant {
    name: string;
    url?: string;
    logo?: string;
    verified?: boolean;
}
export interface TransferIntent {
    type: "transfer";
    token: string;
    tokenAddress?: string;
    tokenLogo?: string;
    amount: string;
    amountWei?: string;
    recipient: string;
    recipientEns?: string;
    chainId: number;
    memo?: string;
    resource?: string;
    merchant?: Merchant;
    category?: PaymentCategory;
}
export interface Intent {
    id: string;
    userId: string;
    agentId: string;
    agentName: string;
    details: TransferIntent;
    urgency: IntentUrgency;
    status: IntentStatus;
    createdAt: string;
    expiresAt?: string;
    reviewedAt?: string;
    signedAt?: string;
    confirmedAt?: string;
    txHash?: string;
    txUrl?: string;
    statusHistory: Array<{
        status: IntentStatus;
        timestamp: string;
        note?: string;
    }>;
}
export interface CreateIntentRequest {
    agentId: string;
    agentName: string;
    details: TransferIntent;
    urgency?: IntentUrgency;
    expiresInMinutes?: number;
}
export interface CreateIntentResponse {
    success: boolean;
    intent?: Intent;
    error?: string;
}
export interface IntentWebhook {
    event: "intent.created" | "intent.approved" | "intent.rejected" | "intent.signed" | "intent.confirmed" | "intent.failed" | "intent.expired";
    intent: Intent;
    timestamp: string;
}
export declare const SUPPORTED_CHAINS: {
    readonly 8453: {
        readonly name: "Base";
        readonly symbol: "ETH";
        readonly explorer: "https://basescan.org";
    };
    readonly 11155111: {
        readonly name: "Sepolia";
        readonly symbol: "ETH";
        readonly explorer: "https://sepolia.etherscan.io";
    };
    readonly 84532: {
        readonly name: "Base Sepolia";
        readonly symbol: "ETH";
        readonly explorer: "https://sepolia.basescan.org";
    };
};
export type SupportedChainId = keyof typeof SUPPORTED_CHAINS;
export declare const SUPPORTED_TOKENS: Record<SupportedChainId, Record<string, {
    address: string;
    decimals: number;
}>>;
/**
 * Get the block explorer URL for a transaction hash
 */
export declare function getExplorerTxUrl(chainId: number, txHash: string): string;
/**
 * Get the block explorer URL for an address
 */
export declare function getExplorerAddressUrl(chainId: number, address: string): string;
/**
 * Check if a chain ID is supported
 */
export declare function isSupportedChain(chainId: number): chainId is SupportedChainId;
/**
 * Get chain name by ID, or "Unknown" if not supported
 */
export declare function getChainName(chainId: number): string;
export declare function generateIntentId(): string;
export declare function formatAmount(amount: string, token: string): string;
//# sourceMappingURL=index.d.ts.map