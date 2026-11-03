/**
 * Call Handler Addon
 * All 15 functions below (offerCall, WAInitiateCall, acceptCall, cancelCall,
 * preacceptCall, terminateCall, muteCall, joinCallLink, queryCallLink,
 * sendCallDuration, sendHeartbeat, sendRelayLatency, sendTransport,
 * sendVideoState, sendEncRekey) plus sanitizeCallerPn.
 *
 * Full outgoing call support: initiate, accept, cancel, mute, terminate,
 * join via link, query link, send heartbeat/transport/video-state/relay-latency/enc-rekey.
 *
 * Usage — inject into makeCallsSocket (messages-recv layer):
 * ```ts
 * const callAddon = makeCallHandlerAddon({ query, sendNode, authState, callOfferCache,
 *     assertSessions, createParticipantNodes, getUSyncDevices })
 * return { ...sock, ...callAddon }
 * ```
 */
import { proto } from '../../WAProto/index.js';
import type { SocketConfig } from '../Types/index.js';
interface CallCacheStore {
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T): Promise<void>;
    del(key: string): Promise<void>;
}
interface BinaryNode {
    tag: string;
    attrs: Record<string, string | undefined>;
    content?: BinaryNode[] | Buffer | Uint8Array | undefined;
}
export interface CallHandlerContext {
    query: (node: BinaryNode) => Promise<BinaryNode>;
    sendNode: (node: BinaryNode) => Promise<void>;
    authState: {
        creds: SocketConfig['auth']['creds'];
    };
    callOfferCache: CallCacheStore;
    assertSessions: (jids: string[], force?: boolean) => Promise<void>;
    createParticipantNodes: (jids: string[], message: proto.IMessage, extraAttrs?: Record<string, string>) => Promise<{
        nodes: BinaryNode[];
        shouldIncludeDeviceIdentity: boolean;
    }>;
    getUSyncDevices: (jids: string[], useCache: boolean, ignoreZeroDevices: boolean) => Promise<Array<{
        user: string;
        device: number;
    }>>;
}
export interface RelayEntry {
    relayName?: string;
    latency: number;
    relayId?: string;
    dlBw?: number;
    ulBw?: number;
}
export interface CallTransportCandidate {
    priority: string;
    data: Uint8Array;
}
export declare const makeCallHandlerAddon: (ctx: CallHandlerContext) => {
    sanitizeCallerPn: (pn: string | undefined) => string | undefined;
    WAInitiateCall: (jid: string, options?: {
        isVideo?: boolean;
    }) => Promise<{
        callId: string;
        to: string;
        isVideo: boolean;
    }>;
    acceptCall: (callId: string, callFrom: string, isVideo: boolean) => Promise<void>;
    cancelCall: (callId: string, callTo: string) => Promise<void>;
    muteCall: (callId: string, callCreator: string, to: string, muted: boolean) => Promise<void>;
    terminateCall: (callId: string, callTo: string, callCreator?: string, reason?: string, duration?: number) => Promise<void>;
    preacceptCall: (callId: string, callCreator: string, isVideo: boolean) => Promise<void>;
    joinCallLink: (token: string, media?: "audio" | "video") => Promise<BinaryNode>;
    queryCallLink: (token: string, media?: "audio" | "video") => Promise<BinaryNode>;
    sendCallDuration: (callId: string, callCreator: string, peer: string, audioDuration: number, callType?: string) => Promise<void>;
    sendHeartbeat: (callId: string, callCreator: string) => Promise<void>;
    sendRelayLatency: (callId: string, callCreator: string, relays: RelayEntry[], transactionId?: string) => Promise<void>;
    sendTransport: (callId: string, callCreator: string, to: string, candidates: CallTransportCandidate[], round?: number) => Promise<void>;
    sendVideoState: (callId: string, callCreator: string, to: string, enabled: boolean, orientation?: string) => Promise<void>;
    sendEncRekey: (callId: string, callCreator: string, to: string, transactionId: string) => Promise<void>;
};
export {};
//# sourceMappingURL=call-handler.d.ts.map