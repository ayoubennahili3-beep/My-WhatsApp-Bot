import { platform, release } from 'os';
import { proto } from '../../WAProto/index.js';
const PLATFORM_MAP = {
    aix: 'AIX',
    darwin: 'Mac OS',
    win32: 'Windows',
    android: 'Android',
    freebsd: 'FreeBSD',
    openbsd: 'OpenBSD',
    sunos: 'Solaris',
    linux: 'Linux',
    ubuntu: 'Ubuntu',
    ios: 'iOS',
    baileys: 'Baileys',
    chromeos: 'Chrome OS',
    tizen: 'Tizen',
    watchos: 'watchOS',
    wearos: 'Wear OS',
    harmonyos: 'HarmonyOS',
    kaios: 'KaiOS',
    smarttv: 'Smart TV',
    raspberrypi: 'Raspberry Pi OS',
    symbian: 'Symbian',
    blackberry: 'Blackberry OS',
    windowsphone: 'Windows Phone'
};
const PLATFORM_VERSIONS = {
    ubuntu: '22.04.4',
    darwin: '18.5',
    win32: '10.0.22631',
    android: '14.0.0',
    freebsd: '13.2',
    openbsd: '7.3',
    sunos: '11',
    linux: '6.5',
    ios: '18.2',
    baileys: '6.5.0',
    chromeos: '117.0.5938.132',
    tizen: '6.5',
    watchos: '10.1',
    wearos: '4.1',
    harmonyos: '4.0.0',
    kaios: '3.1',
    smarttv: '23.3.1',
    raspberrypi: '11 (Bullseye)',
    symbian: '3',
    blackberry: '10.3.3',
    windowsphone: '8.1'
};
export const Browsers = {
    ubuntu: browser => ['Ubuntu', browser, PLATFORM_VERSIONS['ubuntu']],
    macOS: browser => ['Mac OS', browser, PLATFORM_VERSIONS['darwin']],
    baileys: browser => ['Baileys', browser, PLATFORM_VERSIONS['baileys']],
    windows: browser => ['Windows', browser, PLATFORM_VERSIONS['win32']],
    linux: browser => ['Linux', browser, PLATFORM_VERSIONS['linux']],
    /** Solaris/SunOS */
    solaris: browser => ['Solaris', browser, PLATFORM_VERSIONS['sunos']],
    /** iOS device */
    iOS: browser => ['iOS', browser, PLATFORM_VERSIONS['ios']],
    /** Android companion device — apiLevel is the Android API level e.g. '14' */
    android: (apiLevel) => [apiLevel, 'Android', ''],
    /** Alias for android companion used by pairing code flow */
    androidCompanion: (apiLevel) => [apiLevel, 'Android', ''],
    kaiOS: browser => ['KaiOS', browser, PLATFORM_VERSIONS['kaios']],
    chromeOS: browser => ['Chrome OS', browser, PLATFORM_VERSIONS['chromeos']],
    /** The appropriate browser based on your OS & release */
    appropriate: browser => {
        const os = platform();
        const platformName = PLATFORM_MAP[os] || 'Unknown OS';
        return [platformName, browser, PLATFORM_VERSIONS[os] || release()];
    },
    /** Fully custom browser tuple */
    custom: (os, browser, version) => {
        const platformName = PLATFORM_MAP[os.toLowerCase()] || os;
        return [platformName, browser, version || PLATFORM_VERSIONS[os] || 'latest'];
    }
};
/**
 * Checks if the browser tuple represents an Android companion device.
 */
export const isAndroidBrowser = (browser) => {
    return browser[1]?.toUpperCase() === 'ANDROID';
};
/**
 * Returns a numeric platform ID string for the given browser name.
 * Falls back to Chrome (1) for unknown/non-browser platforms.
 */
export const getPlatformId = (browser) => {
    const platformType = proto.DeviceProps.PlatformType[browser.toUpperCase()];
    if (platformType !== undefined) {
        return platformType.toString();
    }
    // 'ANDROID' not in PlatformType enum — map to ANDROID_PHONE
    if (browser.toUpperCase() === 'ANDROID') {
        const androidPhone = proto.DeviceProps.PlatformType['ANDROID_PHONE'];
        if (androidPhone !== undefined) {
            return androidPhone.toString();
        }
    }
    return (proto.DeviceProps.PlatformType.CHROME || 1).toString();
};
/**
 * Returns the display name for the given browser type.
 * Falls back to 'Chrome' if browser type is not a known platform type.
 */
export const getPlatformDisplayName = (browser) => {
    const platformType = proto.DeviceProps.PlatformType[browser.toUpperCase()];
    return platformType !== undefined ? browser : 'Chrome';
};
/**
 * OS names WhatsApp's pairing-code registration endpoint recognises for
 * `companion_platform_display`'s "(<os>)" part. Anything else gets rejected
 * with a 400, so a non-canonical `browser[0]` (e.g. a custom product name
 * like "Aidy Staging") must fall back to one of these instead of being sent
 * verbatim (PR: Baileys-fix-pairing-code-regression-upstream).
 */
const PAIRING_CODE_OS_DISPLAY = new Set(['Mac OS', 'Windows', 'Ubuntu']);
export const getPairingCodeOsDisplay = (os) => (PAIRING_CODE_OS_DISPLAY.has(os) ? os : 'Mac OS');
//# sourceMappingURL=browser-utils.js.map