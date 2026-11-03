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
var _VoipClient_config, _VoipClient_sock;
/**
 * Standalone VoIP client — creates its OWN independent WhatsApp connection
 * (own auth directory, own QR scan) and exposes `connect()`/`call()`/
 * `disconnect()`, for cases where you want calling fully decoupled from your
 * main bot's session. For the common case (calling from your existing bot),
 * use `sock.initiateCall()` instead — every socket created via the standard
 * `makeWASocket()` factory already has it wired in (see `Socket/username.ts`
 * → `attachVoipToSocket`, `Voip/voip-engine.ts`).
 *
 * This is this fork's own internal port of baileys-caller's `VoipClient`
 * (https://github.com/SheIITear/baileys-caller, MIT, by ShellTear) — only
 * the "create a brand-new connection" part (auth state, socket creation,
 * QR display, auto-reconnect on the post-QR 515 stream-error path) is
 * reimplemented here. The actual WASM/signaling/relay/audio call
 * orchestration is NOT duplicated — it's shared with the same-session
 * integration via `sock.initiateCall()`, since `makeWASocket()` already
 * wires that in for every socket it creates.
 */
import { resolve } from 'path';
import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js';
import { makeUsernameSocket } from '../Socket/username.js';
import { DisconnectReason } from '../Types/index.js';
import { useMultiFileAuthState } from '../Utils/use-multi-file-auth-state.js';
export { CallState } from './types.js';
const silentLogger = {
    level: 'silent',
    child: () => silentLogger,
    trace: () => { },
    debug: () => { },
    info: () => { },
    warn: () => { },
    error: () => { },
    fatal: () => { }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
};
/**
 * Top-level standalone client. Connects to WhatsApp on its own dedicated
 * session and lets you place calls.
 */
