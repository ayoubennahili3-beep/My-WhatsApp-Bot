/** Checks (and caches) whether an `ffmpeg` binary is reachable on PATH. */
export declare const checkFfmpegAvailable: (bin?: string) => Promise<boolean>;
export type VideoFeederOptions = {
    width?: number;
    height?: number;
    fps?: number;
    loop?: boolean;
    durationMs?: number;
};
export declare class VideoFeeder {
    #private;
    private readonly onFrame;
    private readonly onEnd;
    private readonly onError;
    readonly source: string;
    readonly width: number;
    readonly height: number;
    readonly fps: number;
    readonly frameSizeBytes: number;
    readonly loop: boolean;
    readonly durationMs: number;
    framesProduced: number;
    framesEmitted: number;
    bytesProduced: number;
    constructor(source: string, onFrame: (frame: Buffer, width: number, height: number, fps: number) => void, onEnd?: (() => void) | null, onError?: ((err: Error) => void) | null, options?: VideoFeederOptions);
    get isRunning(): boolean;
    start: () => void;
    stop: () => void;
}
//# sourceMappingURL=video-feeder.d.ts.map