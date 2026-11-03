import type { SignalRepositoryWithLIDStore } from '../Types/index.js';
/** Structural surface of the queenanya socket this bridge needs. Any layer
 *  of the socket (Socket/socket.ts, messages-send.ts, messages-recv.ts, or
 *  the fully-composed sock) satisfies this — see Voip/voip-engine.ts. */
export type BaileysSocket = {
    authState: {
        creds: any;
        keys: any;
    };
    signalRepository: SignalRepositoryWithLIDStore;
    generateMessageTag: () => string;
    query: (node: any) => Promise<any>;
    sendNode: (node: any) => Promise<void> | void;
    waitForMessage: (tag: string, timeoutMs: number) => Promise<any>;
    getUSyncDevices: (jids: string[], useCache: boolean, ignoreZeroDevices: boolean) => Promise<any[]>;
    presenceSubscribe: (jid: string) => Promise<void>;
    /** Reuses the existing 'set' privacy-tokens IQ — its response already
     *  contains the freshly-issued token, same shape baileys-caller's
     *  standalone `getPrivacyTokens` expected from a dedicated 'get'. */
    issuePrivacyTokens: (jids: string[], timestamp?: number) => Promise<any>;
    ws: any;
    ev: any;
};
export type SignalingBridgeConfig = {
    sock: BaileysSocket;
};
export declare class SignalingBridge {
    #private;
    constructor(config: SignalingBridgeConfig);
    /** Hand the WASM engine in so we can dispatch ack callbacks back to it.
     *  Explicit calls always take the primary slot (used for the single-call
     *  default flow); see `registerCallEngine` for the auto-fallback case. */
    attachEngine: (voip: any) => void;
    /** Register an isolated per-call engine (used for concurrent outgoing calls) so
     *  acks for that specific callId route back to its own WASM engine instead of
     *  the shared/primary one. Also claims the primary slot, but ONLY if nothing
     *  already holds it — otherwise every new concurrent call would silently
     *  steal inbound-offer routing away from whichever call got there first. */
    registerCallEngine: (callId: string, voip: any) => void;
    /** Drop a per-call engine registration once that call has ended. If that
     *  call happened to be holding the primary slot, promote another still-open
     *  call (if any) instead of leaving `#primaryVoip` pointing at a destroyed
     *  engine. */
    unregisterCallEngine: (callId: string) => void;
    /** Register a callback for raw signaling tags (terminate/reject/preaccept/accept/receipt). */
    setSignalingEventListener: (cb: (tag: string, reason: string, callId: string, peerJid: string) => void) => void;
    /** Register a callback for signaling-layer failures (ack timeout, non-zero ack error). */
    setSignalingErrorListener: (cb: (tag: string, errorType: string, peerJid: string, callId: string) => void) => void;
    init: () => Promise<void>;
    sendSignaling: (peerJid: string, callId: string, xmlPayload: Uint8Array) => void;
    processIncomingCall: (node: any, voip: any, activeCallId: string) => void;
    processIncomingReceipt: (node: any, voip: any, activeCallId: string) => void;
    requestTcToken: (jid: string) => Promise<Uint8Array | undefined>;
    ensureTcToken: (...jids: string[]) => Promise<Uint8Array | undefined>;
    discoverPeerDevices: (peerLidJid: string) => Promise<string[]>;
    ensureSessionsForPeers: (jids: string[]) => Promise<void>;
    resolveLid: (pnJid: string) => Promise<string | undefined>;
    issueTcToken: (jid: string) => Promise<boolean>;
    getRemoteDeviceJid: (callId: string) => string | undefined;
}
//# sourceMappingURL=signaling.d.ts.map