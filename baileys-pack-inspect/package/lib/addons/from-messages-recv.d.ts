/**
 * from-messages-recv.ts
 * Source: addons/baileys + PR #2375
 *
 * All call functions as a factory — makeCallHandlers(deps) injects
 * socket-bound dependencies and returns all call functions ready to use.
 */
import type { WAInitiateCallOptions, WAInitiateCallResult } from '../Types/index.js';
import type { BinaryNode } from '../WABinary/index.js';
export type CallHandlerDeps = {
    authState: any;
    query: (node: BinaryNode) => Promise<any>;
    sendNode: (node: BinaryNode) => Promise<void>;
    generateMessageTag: () => string;
    getUSyncDevices: (jids: string[], useCache: boolean, ignoreZeroDevices: boolean) => Promise<Array<{
        user: string;
        device?: number;
    }>>;
    assertSessions: (jids: string[], force?: boolean) => Promise<any>;
    createParticipantNodes: (jids: string[], message: any, extraAttrs?: any) => Promise<{
        nodes: BinaryNode[];
        shouldIncludeDeviceIdentity: boolean;
    }>;
    callOfferCache: {
        set: (k: string, v: any, ttl?: number) => any;
        del: (k: string) => any;
    };
};
export declare function makeCallHandlers(deps: CallHandlerDeps): {
    rejectCall: (callId: string, callFrom: string) => Promise<void>;
    offerCall: (toJid: string, isVideo?: boolean) => Promise<{
        id: string;
        to: string;
    }>;
    initiateCall: (jid: string, options?: WAInitiateCallOptions) => Promise<WAInitiateCallResult>;
    terminateCall: (callId: string, callTo: string, callCreator?: string, reason?: string, duration?: number) => Promise<void>;
    cancelCall: (callId: string, callTo: string) => Promise<void>;
    acceptCall: (callId: string, callFrom: string, isVideo?: boolean) => Promise<void>;
    preacceptCall: (callId: string, callCreator: string, isVideo?: boolean) => Promise<void>;
    sendRelayLatency: (callId: string, callCreator: string, relays: Array<{
        relayName?: string;
        latency: number;
        relayId?: string;
        dlBw?: number;
        ulBw?: number;
    }>, transactionId?: string) => Promise<void>;
    sendTransport: (callId: string, callCreator: string, to: string, candidates: Array<{
        priority: string;
        data: Uint8Array;
    }>, round?: number) => Promise<void>;
    sendCallDuration: (callId: string, callCreator: string, peer: string, audioDuration: number, callType?: string) => Promise<void>;
    muteCall: (callId: string, callCreator: string, to: string, muted: boolean) => Promise<void>;
    sendHeartbeat: (callId: string, callCreator: string) => Promise<void>;
    sendEncRekey: (callId: string, callCreator: string, to: string, transactionId: string) => Promise<void>;
    sendVideoState: (callId: string, callCreator: string, to: string, enabled: boolean, orientation?: string) => Promise<void>;
    queryCallLink: (token: string, media?: string) => Promise<any>;
    joinCallLink: (token: string, media?: string) => Promise<any>;
};
//# sourceMappingURL=from-messages-recv.d.ts.map