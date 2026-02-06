import { type DeviceActionUiState, useLedger } from "@/lib/ledger-provider";
import { Button, Dialog, DialogBody, DialogContent, DialogHeader } from "@ledgerhq/lumen-ui-react";

// =============================================================================
// Icon Components
// =============================================================================

function SpinnerIcon({ className }: { className?: string }) {
	return (
		<svg
			className={`animate-spin ${className ?? ""}`}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			role="img"
			aria-label="Loading"
		>
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	);
}

function CheckIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="2"
			stroke="currentColor"
			role="img"
			aria-label="Success"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	);
}

function AlertIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="2"
			stroke="currentColor"
			role="img"
			aria-label="Error"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
			/>
		</svg>
	);
}

function LedgerDeviceIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="Ledger device"
		>
			<rect x="8" y="12" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
			<rect x="14" y="18" width="20" height="12" rx="2" fill="currentColor" opacity="0.15" />
			<circle cx="36" cy="24" r="2" fill="currentColor" />
		</svg>
	);
}

// =============================================================================
// Status Configuration
// =============================================================================

type StatusConfig = {
	icon: React.ReactNode;
	title: string;
	animate: boolean;
};

function getStatusConfig(state: DeviceActionUiState): StatusConfig {
	switch (state.status) {
		case "connecting":
		case "deriving-address":
			return {
				icon: <SpinnerIcon className="size-48 text-interactive" />,
				title: "Connecting",
				animate: true,
			};
		case "unlock-device":
			return {
				icon: <LedgerDeviceIcon className="size-48 text-warning" />,
				title: "Unlock Device",
				animate: false,
			};
		case "allow-secure-connection":
			return {
				icon: <LedgerDeviceIcon className="size-48 text-interactive" />,
				title: "Secure Connection",
				animate: false,
			};
		case "open-app":
		case "confirm-open-app":
			return {
				icon: <LedgerDeviceIcon className="size-48 text-interactive" />,
				title: "Open App",
				animate: false,
			};
		case "sign-transaction":
			return {
				icon: <LedgerDeviceIcon className="size-48 text-interactive" />,
				title: "Confirm Transaction",
				animate: false,
			};
		case "sign-message":
			return {
				icon: <LedgerDeviceIcon className="size-48 text-interactive" />,
				title: "Sign Message",
				animate: false,
			};
		case "sign-typed-data":
			return {
				icon: <LedgerDeviceIcon className="size-48 text-interactive" />,
				title: "Sign Data",
				animate: false,
			};
		case "verify-address":
			return {
				icon: <LedgerDeviceIcon className="size-48 text-interactive" />,
				title: "Verify Address",
				animate: false,
			};
		case "success":
			return {
				icon: <CheckIcon className="size-48 text-success" />,
				title: "Success",
				animate: false,
			};
		case "error":
			return {
				icon: <AlertIcon className="size-48 text-error" />,
				title: "Error",
				animate: false,
			};
	}
}

// =============================================================================
// Component
// =============================================================================

export function DeviceActionDialog() {
	const { deviceActionState } = useLedger();

	if (!deviceActionState) return null;

	const config = getStatusConfig(deviceActionState);
	const isError = deviceActionState.status === "error";

	return (
		<Dialog
			open={!!deviceActionState}
			onOpenChange={() => {
				// Only allow closing on error/success states (auto-dismiss handles success)
			}}
		>
			<DialogContent>
				<DialogHeader
					appearance="compact"
					title={config.title}
					onClose={() => {
						// Allow closing only on error state
					}}
				/>
				<DialogBody>
					<div className="flex flex-col items-center gap-24 py-32">
						{/* Icon */}
						<div className={config.animate ? "animate-pulse" : undefined}>{config.icon}</div>

						{/* Message */}
						<p className={`body-1 text-center ${isError ? "text-error" : "text-base"}`}>
							{deviceActionState.message}
						</p>

						{/* Hint for device interaction states */}
						{!isError &&
							deviceActionState.status !== "success" &&
							deviceActionState.status !== "connecting" &&
							deviceActionState.status !== "deriving-address" && (
								<p className="body-2 text-muted text-center">Check your Ledger device</p>
							)}
					</div>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
