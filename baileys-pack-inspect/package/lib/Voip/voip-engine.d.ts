import { EventEmitter } from 'events';
import { type BaileysSocket } from './signaling.js';
import { CallState, type CallStatus, type CallSummary, type VoipConfigOptions } from './types.js';
import { VideoFeeder } from './video-feeder.js';
import { WasmEngine } from './wasm-engine.js';
export type { VoipSdkConfig, CallOptions, CallEvents, AudioConfig, CallStatus, CallSummary, CallRequest, VoipConfigOptions } from './types.js';
export { CallState } from './types.js';
/** A live or recently-ended call. */
export declare class ActiveCall extends EventEmitter {
    #private;
    readonly callId: string;
    readonly peerJid: string;
    private readonly engine;
    readonly phoneNumber: string;
    readonly startedAt: number;
    connectedAt: number | null;
    endedAt: number | null;
    /** @internal mirrors the source path for the audio feeder */
    _audioSource: string;
    /** @internal whether the audio source should loop for the life of the call */
    _repeatAudio: boolean;
    /** @internal auto-hangup duration, also reported via getSummary() */
    _durationMs: number;
    /** @internal video source path/options, set by initiateCall when isVideo is requested */
    _videoSource: string | null;
    _videoWidth: number;
    _videoHeight: number;
    _videoFps: number;
    _videoLoop: boolean;
    /** @internal true = horizontal/landscape, false = vertical/portrait */
    isHorizontal: boolean;
    /** @internal raw orientation flag passed to sendVideoFrame (0 = portrait, 2 = landscape, etc.) */
    _videoOrientation: number;
    /** @internal whether this is a video call */
    isVideo: boolean;
    /** @internal set by voip-engine once the video feeder is actually running */
    videoFeeder: VideoFeeder | null;
    constructor(callId: string, peerJid: string, engine: WasmEngine, durationMs: number, phoneNumber?: string, preRingingTimeoutMs?: number);
    /**
     * Start streaming a video source into this call. `ptr` must be a
     * pre-allocated WASM heap buffer at least `width * height * 1.5` bytes
     * (YUV420p frame size) — see `handleAudioCaptureStart` in
     * `attachVoipToSocket`, which allocates and passes this in.
     */
    startVideo: (ptr: number) => void;
    stopVideo: () => void;
    get state(): CallState;
    get status(): CallStatus;
    get ended(): boolean;
    /** Snapshot of this call's current config/state, mirroring upstream's CallSummary. */
    getSummary: () => CallSummary;
    /** Ends the call. `reason` defaults to `'completed'`; for `'remote_end'`
     *  or `'rejected'` we skip re-signaling `endCall` to the WASM since the
     *  remote side already tore it down. */
    end: (reason?: string) => void;
    mute: (muted: boolean) => void;
    waitForEnd: () => Promise<string>;
    /** @internal — call once the audio feeder actually starts pushing frames. */
    _confirmAudioReady: () => void;
    /** @internal — call on the first real audio chunk sent. */
    _confirmStreaming: () => void;
    /** @internal — called by the engine wiring below on WASM call-state change */
    _updateState: (state: number) => void;
    /** @internal — called on raw signaling tags (terminate/reject/preaccept/accept/receipt),
     *  which typically reach us faster than a WASM call-state round trip. */
    _handleSignalingEvent: (tag: string, reason?: string) => void;
    /** @internal — called on signaling-layer errors (ack timeout, 404/480, etc.) */
    _handleSignalingError: (_signalingTag: string, errorType: string) => void;
    /** @internal */
    _handleUnreachable: () => void;
    /** @internal */
    _handleRejected: () => void;
    /** @internal */
    _handleTimeout: () => void;
    /** @internal */
    _forceFail: (reason: string) => void;
    /** @internal */
    _emitAudio: (pcm: Float32Array) => void;
    /** @internal */
    _forceEnd: (reason: string) => void;
}
export type InitiateCallOptions = {
    /** Phone number or JID — optional here since it's normally the first arg to initiateCall(). */
    to?: string;
    /** Audio source: file path to MP3/WAV, or 'silence' for an empty uplink. */
    audioSource?: string;
    /** Auto-hangup after N ms (default: 120000). */
    durationMs?: number;
    durationMS?: number;
    /** Whether this is a video call (default: false). Requires videoSource. */
    isVideo?: boolean;
    /** Video source: file path to MP4/MKV/MOV/AVI, streamed via ffmpeg. */
    videoSource?: string;
    /** Video frame width (default: 640). Rounded up to an even number. */
    videoWidth?: number;
    width?: number;
    /** Video frame height (default: 480). Rounded up to an even number. */
    videoHeight?: number;
    height?: number;
    /** Video frame rate, 1-60 (default: 15). */
    videoFps?: number;
    fps?: number;
    /** Loop the video source continuously until durationMs is reached. */
    videoLoop?: boolean;
    repeatVideo?: boolean;
    loop?: boolean;
    /** Stream video in horizontal (landscape) orientation if true. (default: false / portrait) */
    isHorizontal?: boolean;
    horizontal?: boolean;
    /** Explicit raw device/video orientation (0 = vertical/portrait, 2 = horizontal/landscape, etc.). */
    orientation?: number;
    videoOrientation?: number;
    /** Loop audioSource for the life of the call instead of playing it once. */
    repeatAudio?: boolean;
    repeat?: boolean;
    /** Timeout waiting for remote device to confirm ringing, in ms (default: 20000). */
    preRingingTimeoutMs?: number;
};
export declare const attachVoipToSocket: (sock: BaileysSocket & {
    presenceSubscribe: (jid: string) => Promise<void>;
}) => {
    initiateCall: (jidOrPhoneNumber: string, opts?: InitiateCallOptions) => Promise<ActiveCall>;
    initiateCalls: (requests: Array<{
        jid: string;
        options?: InitiateCallOptions;
    }>) => Promise<ActiveCall[]>;
    getActiveCalls: () => Promise<CallSummary[]>;
    getCall: (callId: string) => Promise<ActiveCall | undefined>;
    getActiveCallCount: () => Promise<number>;
    endCall: (callId: string) => Promise<void>;
    endAllCalls: () => Promise<void>;
    setVoipOptions: (options: VoipConfigOptions) => Promise<void>;
    disconnectVoip: () => void;
};
//# sourceMappingURL=voip-engine.d.ts.map