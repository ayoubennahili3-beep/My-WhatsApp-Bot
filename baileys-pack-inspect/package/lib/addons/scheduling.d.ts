import type { WAMessage } from '../Types/index.js';
import type { AnyMessageContent } from '../Types/index.js';
export interface SchedulerOptions {
    maxQueue?: number;
    checkInterval?: number;
    onSent?: (scheduled: ScheduledMessage, message?: WAMessage) => void;
    onFailed?: (scheduled: ScheduledMessage, error: Error) => void;
}
export type ScheduledMessageStatus = 'pending' | 'sent' | 'failed' | 'cancelled';
export interface ScheduledMessage {
    id: string;
    jid: string;
    content: AnyMessageContent;
    scheduledTime: Date;
    createdAt: Date;
    status: ScheduledMessageStatus;
    messageId?: string;
    error?: string;
}
export declare class MessageScheduler {
    private queue;
    private timer;
    private sendMessage;
    private options;
    constructor(sendMessage: (jid: string, content: AnyMessageContent) => Promise<WAMessage | undefined>, options?: SchedulerOptions);
    private generateId;
    schedule(jid: string, content: AnyMessageContent, scheduledTime: Date): ScheduledMessage;
    scheduleDelay(jid: string, content: AnyMessageContent, delayMs: number): ScheduledMessage;
    cancel(id: string): boolean;
    cancelForJid(jid: string): number;
    getPending(): ScheduledMessage[];
    get(id: string): ScheduledMessage | undefined;
    clearAll(): number;
    private processQueue;
    private ensureTimerRunning;
    private stopTimer;
    stop(): void;
    start(): void;
}
export declare const createMessageScheduler: (sendMessage: (jid: string, content: AnyMessageContent) => Promise<WAMessage | undefined>, options?: SchedulerOptions) => MessageScheduler;
//# sourceMappingURL=scheduling.d.ts.map