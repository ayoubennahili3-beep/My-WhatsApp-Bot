var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ActiveCall_state, _ActiveCall_status, _ActiveCall_endResolver, _ActiveCall_endPromise, _ActiveCall_endTimer, _ActiveCall_preRingingTimer, _ActiveCall_ended, _ActiveCall_setStatus, _ActiveCall_confirmRinging, _ActiveCall_confirmAccepted, _ActiveCall_confirmConnected, _ActiveCall_handlePreRingingTimeout, _ActiveCall_clearTimers;
/**
 * VoIP call orchestration — wires the WASM VoIP stack onto an EXISTING,
 * already-connected queenanya socket (single session), instead of creating
 * a separate standalone connection the way upstream baileys-caller's
 * `VoipClient.connect()` does.
 *
 * Ported from baileys-caller (https://github.com/SheIITear/baileys-caller,
 * MIT, by ShellTear). The signaling/WASM/relay/audio layers are unchanged —
 * only the "how do we get a `sock`" part differs: here it's handed to us
 * already open.
 *
 * Adds `sock.initiateCall(jid, opts)` to the socket, matching the shape:
 *
 *   const call = await sock.initiateCall(jid, {
 *     audioSource: './audio.mp3', // MP3/WAV path, or 'silence'
 *     durationMs: 30000
 *   })
 *   call.on('ringing', () => ...)
 *   call.on('connected', () => ...)
 *   call.on('audio', (pcmChunk) => ...)   // 16 kHz mono Float32Array
 *   call.on('ended', (reason) => ...)
 *   call.on('error', (err) => ...)
 *
 * @author ShellTear (original signaling/WASM/relay/audio design),
 *         adapted for single-session use in @queenanya/baileys
 */
