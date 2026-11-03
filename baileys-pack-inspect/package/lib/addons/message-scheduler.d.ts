/**
 * Message Scheduler
 * Schedule messages to be sent at a specific time or after a delay
 */
import type { AnyMessageContent, MiscMessageGenerationOptions } from '../Types/index.js';
export type ScheduledMessageJob = {
    /** Unique job ID */
    id: string;
    /** Target JID */
    jid: string;
    /** Message content */
    content: AnyMessageContent;
    /** Options for sendMessage */
    options?: MiscMessageGenerationOptions;
    /** Scheduled send time (ms since epoch) */
    sendAt: number;
    /** Repeat interval in ms (0 = no repeat) */
    repeatIntervalMs?: number;
    /** Max repeats (undefined = infinite) */
    maxRepeats?: number;
    /** Current repeat count */
    repeatCount?: number;
    /** Status */
    status: 'pending' | 'sent' | 'cancelled' | 'failed';
    /** Error if failed */
    error?: string;
};
type SendFn = (jid: string, content: AnyMessageContent, options?: MiscMessageGenerationOptions) => Promise<any>;
/**
 * Attach the sendMessage function from a Baileys socket.
 * Must be called before scheduling any messages.
 */
export declare const attachSchedulerSendFn: (fn: SendFn) => void;
/**
 * Schedule a message to be sent at a specific time
 */
export declare const scheduleMessage: (params: {
    jid: string;
    content: AnyMessageContent;
    sendAt: Date | number;
    options?: MiscMessageGenerationOptions;
    repeatIntervalMs?: number;
    maxRepeats?: number;
    id?: string;
}) => ScheduledMessageJob;
/**
 * Schedule a message to be sent after a delay (ms)
 */
export declare const scheduleMessageAfter: (params: {
    jid: string;
    content: AnyMessageContent;
    delayMs: number;
    options?: MiscMessageGenerationOptions;
    id?: string;
}) => ScheduledMessageJob;
/**
 * Cancel a scheduled job
 */
export declare const cancelScheduledMessage: (id: string) => boolean;
/**
 * Get a scheduled job by ID
 */
export declare const getScheduledMessage: (id: string) => ScheduledMessageJob | undefined;
/**
 * Get all scheduled jobs
 */
export declare const getAllScheduledMessages: () => ScheduledMessageJob[];
/**
 * Get all pending scheduled jobs
 */
export declare const getPendingScheduledMessages: () => ScheduledMessageJob[];
/**
 * Cancel all pending scheduled jobs
 */
export declare const cancelAllScheduledMessages: () => void;
export {};
//# sourceMappingURL=message-scheduler.d.ts.map