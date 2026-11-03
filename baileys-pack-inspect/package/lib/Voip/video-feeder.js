var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _VideoFeeder_running, _VideoFeeder_proc, _VideoFeeder_pending, _VideoFeeder_stderr, _VideoFeeder_handleData;
/**
 * Video feeder.
 *
 * Spawns ffmpeg to decode `source` into raw YUV420p frames at the requested
 * resolution/fps, then emits each decoded frame via `onFrame`. Mirrors
 * `audio-feeder.ts`'s decode-and-chunk design, but for video.
 */
import { execFile, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
const FFMPEG_BIN = 'ffmpeg';
const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;
const DEFAULT_FPS = 15;
const MAX_STDERR_CHARS = 16 * 1024;
let ffmpegAvailableCache = null;
/** Checks (and caches) whether an `ffmpeg` binary is reachable on PATH. */
export const checkFfmpegAvailable = (bin = FFMPEG_BIN) => {
    if (ffmpegAvailableCache !== null)
        return Promise.resolve(ffmpegAvailableCache);
    return new Promise(res => {
        execFile(bin, ['-version'], { timeout: 5000 }, err => {
            ffmpegAvailableCache = !err;
            res(ffmpegAvailableCache);
        });
    });
};
export class VideoFeeder {
    constructor(source, onFrame, onEnd = null, onError = null, options = {}) {
        this.onFrame = onFrame;
        this.onEnd = onEnd;
        this.onError = onError;
        _VideoFeeder_running.set(this, false);
        _VideoFeeder_proc.set(this, null);
        _VideoFeeder_pending.set(this, Buffer.alloc(0));
        _VideoFeeder_stderr.set(this, '');
        this.framesProduced = 0;
        this.framesEmitted = 0;
        this.bytesProduced = 0;
        this.start = () => {
            if (__classPrivateFieldGet(this, _VideoFeeder_proc, "f") || __classPrivateFieldGet(this, _VideoFeeder_running, "f"))
                return;
            __classPrivateFieldSet(this, _VideoFeeder_running, true, "f");
            this.framesProduced = 0;
            this.framesEmitted = 0;
            this.bytesProduced = 0;
            __classPrivateFieldSet(this, _VideoFeeder_pending, Buffer.alloc(0), "f");
            __classPrivateFieldSet(this, _VideoFeeder_stderr, '', "f");
            const scaleFilter = `scale=${this.width}:${this.height}:force_original_aspect_ratio=decrease,pad=${this.width}:${this.height}:(ow-iw)/2:(oh-ih)/2`;
            const args = ['-hide_banner', '-loglevel', 'error'];
            if (this.loop && !this.source.startsWith('lavfi:')) {
                args.push('-stream_loop', '-1');
            }
            if (this.source.startsWith('lavfi:')) {
                args.push('-f', 'lavfi', '-re', '-i', this.source.slice(6));
            }
            else {
                args.push('-re', '-i', this.source);
            }
            args.push('-an', '-vf', scaleFilter, '-r', String(this.fps), '-pix_fmt', 'yuv420p', '-f', 'rawvideo', 'pipe:1');
            try {
                __classPrivateFieldSet(this, _VideoFeeder_proc, spawn(FFMPEG_BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] }), "f");
            }
            catch (err) {
                __classPrivateFieldSet(this, _VideoFeeder_running, false, "f");
                this.onError?.(err);
                return;
            }
            const proc = __classPrivateFieldGet(this, _VideoFeeder_proc, "f");
            proc.stdout?.on('data', (chunk) => {
                if (!__classPrivateFieldGet(this, _VideoFeeder_running, "f"))
                    return;
                __classPrivateFieldGet(this, _VideoFeeder_handleData, "f").call(this, chunk);
            });
            proc.stderr?.on('data', (chunk) => {
                __classPrivateFieldSet(this, _VideoFeeder_stderr, (__classPrivateFieldGet(this, _VideoFeeder_stderr, "f") + chunk.toString()).slice(-MAX_STDERR_CHARS), "f");
            });
            proc.on('error', (err) => {
                __classPrivateFieldSet(this, _VideoFeeder_running, false, "f");
                this.onError?.(err);
            });
            proc.on('close', (code) => {
                if (__classPrivateFieldGet(this, _VideoFeeder_proc, "f") === proc)
                    __classPrivateFieldSet(this, _VideoFeeder_proc, null, "f");
                const wasRunning = __classPrivateFieldGet(this, _VideoFeeder_running, "f");
                __classPrivateFieldSet(this, _VideoFeeder_running, false, "f");
                if (code !== 0 && code !== null && wasRunning) {
                    const errMsg = __classPrivateFieldGet(this, _VideoFeeder_stderr, "f").trim() || `FFmpeg exited with code ${code}`;
                    this.onError?.(new Error(errMsg));
                }
                else if (wasRunning) {
                    this.onEnd?.();
                }
            });
        };
        _VideoFeeder_handleData.set(this, (chunk) => {
            this.bytesProduced += chunk.length;
            __classPrivateFieldSet(this, _VideoFeeder_pending, Buffer.concat([__classPrivateFieldGet(this, _VideoFeeder_pending, "f"), chunk]), "f");
            while (__classPrivateFieldGet(this, _VideoFeeder_pending, "f").length >= this.frameSizeBytes) {
                const frameBuf = __classPrivateFieldGet(this, _VideoFeeder_pending, "f").subarray(0, this.frameSizeBytes);
                __classPrivateFieldSet(this, _VideoFeeder_pending, __classPrivateFieldGet(this, _VideoFeeder_pending, "f").subarray(this.frameSizeBytes), "f");
                this.framesProduced += 1;
                this.framesEmitted += 1;
                try {
                    this.onFrame(frameBuf, this.width, this.height, this.fps);
                }
                catch (err) {
                    this.onError?.(err);
                }
            }
        });
        this.stop = () => {
            __classPrivateFieldSet(this, _VideoFeeder_running, false, "f");
            if (__classPrivateFieldGet(this, _VideoFeeder_proc, "f")) {
                try {
                    __classPrivateFieldGet(this, _VideoFeeder_proc, "f").kill('SIGKILL');
                }
                catch { }
                __classPrivateFieldSet(this, _VideoFeeder_proc, null, "f");
            }
            __classPrivateFieldSet(this, _VideoFeeder_pending, Buffer.alloc(0), "f");
        };
        if (!source)
            throw new Error('Video source is required');
        let resolvedSource = source;
        if (!resolvedSource.startsWith('lavfi:')) {
            if (!existsSync(resolvedSource)) {
                const cwdResolved = resolvePath(process.cwd(), resolvedSource);
                if (existsSync(cwdResolved)) {
                    resolvedSource = cwdResolved;
                }
                else {
                    throw new Error(`Video source file not found: ${source}`);
                }
            }
        }
        this.source = resolvedSource;
        let width = Number(options.width || DEFAULT_WIDTH);
        let height = Number(options.height || DEFAULT_HEIGHT);
        if (width % 2 !== 0)
            width += 1;
        if (height % 2 !== 0)
            height += 1;
        this.width = width;
        this.height = height;
        this.fps = Math.max(1, Math.min(60, Number(options.fps || DEFAULT_FPS)));
        this.frameSizeBytes = Math.floor(this.width * this.height * 1.5);
        this.loop = Boolean(options.loop);
        this.durationMs = Number(options.durationMs ?? 0);
    }
    get isRunning() {
        return __classPrivateFieldGet(this, _VideoFeeder_running, "f");
    }
}
_VideoFeeder_running = new WeakMap(), _VideoFeeder_proc = new WeakMap(), _VideoFeeder_pending = new WeakMap(), _VideoFeeder_stderr = new WeakMap(), _VideoFeeder_handleData = new WeakMap();
//# sourceMappingURL=video-feeder.js.map