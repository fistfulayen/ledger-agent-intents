import { Spinner } from "@/components/ui/Spinner";
import { useLedger } from "@/lib/ledger-provider";
import { intentsQueryOptions } from "@/queries/intents";
import type { Intent } from "@agent-intents/shared";
import { useQuery } from "@tanstack/react-query";
import { IntentCard } from "./IntentCard";

// =============================================================================
// Helpers
// =============================================================================

/**
 * Sort intents: pending first, then by creation date (newest first)
 */
function sortIntents(intents: Intent[]): Intent[] {
	return [...intents].sort((a, b) => {
		// Pending intents first
		if (a.status === "pending" && b.status !== "pending") return -1;
		if (a.status !== "pending" && b.status === "pending") return 1;

		// Then by date (newest first)
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});
}

// =============================================================================
// Component
// =============================================================================

export function IntentList() {
	const { account, isConnected } = useLedger();

	const {
		data: intents,
		isLoading,
		error,
	} = useQuery({
		...intentsQueryOptions(account ?? ""),
		enabled: isConnected && !!account,
	});

	// Not connected state
	if (!isConnected) {
		return (
			<div className="flex flex-col items-center justify-center rounded-md border border-muted bg-surface p-48 text-center">
				<div className="mb-16 flex size-64 items-center justify-center rounded-full bg-muted">
					<svg
						width="32"
						height="32"
						viewBox="0 0 32 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<path
							d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4ZM16 8C17.1046 8 18 8.89543 18 10C18 11.1046 17.1046 12 16 12C14.8954 12 14 11.1046 14 10C14 8.89543 14.8954 8 16 8ZM18 22H14V14H18V22Z"
							fill="currentColor"
							className="text-muted"
						/>
					</svg>
				</div>
				<h3 className="heading-5-semi-bold text-base">Connect your Ledger</h3>
				<p className="mt-8 max-w-[320px] body-2 text-muted">
					Click the Connect button to connect your hardware wallet and view pending intents from your
					AI agents.
				</p>
			</div>
		);
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center rounded-md border border-muted bg-surface p-48">
				<Spinner size="lg" className="text-muted" />
				<p className="mt-16 body-2 text-muted">Loading intents...</p>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center rounded-md border border-error bg-error p-48 text-center">
				<div className="mb-16 flex size-64 items-center justify-center rounded-full bg-error-strong">
					<svg
						width="32"
						height="32"
						viewBox="0 0 32 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<path
							d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4ZM14 10H18V18H14V10ZM16 24C14.8954 24 14 23.1046 14 22C14 20.8954 14.8954 20 16 20C17.1046 20 18 20.8954 18 22C18 23.1046 17.1046 24 16 24Z"
							fill="currentColor"
							className="text-error"
						/>
					</svg>
				</div>
				<h3 className="heading-5-semi-bold text-error">Failed to load intents</h3>
				<p className="mt-8 max-w-[320px] body-2 text-error">{error.message}</p>
			</div>
		);
	}

	// Empty state
	if (!intents || intents.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-md border border-muted bg-surface p-48 text-center">
				<div className="mb-16 text-5xl">📋</div>
				<h3 className="heading-5-semi-bold text-base">No intents yet</h3>
				<p className="mt-8 max-w-[320px] body-2 text-muted">
					Intents from your AI agents will appear here. Create one using the CLI:
				</p>
				<code className="mt-16 rounded-sm bg-muted px-16 py-8 font-mono body-3 text-base">
					ledger-intent send 10 USDC to 0x... for "payment"
				</code>
			</div>
		);
	}

	// Intent list
	const sortedIntents = sortIntents(intents);
	const pendingCount = intents.filter((i) => i.status === "pending").length;

	return (
		<div className="flex flex-col gap-16">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-12">
					<h2 className="heading-4-semi-bold text-base">Your Intents</h2>
					{pendingCount > 0 && (
						<span className="rounded-xs bg-warning px-8 py-4 body-3 text-warning">
							{pendingCount} pending
						</span>
					)}
				</div>
				<span className="body-2 text-muted">{intents.length} total</span>
			</div>

			{/* Intent Cards */}
			<div className="flex flex-col gap-16">
				{sortedIntents.map((intent) => (
					<IntentCard key={intent.id} intent={intent} />
				))}
			</div>
		</div>
	);
}