export class VoipClient {
    constructor(config) {
        _VoipClient_config.set(this, void 0);
        _VoipClient_sock.set(this, null);
        /** Connect to WhatsApp on a fresh, independent session. */
        this.connect = async () => {
            const authDir = resolve(__classPrivateFieldGet(this, _VoipClient_config, "f").authDir);
            const { state, saveCreds } = await useMultiFileAuthState(authDir);
            const createSocket = () => makeUsernameSocket({
                ...DEFAULT_CONNECTION_CONFIG,
                auth: state,
                emitOwnEvents: true,
                logger: silentLogger
            });
            // Connect with auto-reconnect on the post-QR 515 stream-error path.
            await new Promise((resolveOpen, rejectOpen) => {
                let opened = false;
                let retries = 0;
                const maxRetries = 5;
                const connectSocket = () => {
                    __classPrivateFieldSet(this, _VoipClient_sock, createSocket(), "f");
                    __classPrivateFieldGet(this, _VoipClient_sock, "f").ev.on('creds.update', saveCreds);
                    __classPrivateFieldGet(this, _VoipClient_sock, "f").ev.on('connection.update', update => {
                        if (update.qr) {
                            const qr = update.qr;
                            void import('qrcode-terminal')
                                .then(qrt => {
                                const generate = qrt
                                    .default?.generate;
                                generate?.(qr, { small: true });
                            })
                                .catch(() => {
                                console.log('Scan this QR code in WhatsApp > Linked Devices:');
                                console.log(qr);
                            });
                        }
                        if (update.connection === 'open') {
                            opened = true;
                            resolveOpen();
                            return;
                        }
                        if (update.connection === 'close' && !opened) {
                            const statusCode = update.lastDisconnect?.error?.output
                                ?.statusCode;
                            const shouldReconnect = statusCode === 515 || statusCode === DisconnectReason.restartRequired;
                            if (shouldReconnect && retries < maxRetries) {
                                retries += 1;
                                setTimeout(connectSocket, 1000);
                            }
                            else {
                                rejectOpen(update.lastDisconnect?.error ?? new Error('socket closed before open'));
                            }
                        }
                    });
                };
                connectSocket();
            });
        };
        /** Place an outbound voice call. Delegates to `sock.initiateCall()`,
         *  already wired in by `makeWASocket()`'s standard socket composition.
         *  Safe to call multiple times concurrently — see `callMany`. */
        this.call = async (phoneNumber, opts = {}) => {
            if (!__classPrivateFieldGet(this, _VoipClient_sock, "f"))
                throw new Error('Not connected. Call connect() first.');
            return __classPrivateFieldGet(this, _VoipClient_sock, "f").initiateCall(phoneNumber, opts);
        };
        /** Place several outbound calls concurrently. */
        this.callMany = async (requests) => {
            if (!__classPrivateFieldGet(this, _VoipClient_sock, "f"))
                throw new Error('Not connected. Call connect() first.');
            return __classPrivateFieldGet(this, _VoipClient_sock, "f").initiateCalls(requests);
        };
        /** Snapshot of every call currently open on this client's socket. */
        this.getActiveCalls = async () => {
            if (!__classPrivateFieldGet(this, _VoipClient_sock, "f"))
                throw new Error('Not connected. Call connect() first.');
            return __classPrivateFieldGet(this, _VoipClient_sock, "f").getActiveCalls();
        };
        /** Look up one specific open call by its callId. */
        this.getCall = async (callId) => {
            if (!__classPrivateFieldGet(this, _VoipClient_sock, "f"))
                throw new Error('Not connected. Call connect() first.');
            return __classPrivateFieldGet(this, _VoipClient_sock, "f").getCall(callId);
        };
        this.getActiveCallCount = async () => {
            if (!__classPrivateFieldGet(this, _VoipClient_sock, "f"))
                throw new Error('Not connected. Call connect() first.');
            return __classPrivateFieldGet(this, _VoipClient_sock, "f").getActiveCallCount();
        };
        /** Ends one specific call by callId. */
        this.endCall = async (callId) => {
            if (!__classPrivateFieldGet(this, _VoipClient_sock, "f"))
                throw new Error('Not connected. Call connect() first.');
            return __classPrivateFieldGet(this, _VoipClient_sock, "f").endCall(callId);
        };
        /** Ends every call currently open on this client's socket. */
        this.endAllCalls = async () => {
            if (!__classPrivateFieldGet(this, _VoipClient_sock, "f"))
                throw new Error('Not connected. Call connect() first.');
            return __classPrivateFieldGet(this, _VoipClient_sock, "f").endAllCalls();
        };
        /** Adjusts socket-level VoIP limits, e.g. `{ maxConcurrentCalls: 10 }`. */
        this.setOptions = async (options) => {
            if (!__classPrivateFieldGet(this, _VoipClient_sock, "f"))
                throw new Error('Not connected. Call connect() first.');
            return __classPrivateFieldGet(this, _VoipClient_sock, "f").setVoipOptions(options);
        };
        /** Tear down the WhatsApp socket and release VoIP resources. */
        this.disconnect = () => {
            __classPrivateFieldGet(this, _VoipClient_sock, "f")?.disconnectVoip?.();
            void __classPrivateFieldGet(this, _VoipClient_sock, "f")?.end?.(undefined);
            __classPrivateFieldSet(this, _VoipClient_sock, null, "f");
        };
        __classPrivateFieldSet(this, _VoipClient_config, config, "f");
    }
}
_VoipClient_config = new WeakMap(), _VoipClient_sock = new WeakMap();
/**
 * Creates and connects a dedicated, standalone VoIP session.
 *
 * @example
 * const voip = await createVoipClient({ authDir: './voip_auth' })
 * const call = await voip.call('12345678901', { audioSource: './hello.mp3' })
 * call.on('connected', () => console.log('call connected'))
 * call.on('ended', reason => console.log('call ended:', reason))
 */
export const createVoipClient = async (config) => {
    const client = new VoipClient(config);
    await client.connect();
    return client;
};
//# sourceMappingURL=voip-client.js.map