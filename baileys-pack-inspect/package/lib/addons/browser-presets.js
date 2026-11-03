/**
 * addon: browser-presets
 * Source patches: Baileys-android-browser, Baileys-fix-pairing-code
 *
 * Adds:
 *   - Android browser preset
 *   - getPlatformDisplayName() — returns canonical OS name used in pairing IQ
 */
import { proto } from '../../WAProto/index.js';
// ── Android browser preset ────────────────────────────────────────────────────
// Usage: makeWASocket({ browser: Browsers.android('MyApp') })
// Directly patches the Browsers map — import and use from here OR via Browsers.android
export const androidBrowserPreset = (browser) => [browser, 'Android', ''];
// ── getPlatformDisplayName ────────────────────────────────────────────────────
/**
 * Returns the canonical platform display name (e.g. 'Chrome', 'Firefox')
 * used in the companion_platform_display field of the pairing IQ.
 * Falls back to 'Chrome' for unknown / custom browser names.
 */
export const getPlatformDisplayName = (browser) => {
    const platformType = proto.DeviceProps.PlatformType[browser.toUpperCase()];
    return platformType ? browser : 'Chrome';
};
//# sourceMappingURL=browser-presets.js.map