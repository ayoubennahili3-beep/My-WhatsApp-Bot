import type { BaileysEventEmitter } from '../Types/index.js';
/**
 * Monkey-patches `ev.emit` to append every Baileys event as a JSON line
 * (NDJSON) to `filename`. Useful for debugging or replaying sessions.
 *
 * @example
 * captureEventStream(sock.ev, './events.ndjson')
 */
export declare const captureEventStream: (ev: BaileysEventEmitter, filename: string) => void;
/**
 * Reads an NDJSON file written by {@link captureEventStream} and replays
 * each event on a new EventEmitter.
 *
 * @param filename        Path to the NDJSON file.
 * @param delayIntervalMs Milliseconds to wait between events (default 0).
 * @returns `{ ev, task }` — ev is the emitter, task resolves when done.
 */
export declare const readAndEmitEventStream: (filename: string, delayIntervalMs?: number) => {
    ev: BaileysEventEmitter;
    task: Promise<void>;
};
//# sourceMappingURL=baileys-event-stream.d.ts.map