import { createHmac, randomBytes } from 'crypto';
import { EventEmitter } from 'events';
import { AudioFeeder } from './audio-feeder.js';
import { RelayRtcTransport } from './relay-transport.js';
import { SignalingBridge } from './signaling.js';
import { CallState } from './types.js';
import { VideoFeeder } from './video-feeder.js';
import { WasmEngine } from './wasm-engine.js';
export { CallState } from './types.js';
const SHA256_LEN = 32;
const toBareJid = (jid) => {
    if (!jid)
        return jid;
    const at = jid.indexOf('@');
    if (at < 0)
        return jid;
    const user = jid.slice(0, at).split(':')[0];
    return `${user}@${jid.slice(at + 1)}`;
};
const computeHkdf = (key, salt, info, length) => {
    const effectiveSalt = salt && salt.length > 0 ? Buffer.from(salt) : Buffer.alloc(SHA256_LEN, 0);
    const prk = createHmac('sha256', effectiveSalt).update(key).digest();
    const blocks = Math.ceil(length / SHA256_LEN);
    const okm = Buffer.alloc(blocks * SHA256_LEN);
    let prev = Buffer.alloc(0);
    for (let i = 1; i <= blocks; i += 1) {
        prev = createHmac('sha256', prk)
            .update(prev)
            .update(info)
            .update(Buffer.from([i]))
            .digest();
        prev.copy(okm, (i - 1) * SHA256_LEN);
    }
    return new Uint8Array(okm.buffer, okm.byteOffset, length);
};
const computeHmacSha256 = (data, key) => {
    const result = createHmac('sha256', Buffer.from(key)).update(data).digest();
    return new Uint8Array(result.buffer, result.byteOffset, result.byteLength);
};
const isCallReceiptNode = (node) => {
    if (node?.tag !== 'receipt')
        return false;
    const child = Array.isArray(node.content) ? node.content[0] : null;
    return !!(child?.attrs?.['call-id'] || child?.attrs?.call_id);
};
const DEFAULT_PRE_RINGING_TIMEOUT_MS = 20000;
/** A live or recently-ended call. */
export class ActiveCall extends EventEmitter {
    constructor(callId, peerJid, engine, durationMs, phoneNumber = peerJid, preRingingTimeoutMs = DEFAULT_PRE_RINGING_TIMEOUT_MS) {
        super();
        this.callId = callId;
        this.peerJid = peerJid;
        this.engine = engine;
        this.phoneNumber = phoneNumber;
        this.startedAt = Date.now();
        this.connectedAt = null;
        this.endedAt = null;
        _ActiveCall_state.set(this, CallState.Idle);
        _ActiveCall_status.set(this, 'initiating');
        _ActiveCall_endResolver.set(this, void 0);
        _ActiveCall_endPromise.set(this, void 0);
        _ActiveCall_endTimer.set(this, null);
        _ActiveCall_preRingingTimer.set(this, null);
        _ActiveCall_ended.set(this, false
        /** @internal mirrors the source path for the audio feeder */
        );
        /** @internal mirrors the source path for the audio feeder */
        this._audioSource = 'silence';
        /** @internal whether the audio source should loop for the life of the call */
        this._repeatAudio = false;
        /** @internal auto-hangup duration, also reported via getSummary() */
        this._durationMs = 120000;
        /** @internal video source path/options, set by initiateCall when isVideo is requested */
        this._videoSource = null;
        this._videoWidth = 640;
        this._videoHeight = 480;
        this._videoFps = 15;
        this._videoLoop = false;
        /** @internal true = horizontal/landscape, false = vertical/portrait */
        this.isHorizontal = false;
        /** @internal raw orientation flag passed to sendVideoFrame (0 = portrait, 2 = landscape, etc.) */
        this._videoOrientation = 0;
        /** @internal whether this is a video call */
        this.isVideo = false;
        /** @internal set by voip-engine once the video feeder is actually running */
        this.videoFeeder = null;
        /**
         * Start streaming a video source into this call. `ptr` must be a
         * pre-allocated WASM heap buffer at least `width * height * 1.5` bytes
         * (YUV420p frame size) — see `handleAudioCaptureStart` in
         * `attachVoipToSocket`, which allocates and passes this in.
         */
        this.startVideo = (ptr) => {
            if (__classPrivateFieldGet(this, _ActiveCall_ended, "f") || this.videoFeeder || !this._videoSource)
                return;
            this.emit('videoStarted');
            try {
                this.videoFeeder = new VideoFeeder(this._videoSource, (frameBuf, width, height, fps) => {
                    if (!__classPrivateFieldGet(this, _ActiveCall_ended, "f"))
                        this.engine.sendVideoFrame(frameBuf, ptr, width, height, fps, 1, this._videoOrientation);
                }, () => {
                    if (!__classPrivateFieldGet(this, _ActiveCall_ended, "f"))
                        this.emit('videoEnded');
                }, err => {
                    if (!__classPrivateFieldGet(this, _ActiveCall_ended, "f"))
                        this.emit('videoError', err);
                }, {
                    width: this._videoWidth,
                    height: this._videoHeight,
                    fps: this._videoFps,
                    loop: this._videoLoop,
                    durationMs: this._durationMs
                });
                this.videoFeeder.start();
            }
            catch (err) {
                this.emit('videoError', err);
            }
        };
        this.stopVideo = () => {
            this.videoFeeder?.stop();
            this.videoFeeder = null;
        };
        /** Snapshot of this call's current config/state, mirroring upstream's CallSummary. */
        this.getSummary = () => ({
            id: this.callId,
            jid: this.peerJid,
            status: __classPrivateFieldGet(this, _ActiveCall_status, "f"),
            state: __classPrivateFieldGet(this, _ActiveCall_state, "f"),
            startedAt: this.startedAt,
            connectedAt: this.connectedAt,
            endedAt: this.endedAt,
            durationMs: this._durationMs,
            audioSource: this._audioSource,
            repeatAudio: this._repeatAudio,
            isVideo: this.isVideo,
            isHorizontal: this.isHorizontal,
            videoOrientation: this._videoOrientation,
            videoSource: this._videoSource
        });
        /** Ends the call. `reason` defaults to `'completed'`; for `'remote_end'`
         *  or `'rejected'` we skip re-signaling `endCall` to the WASM since the
         *  remote side already tore it down. */
        this.end = (reason = 'completed') => {
            if (__classPrivateFieldGet(this, _ActiveCall_ended, "f"))
                return;
            __classPrivateFieldSet(this, _ActiveCall_ended, true, "f");
            this.endedAt = Date.now();
            __classPrivateFieldGet(this, _ActiveCall_clearTimers, "f").call(this);
            this.stopVideo();
            __classPrivateFieldGet(this, _ActiveCall_setStatus, "f").call(this, 'ending');
            if (reason !== 'remote_end' && reason !== 'rejected') {
                try {
                    this.engine.endCall(0, true);
                }
                catch { }
            }
            __classPrivateFieldGet(this, _ActiveCall_setStatus, "f").call(this, 'ended');
            this.emit('ended', reason);
            __classPrivateFieldGet(this, _ActiveCall_endResolver, "f").call(this, reason);
        };
        this.mute = (muted) => {
            try {
                this.engine.setMute(muted);
            }
            catch { }
        };
        this.waitForEnd = () => __classPrivateFieldGet(this, _ActiveCall_endPromise, "f");
        _ActiveCall_setStatus.set(this, (status) => {
            if (__classPrivateFieldGet(this, _ActiveCall_status, "f") === status)
                return;
            __classPrivateFieldSet(this, _ActiveCall_status, status, "f");
            this.emit('stateChange', status);
        });
        _ActiveCall_confirmRinging.set(this, () => {
            if (__classPrivateFieldGet(this, _ActiveCall_preRingingTimer, "f")) {
                clearTimeout(__classPrivateFieldGet(this, _ActiveCall_preRingingTimer, "f"));
                __classPrivateFieldSet(this, _ActiveCall_preRingingTimer, null, "f");
            }
            if (!['ringing', 'accepted', 'connected', 'audio_ready', 'streaming'].includes(__classPrivateFieldGet(this, _ActiveCall_status, "f"))) {
                __classPrivateFieldGet(this, _ActiveCall_setStatus, "f").call(this, 'ringing');
                this.emit('ringing');
            }
        });
        _ActiveCall_confirmAccepted.set(this, () => {
            if (__classPrivateFieldGet(this, _ActiveCall_preRingingTimer, "f")) {
                clearTimeout(__classPrivateFieldGet(this, _ActiveCall_preRingingTimer, "f"));
                __classPrivateFieldSet(this, _ActiveCall_preRingingTimer, null, "f");
            }
            if (!['accepted', 'connected', 'audio_ready', 'streaming'].includes(__classPrivateFieldGet(this, _ActiveCall_status, "f"))) {
                __classPrivateFieldGet(this, _ActiveCall_setStatus, "f").call(this, 'accepted');
                this.emit('accepted');
            }
        });
        _ActiveCall_confirmConnected.set(this, () => {
            if (__classPrivateFieldGet(this, _ActiveCall_preRingingTimer, "f")) {
                clearTimeout(__classPrivateFieldGet(this, _ActiveCall_preRingingTimer, "f"));
                __classPrivateFieldSet(this, _ActiveCall_preRingingTimer, null, "f");
            }
            if (!['connected', 'audio_ready', 'streaming'].includes(__classPrivateFieldGet(this, _ActiveCall_status, "f"))) {
                this.connectedAt = Date.now();
                __classPrivateFieldGet(this, _ActiveCall_setStatus, "f").call(this, 'connected');
                this.emit('connected');
            }
        }
        /** @internal — call once the audio feeder actually starts pushing frames. */
        );
        /** @internal — call once the audio feeder actually starts pushing frames. */
        this._confirmAudioReady = () => {
            if (!['audio_ready', 'streaming'].includes(__classPrivateFieldGet(this, _ActiveCall_status, "f"))) {
                __classPrivateFieldGet(this, _ActiveCall_setStatus, "f").call(this, 'audio_ready');
                this.emit('audioReady');
            }
        };
        /** @internal — call on the first real audio chunk sent. */
        this._confirmStreaming = () => {
            if (__classPrivateFieldGet(this, _ActiveCall_status, "f") !== 'streaming') {
                __classPrivateFieldGet(this, _ActiveCall_setStatus, "f").call(this, 'streaming');
                this.emit('streaming');
            }
        };
        /** @internal — called by the engine wiring below on WASM call-state change */
        this._updateState = (state) => {
            __classPrivateFieldSet(this, _ActiveCall_state, state, "f");
            if (state === CallState.PreacceptReceived)
                __classPrivateFieldGet(this, _ActiveCall_confirmRinging, "f").call(this);
            else if (state === CallState.AcceptReceived)
                __classPrivateFieldGet(this, _ActiveCall_confirmAccepted, "f").call(this);
            else if (state === CallState.Active)
                __classPrivateFieldGet(this, _ActiveCall_confirmConnected, "f").call(this);
            else if (state === CallState.Idle || state === CallState.Ending)
                this._forceEnd('ended');
        };
        /** @internal — called on raw signaling tags (terminate/reject/preaccept/accept/receipt),
         *  which typically reach us faster than a WASM call-state round trip. */
        this._handleSignalingEvent = (tag, reason) => {
            if (__classPrivateFieldGet(this, _ActiveCall_ended, "f"))
                return;
            if (tag === 'terminate') {
                const normalized = String(reason || '').toLowerCase();
                if (normalized.includes('unavailable') || normalized.includes('peer_offline')) {
                    this._handleUnreachable();
                }
                else if (normalized.includes('timeout')) {
                    this._handleTimeout();
                }
                else if (normalized.includes('reject') || normalized.includes('declined')) {
                    this._handleRejected();
                }
                else {
                    this._forceEnd(reason || 'remote_end');
                }
            }
            else if (tag === 'reject') {
                this._handleRejected();
            }
            else if (tag === 'preaccept' || tag === 'ringing' || tag === 'receipt') {
                __classPrivateFieldGet(this, _ActiveCall_confirmRinging, "f").call(this);
            }
            else if (tag === 'accept') {
                __classPrivateFieldGet(this, _ActiveCall_confirmAccepted, "f").call(this);
            }
        };
        /** @internal — called on signaling-layer errors (ack timeout, 404/480, etc.) */
        this._handleSignalingError = (_signalingTag, errorType) => {
            if (__classPrivateFieldGet(this, _ActiveCall_ended, "f"))
                return;
            if (errorType === 'unreachable' || errorType === 'error_404' || errorType === 'error_480') {
                this._handleUnreachable();
            }
            else if (errorType === 'ack_timeout') {
                this._handleTimeout();
            }
            else {
                this._forceFail(`signaling error (${errorType})`);
            }
        };
        /** @internal */
        this._handleUnreachable = () => {
            if (__classPrivateFieldGet(this, _ActiveCall_ended, "f"))
                return;
            __classPrivateFieldGet(this, _ActiveCall_setStatus, "f").call(this, 'unreachable');
            this._forceEnd('unreachable');
        };
        /** @internal */
        this._handleRejected = () => {
            if (__classPrivateFieldGet(this, _ActiveCall_ended, "f"))
                return;
            __classPrivateFieldGet(this, _ActiveCall_setStatus, "f").call(this, 'rejected');
            this._forceEnd('rejected');
        };
        /** @internal */
        this._handleTimeout = () => {
            if (__classPrivateFieldGet(this, _ActiveCall_ended, "f"))
                return;
            __classPrivateFieldGet(this, _ActiveCall_setStatus, "f").call(this, 'timeout');
            this._forceEnd('timeout');
        };
        /** @internal */
        this._forceFail = (reason) => {
            if (__classPrivateFieldGet(this, _ActiveCall_ended, "f"))
                return;
            __classPrivateFieldGet(this, _ActiveCall_setStatus, "f").call(this, 'failed');
            this.emit('error', new Error(`VoIP call failed: ${reason}`));
            this._forceEnd(reason);
        };
        /** @internal */
        this._emitAudio = (pcm) => {
            this.emit('audio', pcm);
        };
        /** @internal */
        this._forceEnd = (reason) => {
            if (__classPrivateFieldGet(this, _ActiveCall_ended, "f"))
                return;
            __classPrivateFieldSet(this, _ActiveCall_ended, true, "f");
            this.endedAt = Date.now();
            __classPrivateFieldGet(this, _ActiveCall_clearTimers, "f").call(this);
            if (!['unreachable', 'rejected', 'timeout', 'failed'].includes(__classPrivateFieldGet(this, _ActiveCall_status, "f"))) {
                __classPrivateFieldGet(this, _ActiveCall_setStatus, "f").call(this, 'ended');
            }
            this.stopVideo();
            this.emit('ended', reason);
            __classPrivateFieldGet(this, _ActiveCall_endResolver, "f").call(this, reason);
        };
        _ActiveCall_handlePreRingingTimeout.set(this, () => {
            if (__classPrivateFieldGet(this, _ActiveCall_ended, "f") || ['ringing', 'accepted', 'connected', 'audio_ready', 'streaming'].includes(__classPrivateFieldGet(this, _ActiveCall_status, "f"))) {
                return;
            }
            this._handleUnreachable();
        });
        _ActiveCall_clearTimers.set(this, () => {
            if (__classPrivateFieldGet(this, _ActiveCall_endTimer, "f")) {
                clearTimeout(__classPrivateFieldGet(this, _ActiveCall_endTimer, "f"));
                __classPrivateFieldSet(this, _ActiveCall_endTimer, null, "f");
            }
            if (__classPrivateFieldGet(this, _ActiveCall_preRingingTimer, "f")) {
                clearTimeout(__classPrivateFieldGet(this, _ActiveCall_preRingingTimer, "f"));
                __classPrivateFieldSet(this, _ActiveCall_preRingingTimer, null, "f");
            }
        });
        this._durationMs = durationMs;
        __classPrivateFieldSet(this, _ActiveCall_endPromise, new Promise(res => {
            __classPrivateFieldSet(this, _ActiveCall_endResolver, res, "f");
        }), "f");
        if (durationMs > 0) {
            __classPrivateFieldSet(this, _ActiveCall_endTimer, setTimeout(() => this.end('completed'), durationMs), "f");
        }
        if (preRingingTimeoutMs > 0) {
            __classPrivateFieldSet(this, _ActiveCall_preRingingTimer, setTimeout(() => __classPrivateFieldGet(this, _ActiveCall_handlePreRingingTimeout, "f").call(this), preRingingTimeoutMs), "f");
        }
    }
    get state() {
        return __classPrivateFieldGet(this, _ActiveCall_state, "f");
    }
    get status() {
        return __classPrivateFieldGet(this, _ActiveCall_status, "f");
    }
    get ended() {
        return __classPrivateFieldGet(this, _ActiveCall_ended, "f");
    }
}
_ActiveCall_state = new WeakMap(), _ActiveCall_status = new WeakMap(), _ActiveCall_endResolver = new WeakMap(), _ActiveCall_endPromise = new WeakMap(), _ActiveCall_endTimer = new WeakMap(), _ActiveCall_preRingingTimer = new WeakMap(), _ActiveCall_ended = new WeakMap(), _ActiveCall_setStatus = new WeakMap(), _ActiveCall_confirmRinging = new WeakMap(), _ActiveCall_confirmAccepted = new WeakMap(), _ActiveCall_confirmConnected = new WeakMap(), _ActiveCall_handlePreRingingTimeout = new WeakMap(), _ActiveCall_clearTimers = new WeakMap();
export const attachVoipToSocket = (sock) => {
    let signaling = null;
    let signalingReadyPromise = null;
    let callbacksWired = false;
    let maxConcurrentCalls = Number.POSITIVE_INFINITY;
    /** Every call this socket currently has open, keyed by callId — one
     *  entry whether there's a single call or several placed concurrently. */
    const calls = new Map();
    /** Brings up the (single, shared) signaling bridge on first use, and wires
     *  the inbound call/receipt socket listeners exactly once. Each concurrent
     *  call still gets its own isolated WasmEngine + RelayRtcTransport — see
     *  `createCallContext` — signaling is the one thing safe to share, since
     *  it already keys its internal peer/session bookkeeping by callId. */
    const ensureSignalingReady = async () => {
        if (!signalingReadyPromise) {
            signalingReadyPromise = (async () => {
                const bridge = new SignalingBridge({ sock });
                await bridge.init();
                signaling = bridge;
            })();
        }
        await signalingReadyPromise;
        if (!signaling)
            throw new Error('VoIP signaling failed to initialize');
        if (!callbacksWired) {
            callbacksWired = true;
            // Fan the raw node out to every open call's own engine — each call's
            // signaling processing internally no-ops unless the node's call-id
            // matches that call, so this is safe even with several calls live.
            sock.ws.on('CB:call', (node) => {
                for (const ctx of calls.values()) {
                    signaling.processIncomingCall(node, ctx.engine, ctx.call.callId);
                }
            });
            sock.ws.on('CB:receipt', (node) => {
                if (!isCallReceiptNode(node))
                    return;
                for (const ctx of calls.values()) {
                    signaling.processIncomingReceipt(node, ctx.engine, ctx.call.callId);
                }
            });
            // Fast-path reject/unreachable/timeout detection straight off the raw
            // signaling tags, instead of waiting on a WASM call-state round trip.
            signaling.setSignalingEventListener((tag, reason, callId) => {
                calls.get(callId)?.call._handleSignalingEvent(tag, reason);
            });
            signaling.setSignalingErrorListener((tag, errorType, _peerJid, callId) => {
                calls.get(callId)?.call._handleSignalingError(tag, errorType);
            });
        }
        return signaling;
    };
    /** Builds a fresh, fully isolated WASM engine + relay transport + capture
     *  state for one call. Called once per `initiateCall()`, so concurrent
     *  calls never share an audio/video buffer or WASM instance. */
    const createCallContext = async (callId) => {
        const bridge = await ensureSignalingReady();
        const ctx = {
            call: null,
            engine: null,
            relay: null,
            capturePtr: 0,
            captureChunkBytes: 0,
            captureSampleRate: 16000,
            captureChannels: 1,
            captureFramesPerChunk: 320,
            feeder: null,
            videoPtr: 0
        };
        const handleCallEvent = (eventType, eventData) => {
            if (eventType === 16 && eventData) {
                try {
                    const parsed = JSON.parse(eventData);
                    const info = parsed.call_info ?? parsed.callInfo ?? {};
                    const callState = Number(info.call_state ?? info.callState ?? 0);
                    ctx.call?._updateState(callState);
                }
                catch { }
            }
            else if (eventType === 156 && eventData) {
                try {
                    const update = JSON.parse(eventData);
                    ctx.relay?.updateRelayList(update);
                }
                catch { }
            }
            else if (eventType === 2) {
                ctx.call?._forceEnd('remote_end');
            }
        };
        const handleAudioCaptureInit = (config) => {
            if (!ctx.engine)
                return;
            ctx.captureSampleRate = config.sampleRate || 16000;
            ctx.captureChannels = config.channels || 1;
            ctx.captureFramesPerChunk = config.framesPerChunk || 320;
            const chunkSamples = ctx.captureFramesPerChunk * ctx.captureChannels;
            ctx.captureChunkBytes = chunkSamples * Float32Array.BYTES_PER_ELEMENT;
            ctx.capturePtr = ctx.engine.malloc(ctx.captureChunkBytes);
        };
        const handleAudioCaptureStart = () => {
            if (!ctx.engine || !ctx.capturePtr)
                return;
            const audioSource = ctx.call?._audioSource ?? 'silence';
            const repeatAudio = ctx.call?._repeatAudio ?? false;
            ctx.call?._confirmAudioReady();
            ctx.call?._confirmStreaming();
            ctx.feeder = new AudioFeeder(ctx.captureSampleRate, ctx.captureChannels, ctx.captureFramesPerChunk, chunk => {
                if (ctx.engine && ctx.capturePtr)
                    ctx.engine.sendAudioData(chunk, ctx.capturePtr);
            }, audioSource, repeatAudio);
            ctx.feeder.start();
            if (ctx.engine && ctx.call?._videoSource && !ctx.videoPtr) {
                const frameBytes = Math.ceil(ctx.call._videoWidth / 2) * 2 * (Math.ceil(ctx.call._videoHeight / 2) * 2) * 1.5;
                ctx.videoPtr = ctx.engine.malloc(Math.ceil(frameBytes));
                ctx.call.startVideo(ctx.videoPtr);
            }
        };
        const handleAudioCaptureStop = () => {
            ctx.feeder?.stop();
            ctx.feeder = null;
            if (ctx.engine && ctx.capturePtr) {
                try {
                    ctx.engine.free(ctx.capturePtr);
                }
                catch { }
                ctx.capturePtr = 0;
            }
            ctx.call?.stopVideo();
            if (ctx.engine && ctx.videoPtr) {
                try {
                    ctx.engine.free(ctx.videoPtr);
                }
                catch { }
                ctx.videoPtr = 0;
            }
        };
        const relay = new RelayRtcTransport({
            onTransportMessage: (data, ip, port) => ctx.engine?.handleOnTransportMessage(data, ip, port),
            onIceRtt: (rttMs, ip, port) => ctx.engine?.updateIceRtt(rttMs, ip, port)
        });
        const engine = new WasmEngine({
            callbacks: {
                onSignalingXmpp: (peerJid, cid, xmlPayload) => bridge.sendSignaling(peerJid, cid, xmlPayload),
                onCallEvent: (eventType, eventData) => handleCallEvent(eventType, eventData),
                sendDataToRelay: (data, ip, port) => relay.send(data, ip, port),
                onAudioCaptureInit: config => handleAudioCaptureInit(config),
                onAudioCaptureStart: () => handleAudioCaptureStart(),
                onAudioCaptureStop: () => handleAudioCaptureStop(),
                onAudioPlaybackData: audioData => ctx.call?._emitAudio(audioData),
                cryptoHkdf: computeHkdf,
                hmacSha256: computeHmacSha256
            }
        });
        await engine.initialize();
        // registerCallEngine claims the primary/fallback slot too, but only if
        // nothing already holds it — so inbound offers still have somewhere to
        // land without concurrent calls stealing that slot from each other.
        bridge.registerCallEngine(callId, engine);
        const selfPnJid = sock.authState.creds.me?.id;
        const selfLidJid = sock.authState.creds.me?.lid;
        engine.initVoipStack(selfPnJid, toBareJid(selfPnJid), selfLidJid);
        await engine.waitForVoipStackReady();
        try {
            engine.updateNetworkMedium(2, 0);
        }
        catch { }
        ctx.engine = engine;
        ctx.relay = relay;
        return ctx;
    };
    /** Tears down one call's isolated engine/relay and drops it from the map. */
    const teardownCallContext = (callId, ctx) => {
        calls.delete(callId);
        signaling?.unregisterCallEngine(callId);
        void ctx.relay.closeAll();
        try {
            ctx.engine.destroy();
        }
        catch { }
    };
    /** Places an outbound voice call. Accepts either a bare phone number
     *  ("12345678901") or an already-formed JID ("12345678901@s.whatsapp.net").
     *  Safe to call multiple times concurrently — each call gets its own
     *  isolated WASM engine, so they don't interfere with each other. */
    const initiateCall = async (jidOrPhoneNumber, opts = {}) => {
        const bridge = await ensureSignalingReady();
        if (calls.size >= maxConcurrentCalls) {
            throw new Error(`Maximum concurrent call limit (${maxConcurrentCalls}) reached.`);
        }
        const targetPnJid = jidOrPhoneNumber.includes('@')
            ? toBareJid(jidOrPhoneNumber)
            : `${jidOrPhoneNumber.replace(/\D/g, '')}@s.whatsapp.net`;
        const durationMs = opts.durationMs ?? opts.durationMS ?? 120000;
        const audioSource = opts.audioSource ?? 'silence';
        const isVideo = Boolean(opts.isVideo);
        if (isVideo && !opts.videoSource) {
            throw new Error('videoSource is required when isVideo is true');
        }
        const peerLid = await bridge.resolveLid(targetPnJid);
        if (!peerLid)
            throw new Error(`Could not resolve LID for ${targetPnJid}`);
        for (const jid of [targetPnJid, peerLid]) {
            try {
                await sock.presenceSubscribe(jid);
            }
            catch { }
        }
        await new Promise(r => setTimeout(r, 750));
        const peerDeviceJids = await bridge.discoverPeerDevices(peerLid);
        const deviceList = peerDeviceJids.length ? peerDeviceJids : [toBareJid(peerLid)];
        await bridge.ensureSessionsForPeers(deviceList);
        await new Promise(r => setTimeout(r, 500));
        await bridge.issueTcToken(peerLid);
        const tcToken = await bridge.ensureTcToken(peerLid, targetPnJid);
        const callId = ('00' + randomBytes(16).toString('hex').slice(2)).toUpperCase();
        const ctx = await createCallContext(callId);
        const preRingingTimeoutMs = Number(opts.preRingingTimeoutMs ?? DEFAULT_PRE_RINGING_TIMEOUT_MS);
        const call = new ActiveCall(callId, peerLid, ctx.engine, durationMs, targetPnJid, preRingingTimeoutMs);
        call._audioSource = audioSource;
        call._repeatAudio = Boolean(opts.repeatAudio ?? opts.repeat ?? false);
        call.isVideo = isVideo;
        if (isVideo) {
            call._videoSource = opts.videoSource;
            call._videoWidth = opts.videoWidth ?? opts.width ?? 640;
            call._videoHeight = opts.videoHeight ?? opts.height ?? 480;
            call._videoFps = opts.videoFps ?? opts.fps ?? 15;
            call._videoLoop = Boolean(opts.videoLoop ?? opts.repeatVideo ?? opts.loop ?? false);
            call.isHorizontal = Boolean(opts.isHorizontal ?? opts.horizontal ?? false);
            call._videoOrientation = Number(opts.orientation ?? opts.videoOrientation ?? (call.isHorizontal ? 2 : 0));
        }
        ctx.call = call;
        calls.set(callId, ctx);
        ctx.engine.startCall({
            peerJid: peerLid,
            peerPn: targetPnJid,
            peerList: deviceList,
            callId,
            isVideo,
            isLidCall: true,
            isFromDialer: false,
            extraData: tcToken
        });
        call.once('ended', () => teardownCallContext(callId, ctx));
        return call;
    };
    /** Places several outbound calls concurrently. Failures for individual
     *  targets don't stop the rest — check the returned array's length
     *  against `requests.length` if you need to know which ones failed. */
    const initiateCalls = async (requests) => {
        const settled = await Promise.allSettled(requests.map(r => initiateCall(r.jid, r.options)));
        return settled.filter((r) => r.status === 'fulfilled').map(r => r.value);
    };
    /** Snapshot of every call currently open on this socket. */
    const getActiveCalls = async () => Array.from(calls.values()).map(ctx => ctx.call.getSummary());
    /** Look up one specific open call by its callId. */
    const getCall = async (callId) => calls.get(callId)?.call;
    const getActiveCallCount = async () => calls.size;
    /** Ends one specific call by callId; a no-op if that callId isn't open. */
    const endCall = async (callId) => {
        calls.get(callId)?.call.end();
    };
    /** Ends every call currently open on this socket. */
    const endAllCalls = async () => {
        for (const ctx of calls.values())
            ctx.call.end();
    };
    /** Adjusts socket-level VoIP limits, e.g. `{ maxConcurrentCalls: 10 }`. */
    const setVoipOptions = async (options) => {
        if (typeof options.maxConcurrentCalls === 'number' && options.maxConcurrentCalls > 0) {
            maxConcurrentCalls = options.maxConcurrentCalls;
        }
    };
    /** Tears down every open call and its isolated engine/relay (does not
     *  touch the underlying socket — that's owned by the caller, not by VoIP). */
    const disconnectVoip = () => {
        for (const [callId, ctx] of calls) {
            ctx.call._forceEnd('disconnect');
            teardownCallContext(callId, ctx);
        }
        signaling = null;
        signalingReadyPromise = null;
        callbacksWired = false;
    };
    return {
        initiateCall,
        initiateCalls,
        getActiveCalls,
        getCall,
        getActiveCallCount,
        endCall,
        endAllCalls,
        setVoipOptions,
        disconnectVoip
    };
};
//# sourceMappingURL=voip-engine.js.map