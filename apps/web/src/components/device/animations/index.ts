/**
 * Device-specific Lottie animation data.
 *
 * Each device model has animations for key interaction states.
 * Nano S and Nano SP share the same assets.
 */

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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The animation keys supported for each device model.
 */
export type AnimationKey = "pin" | "continueOnLedger" | "signTransaction";

/**
 * Device model identifiers matching `DeviceModelId` from the DMK.
 * We also support a `"generic"` fallback.
 */
export type DeviceModel = "nanoS" | "nanoSP" | "nanoX" | "stax" | "flex" | "apexp" | "generic";

// ---------------------------------------------------------------------------
// Animation map
// ---------------------------------------------------------------------------

const animationMap: Record<DeviceModel, Record<AnimationKey, object | null>> = {
	stax: {
		pin: StaxPin,
		continueOnLedger: StaxContinue,
		signTransaction: StaxSign,
	},
	flex: {
		pin: FlexPin,
		continueOnLedger: FlexContinue,
		signTransaction: FlexSign,
	},
	nanoX: {
		pin: NanoXPin,
		continueOnLedger: NanoXContinue,
		signTransaction: NanoXContinue, // Nano X reuses "continue" anim for signing
	},
	nanoS: {
		pin: NanoSPin,
		continueOnLedger: NanoSContinue,
		signTransaction: NanoSContinue,
	},
	nanoSP: {
		pin: NanoSPin,
		continueOnLedger: NanoSContinue,
		signTransaction: NanoSContinue,
	},
	apexp: {
		// Apex reuses Flex animations
		pin: FlexPin,
		continueOnLedger: FlexContinue,
		signTransaction: FlexSign,
	},
	generic: {
		// Fallback: use Flex animations
		pin: FlexPin,
		continueOnLedger: FlexContinue,
		signTransaction: FlexSign,
	},
};

/**
 * Get the Lottie animation data for a specific device model and animation key.
 *
 * Returns `null` if the animation is not available for that model.
 */
export function getDeviceAnimation(model: DeviceModel, key: AnimationKey): object | null {
	return animationMap[model]?.[key] ?? animationMap.generic[key];
}
