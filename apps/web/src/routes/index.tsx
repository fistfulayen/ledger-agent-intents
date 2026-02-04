import { createFileRoute } from "@tanstack/react-router";
import { useLedger } from "@/lib/ledger-provider";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const { isConnected, account } = useLedger();

	return (
		<div className="space-y-8">
			{/* Page header */}
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Agent Intents</h1>
				<p className="text-gray-400">
					Agents propose, humans sign with hardware
				</p>
			</div>

			{!isConnected ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-900 p-12 text-center">
					<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
						<svg
							width="32"
							height="32"
							viewBox="0 0 32 32"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4ZM16 8C17.1046 8 18 8.89543 18 10C18 11.1046 17.1046 12 16 12C14.8954 12 14 11.1046 14 10C14 8.89543 14.8954 8 16 8ZM18 22H14V14H18V22Z"
								fill="currentColor"
								className="text-gray-500"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-semibold">Connect your Ledger</h3>
					<p className="mt-2 max-w-sm text-gray-500">
						Click the Ledger button to connect your hardware wallet and view
						pending intents
					</p>
				</div>
			) : (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">Pending Intents</h2>
						<span className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-400">
							{account?.slice(0, 6)}...{account?.slice(-4)}
						</span>
					</div>

					{/* Intent list placeholder */}
					<div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
						<div className="mb-3 text-4xl">📋</div>
						<p className="text-gray-500">No pending intents</p>
						<p className="mt-1 text-sm text-gray-600">
							Intents from your AI agents will appear here
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
