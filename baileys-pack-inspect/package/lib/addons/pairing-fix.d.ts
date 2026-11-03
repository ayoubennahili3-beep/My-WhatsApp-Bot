/**
 * addon: pairing-fix
 * Source patch: Baileys-fix-pairing-code
 *
 * Problem: requestPairingCode() fires immediately even if the WebSocket
 * hasn't yet received the `pair-device` stanza from WA servers, causing
 * 404/timeout errors.
 *
 * Fix: wraps the raw pairing IQ (sendPairingIQ) in a queue that waits
 * for `pairingReady` before firing.  Socket.ts must call
 * `setPairingReady()` when it receives the `pair-device` stanza and
 * `clearPairingState()` on disconnect.
 *
 * Usage:
 *   import { createPairingQueue } from '../addons/pairing-fix'
 *   const pq = createPairingQueue(sendPairingIQFn)
 *   // In pair-device handler:  pq.setReady()
 *   // In disconnect handler:   pq.clear()
 *   // Replace requestPairingCode with: pq.requestPairingCode
 */
export type SendPairingIQFn = (phoneNumber: string, customPairingCode?: string) => Promise<string>;
export type PairingQueue = {
    /** Mark socket as ready to accept a pairing IQ */
    setReady: () => void;
    /** Clear all pending state (call on disconnect) */
    clear: (err?: Error) => void;
    /** Drop-in replacement for requestPairingCode */
    requestPairingCode: (phoneNumber: string, customPairingCode?: string) => Promise<string>;
};
export declare const createPairingQueue: (sendPairingIQ: SendPairingIQFn) => PairingQueue;
//# sourceMappingURL=pairing-fix.d.ts.map