import { Button } from "@ledgerhq/lumen-ui-react";
import { Check, Copy, Devices, LedgerLogo } from "@ledgerhq/lumen-ui-react/symbols";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChainLogo } from "@/components/ui";
import { useLedger } from "@/lib/ledger-provider";

export function Header() {
	const { account, chainId, isConnected, isConnecting, openLedgerModal, disconnect } = useLedger();

	const [menuOpen, setMenuOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close the dropdown when clicking outside
	useEffect(() => {
		if (!menuOpen) return;
		function handleClick(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [menuOpen]);

	const handleCopy = useCallback(() => {
		if (!account) return;
		navigator.clipboard.writeText(account);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}, [account]);

	const handleDisconnect = useCallback(() => {
		setMenuOpen(false);
		disconnect();
	}, [disconnect]);

	return (
		<header className="flex h-80 items-center justify-between px-40">
			{/* Left: Logo */}
			<Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
				<LedgerLogo size={32} className="text-base" />
			</Link>

			{/* Right: Actions */}
			<div className="flex items-center gap-16">
				<Link to="/docs" className="body-2-semi-bold text-muted hover:text-base transition-colors">
					API Docs
				</Link>
				{isConnected ? (
					<div ref={menuRef} className="relative">
						{/* Connected button — chain logo + address + copy */}
						<div className="flex items-center rounded-full bg-muted overflow-hidden">
							<button
								type="button"
								onClick={() => setMenuOpen((p) => !p)}
								className="flex items-center gap-8 py-8 pl-12 pr-4 hover:bg-muted-hover transition-colors body-2-semi-bold text-base"
							>
								<ChainLogo chainId={chainId} size={20} />
								<span>
									{account?.slice(0, 6)}...{account?.slice(-4)}
								</span>
							</button>

							{/* Copy button (separated by a subtle divider) */}
							<div className="w-1 h-20 bg-muted-strong" />
							<button
								type="button"
								onClick={handleCopy}
								className="flex items-center justify-center size-36 hover:bg-muted-hover transition-colors"
								aria-label="Copy address"
							>
								{copied ? (
									<Check size={16} className="text-success" />
								) : (
									<Copy size={16} className="text-muted" />
								)}
							</button>
						</div>

						{/* Dropdown menu */}
						{menuOpen && (
							<div className="absolute right-0 mt-8 w-[200px] rounded-lg bg-canvas-sheet shadow-lg border border-muted p-4 z-50">
								<button
									type="button"
									onClick={handleDisconnect}
									className="flex w-full items-center gap-8 rounded-md px-12 py-10 body-2 text-error hover:bg-muted-transparent transition-colors"
								>
									Disconnect
								</button>
							</div>
						)}
					</div>
				) : (
					<Button
						appearance="gray"
						size="md"
						icon={Devices}
						onClick={openLedgerModal}
						disabled={isConnecting}
						loading={isConnecting}
					>
						Connect
					</Button>
				)}
			</div>
		</header>
	);
}
