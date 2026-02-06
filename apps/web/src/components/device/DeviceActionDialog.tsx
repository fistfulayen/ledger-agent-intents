import { type DeviceActionUiState, useLedger } from "@/lib/ledger-provider";
import {
	Button,
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
} from "@ledgerhq/lumen-ui-react";
import Lottie from "lottie-react";
import { useMemo } from "react";
import { type AnimationKey, type DeviceModel, getDeviceAnimation } from "./animations";

// =============================================================================
// Fallback icons (used when no lottie is available)
// =============================================================================

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

// =============================================================================
// Map UI state → animation key
// =============================================================================

function getAnimationKey(status: DeviceActionUiState["status"]): AnimationKey | null {
	switch (status) {
		case "unlock-device":
			return "pin";
		case "allow-secure-connection":
		case "open-app":
		case "confirm-open-app":
		case "verify-address":
		case "deriving-address":
			return "continueOnLedger";
		case "sign-transaction":
		case "sign-message":
		case "sign-typed-data":
			return "signTransaction";
		default:
			return null;
	}
}

// =============================================================================
// Status title mapping
// =============================================================================

function getStatusTitle(status: DeviceActionUiState["status"]): string {
	switch (status) {
		case "connecting":
			return "Connecting";
		case "deriving-address":
			return "Deriving Address";
		case "unlock-device":
			return "Unlock Device";
		case "allow-secure-connection":
			return "Secure Connection";
		case "open-app":
		case "confirm-open-app":
			return "Open App";
		case "sign-transaction":
			return "Confirm Transaction";
		case "sign-message":
			return "Sign Message";
		case "sign-typed-data":
			return "Sign Data";
		case "verify-address":
			return "Verify Address";
		case "success":
			return "Success";
		case "error":
			return "Error";
	}
}

// =============================================================================
// Component
// =============================================================================

export function DeviceActionDialog() {
	const { deviceActionState, deviceModelId, dismissDeviceAction } = useLedger();

	// Resolve the device model for animation lookup
	const deviceModel: DeviceModel = (deviceModelId as DeviceModel) ?? "generic";

	// Get the lottie animation data for the current state
	const animationData = useMemo(() => {
		if (!deviceActionState) return null;
		const key = getAnimationKey(deviceActionState.status);
		if (!key) return null;
		return getDeviceAnimation(deviceModel, key);
	}, [deviceActionState, deviceModel]);

	if (!deviceActionState) return null;

	const title = getStatusTitle(deviceActionState.status);
	const isError = deviceActionState.status === "error";
	const isSuccess = deviceActionState.status === "success";
	const isConnecting = deviceActionState.status === "connecting";
	const showDeviceHint =
		!isError && !isSuccess && !isConnecting && deviceActionState.status !== "deriving-address";

	return (
		<Dialog
			open={!!deviceActionState}
			onOpenChange={() => {
				/* managed programmatically */
			}}
		>
			<DialogContent>
				<DialogHeader
					appearance="compact"
					title={title}
					onClose={() => {
						/* closing is managed programmatically */
					}}
				/>
				<DialogBody>
					<div className="flex flex-col items-center gap-24 py-32">
						{/* Lottie animation or fallback icon */}
						{animationData ? (
							<div className="w-[200px] h-[200px] flex items-center justify-center">
								<Lottie
									animationData={animationData}
									loop
									autoplay
									style={{ width: "100%", height: "100%" }}
								/>
							</div>
						) : isSuccess ? (
							<div className="flex items-center justify-center size-64 rounded-full bg-success/10">
								<CheckIcon className="size-32 text-success" />
							</div>
						) : isError ? (
							<div className="flex items-center justify-center size-64 rounded-full bg-error/10">
								<AlertIcon className="size-32 text-error" />
							</div>
						) : (
							/* Connecting / deriving spinner */
							<div className="flex items-center justify-center size-64">
								<div className="size-40 border-4 border-muted border-t-interactive rounded-full animate-spin" />
							</div>
						)}

						{/* Message */}
						<p className={`body-1 text-center ${isError ? "text-error" : "text-base"}`}>
							{deviceActionState.message}
						</p>

						{/* Hint for device interaction states */}
						{showDeviceHint && (
							<p className="body-2 text-muted text-center">Check your Ledger device</p>
						)}
					</div>
				</DialogBody>

				{/* Allow dismissing error state */}
				{isError && (
					<DialogFooter>
						<Button appearance="transparent" size="md" onClick={dismissDeviceAction}>
							Close
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
