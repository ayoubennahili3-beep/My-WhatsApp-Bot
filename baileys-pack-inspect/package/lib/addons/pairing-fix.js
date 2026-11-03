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
export const createPairingQueue = (sendPairingIQ) => {
    let ready = false;
    let inProgress = false;
    let pendingResolve;
    let pendingReject;
    const setReady = () => {
        ready = true;
        if (pendingResolve) {
            const r = pendingResolve;
            pendingResolve = undefined;
            pendingReject = undefined;
            r();
        }
    };
    const clear = (err) => {
        if (pendingReject) {
            pendingReject(err ?? new Error('Connection closed before pairing completed'));
            pendingResolve = undefined;
            pendingReject = undefined;
        }
        ready = false;
        inProgress = false;
    };
    const requestPairingCode = async (phoneNumber, customPairingCode) => {
        if (inProgress) {
            throw new Error('A pairing request is already in progress');
        }
        inProgress = true;
        if (ready) {
            try {
                return await sendPairingIQ(phoneNumber, customPairingCode);
            }
            finally {
                inProgress = false;
            }
        }
        return new Promise((resolve, reject) => {
            pendingResolve = () => {
                sendPairingIQ(phoneNumber, customPairingCode)
                    .then(resolve)
                    .catch(reject)
                    .finally(() => {
                    inProgress = false;
                });
            };
            pendingReject = (err) => {
                inProgress = false;
                reject(err);
            };
        });
    };
    return { setReady, clear, requestPairingCode };
};
//# sourceMappingURL=pairing-fix.js.map