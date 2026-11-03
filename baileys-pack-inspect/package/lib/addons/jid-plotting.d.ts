import type { AuthenticationState, WAMessage } from '../Types/index.js';
export interface JidInfo {
    jid: string;
    user: string;
    server: string;
    device: number;
    agent: number;
    isLid: boolean;
    isPn: boolean;
    isHosted: boolean;
    isGroup: boolean;
    isNewsletter: boolean;
    normalizedUser: string;
}
export interface SenderPnInfo {
    phoneJid: string;
    phoneNumber: string;
    lid?: string;
    deviceId: number;
    pushName?: string;
    platform?: string;
}
export interface PlottedJid {
    original: string;
    primary: string;
    info: JidInfo | null;
    pn?: string;
    lid?: string;
}
export declare const parseJid: (jid: string) => JidInfo | null;
export declare const getSenderPn: (creds: AuthenticationState["creds"]) => SenderPnInfo | null;
export declare const getCurrentSenderInfo: (authState: AuthenticationState) => SenderPnInfo | null;
export declare const isSelf: (jid: string, senderPn: SenderPnInfo) => boolean;
export declare const plotJid: (jid: string) => PlottedJid | null;
export declare const normalizePhoneToJid: (phone: string) => string;
export declare const extractPhoneNumber: (jid: string) => string | null;
export declare const formatJidDisplay: (jid: string, options?: {
    showDevice?: boolean;
    showType?: boolean;
}) => string;
export declare const isSameUser: (jid1: string, jid2: string) => boolean;
export declare const getJidVariants: (phone: string) => string[];
export declare const constructJidWithDevice: (user: string, device: number, server?: string) => string;
export declare const getRemoteJidFromMessage: (msg: WAMessage) => {
    chatJid: string;
    senderJid: string;
} | null;
export interface JidPlotterWithMapping {
    plotToLid: (pn: string) => Promise<string | null>;
    plotToPn: (lid: string) => Promise<string | null>;
    plotBidirectional: (jid: string) => Promise<PlottedJid>;
}
export declare const createJidPlotter: (getLIDForPN: (pn: string) => Promise<string | null>, getPNForLID: (lid: string) => Promise<string | null>) => JidPlotterWithMapping;
//# sourceMappingURL=jid-plotting.d.ts.map