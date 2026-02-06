/**
 * Device-specific Lottie animation data.
 *
 * Each device model has animations for key interaction states.
 * Nano S and Nano SP share the same assets.
 */

import type { DeviceModelId } from "@ledgerhq/device-management-kit";

// Stax
import StaxPin from "./stax/01_STAX_DARK_PIN.json";
import StaxContinue from "./stax/04_STAX_DARK_CONTINUE_ON_LEDGER.json";
import StaxSign from "./stax/05_STAX_DARK_SIGN_TRANSACTION.json";

// Flex (Europa)
import FlexPin from "./flex/01_EUROPA_DARK_PIN.json";
import FlexContinue from "./flex/04_EUROPA_DARK_CONTINUE_ON_LEDGER.json";
import FlexSign from "./flex/05_EUROPA_DARK_SIGN_TRANSACTION.json";

// Nano S / Nano SP
import NanoSPin from "./nanosp/01_NANO_S_DARK_PIN.json";
import NanoSContinue from "./nanosp/02_NANO_S_DARK_CONTINUE_ON_YOUR_LEDGER.json";

// Nano X
import NanoXPin from "./nanox/01_NANO_X_DARK_PIN.json";
import NanoXContinue from "./nanox/03_NANO_X_DARK_CONTINUE_ON_YOUR_LEDGER.json";

// Apex (Nano Gen 5)
import ApexPin from "./apex/01_APEX_DARK_PIN.json";
import ApexContinue from "./apex/02_APEX_DARK_CONTINUE_ON_LEDGER.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The animation keys supported for each device model.
 */
export type AnimationKey = "pin" | "continueOnLedger" | "signTransaction";

// Re-export for convenience
export type { DeviceModelId };

// ---------------------------------------------------------------------------
// Animation map  — keyed by DeviceModelId values from the DMK
// ---------------------------------------------------------------------------

type AnimationSet = Record<AnimationKey, object | null>;

/**
 * Map from `DeviceModelId` string values to their Lottie animation sets.
 * Unknown / future model IDs gracefully fall back to the Flex set.
 */
const animationMap: Record<string, AnimationSet> = {
	// Ledger Stax (touch-screen e-ink)
	stax: {
		pin: StaxPin,
		continueOnLedger: StaxContinue,
		signTransaction: StaxSign,
	},
	// Ledger Flex (touch-screen)
	flex: {
		pin: FlexPin,
		continueOnLedger: FlexContinue,
		signTransaction: FlexSign,
	},
	// Ledger Nano X (BLE + buttons)
	nanoX: {
		pin: NanoXPin,
		continueOnLedger: NanoXContinue,
		signTransaction: NanoXContinue, // Nano X reuses "continue" anim for signing
	},
	// Ledger Nano S (USB-only, buttons)
	nanoS: {
		pin: NanoSPin,
		continueOnLedger: NanoSContinue,
		signTransaction: NanoSContinue,
	},
	// Ledger Nano S Plus (USB-only, buttons) — shares Nano S assets
	nanoSP: {
		pin: NanoSPin,
		continueOnLedger: NanoSContinue,
		signTransaction: NanoSContinue,
	},
	// Ledger Nano Gen 5 / Apex — e-ink touch-screen
	apexp: {
		pin: ApexPin,
		continueOnLedger: ApexContinue,
		signTransaction: ApexContinue, // Apex reuses "continue" anim for signing
	},
};

/** Fallback animation set for unknown device models. */
const fallbackAnimations: AnimationSet = {
	pin: FlexPin,
	continueOnLedger: FlexContinue,
	signTransaction: FlexSign,
};

/**
 * Get the Lottie animation data for a specific device model and animation key.
 *
 * Accepts a `DeviceModelId` (from the DMK) or `null`/`undefined` for unknown
 * models. Falls back to Flex animations for unrecognised model IDs.
 */
export function getDeviceAnimation(
	modelId: DeviceModelId | string | null | undefined,
	key: AnimationKey,
): object | null {
	const set = (modelId && animationMap[modelId]) || fallbackAnimations;
	return set[key];
}
