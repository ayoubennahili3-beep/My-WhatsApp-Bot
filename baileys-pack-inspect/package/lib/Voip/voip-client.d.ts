import type { VoipSdkConfig } from './types.js';
import type { InitiateCallOptions } from './voip-engine.js';
export type { VoipSdkConfig, CallOptions, CallEvents, AudioConfig } from './types.js';
export { CallState } from './types.js';
export type { ActiveCall } from './voip-engine.js';
/**
 * Top-level standalone client. Connects to WhatsApp on its own dedicated
 * session and lets you place calls.
 */
export declare class VoipClient {
    #private;
    constructor(config: VoipSdkConfig);
    /** Connect to WhatsApp on a fresh, independent session. */
    connect: () => Promise<void>;
    /** Place an outbound voice call. Delegates to `sock.initiateCall()`,
     *  already wired in by `makeWASocket()`'s standard socket composition.
     *  Safe to call multiple times concurrently — see `callMany`. */
    call: (phoneNumber: string, opts?: InitiateCallOptions) => Promise<import("./voip-engine.js").ActiveCall>;
    /** Place several outbound calls concurrently. */
    callMany: (requests: Array<{
        jid: string;
        options?: InitiateCallOptions;
    }>) => Promise<import("./voip-engine.js").ActiveCall[]>;
    /** Snapshot of every call currently open on this client's socket. */
    getActiveCalls: () => Promise<import("./types.js").CallSummary[]>;
    /** Look up one specific open call by its callId. */
    getCall: (callId: string) => Promise<import("./voip-engine.js").ActiveCall | undefined>;
    getActiveCallCount: () => Promise<number>;
    /** Ends one specific call by callId. */
    endCall: (callId: string) => Promise<void>;
    /** Ends every call currently open on this client's socket. */
    endAllCalls: () => Promise<void>;
    /** Adjusts socket-level VoIP limits, e.g. `{ maxConcurrentCalls: 10 }`. */
    setOptions: (options: {
        maxConcurrentCalls?: number;
    }) => Promise<void>;
    /** Tear down the WhatsApp socket and release VoIP resources. */
    disconnect: () => void;
}
/**
 * Creates and connects a dedicated, standalone VoIP session.
 *
 * @example
 * const voip = await createVoipClient({ authDir: './voip_auth' })
 * const call = await voip.call('12345678901', { audioSource: './hello.mp3' })
 * call.on('connected', () => console.log('call connected'))
 * call.on('ended', reason => console.log('call ended:', reason))
 */
export declare const createVoipClient: (config: VoipSdkConfig) => Promise<VoipClient>;
//# sourceMappingURL=voip-client.d.ts.map