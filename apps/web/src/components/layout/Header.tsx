import { Button } from "@ledgerhq/lumen-ui-react";
import { useLedger } from "@/lib/ledger-provider";

// Ledger logo SVG
function LedgerLogo() {
	return (
		<svg
			width="28"
			height="24"
			viewBox="0 0 28 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M0 17.1429V24H10.5V22.2857H1.75V17.1429H0ZM26.25 17.1429V22.2857H17.5V24H28V17.1429H26.25ZM10.5 10.2857V17.1429H17.5V15.7143H12.25V10.2857H10.5ZM0 0V6.85714H1.75V1.71429H10.5V0H0ZM17.5 0V1.71429H26.25V6.85714H28V0H17.5Z"
				fill="white"
			/>
		</svg>
	);
}

export function Header() {
	const { account, isConnected, isConnecting, connect, disconnect } =
		useLedger();

	return (
		<header className="flex h-20 items-center justify-between px-10">
			{/* Left: Logo */}
			<div className="flex items-center">
				<LedgerLogo />
			</div>

			{/* Right: Actions */}
			<div className="flex items-center gap-3">
				<Button appearance="gray" size="md">
					History
				</Button>

				{isConnected ? (
					<Button appearance="gray" size="md" onClick={disconnect}>
						{account?.slice(0, 6)}...{account?.slice(-4)}
					</Button>
				) : (
					<Button
						appearance="gray"
						size="md"
						onClick={connect}
						disabled={isConnecting}
					>
						{isConnecting ? "Connecting..." : "Connect"}
					</Button>
				)}
			</div>
		</header>
	);
}
