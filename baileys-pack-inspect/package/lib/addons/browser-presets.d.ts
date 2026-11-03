/**
 * addon: browser-presets
 * Source patches: Baileys-android-browser, Baileys-fix-pairing-code
 *
 * Adds:
 *   - Android browser preset
 *   - getPlatformDisplayName() — returns canonical OS name used in pairing IQ
 */
export declare const androidBrowserPreset: (browser: string) => [string, string, string];
/**
 * Returns the canonical platform display name (e.g. 'Chrome', 'Firefox')
 * used in the companion_platform_display field of the pairing IQ.
 * Falls back to 'Chrome' for unknown / custom browser names.
 */
export declare const getPlatformDisplayName: (browser: string) => string;
//# sourceMappingURL=browser-presets.d.ts.map