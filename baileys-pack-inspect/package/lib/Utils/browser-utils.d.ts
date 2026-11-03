import type { BrowsersMap } from '../Types/index.js';
export declare const Browsers: BrowsersMap;
/**
 * Checks if the browser tuple represents an Android companion device.
 */
export declare const isAndroidBrowser: (browser: [string, string, string]) => boolean;
/**
 * Returns a numeric platform ID string for the given browser name.
 * Falls back to Chrome (1) for unknown/non-browser platforms.
 */
export declare const getPlatformId: (browser: string) => string;
/**
 * Returns the display name for the given browser type.
 * Falls back to 'Chrome' if browser type is not a known platform type.
 */
export declare const getPlatformDisplayName: (browser: string) => string;
export declare const getPairingCodeOsDisplay: (os: string) => string;
//# sourceMappingURL=browser-utils.d.ts.map