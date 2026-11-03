/**
 * Message Scheduler
 * Schedule messages to be sent at a specific time or after a delay
 */
const jobs = new Map();
const timers = new Map();
let sendFn = null;
/**
 * Attach the sendMessage function from a Baileys socket.
 * Must be called before scheduling any messages.
 */
export const attachSchedulerSendFn = (fn) => {
    sendFn = fn;
};
const scheduleTimer = (job) => {
    const delay = Math.max(0, job.sendAt - Date.now());
    const timer = setTimeout(async () => {
        if (!sendFn) {
            job.status = 'failed';
            job.error = 'sendFn not attached';
            return;
        }
        try {
            await sendFn(job.jid, job.content, job.options);
            job.status = 'sent';
        }
        catch (e) {
            job.status = 'failed';
            job.error = e?.message || String(e);
        }
        // Handle repeating jobs
        if (job.repeatIntervalMs && job.repeatIntervalMs > 0) {
            const nextCount = (job.repeatCount ?? 0) + 1;
            if (job.maxRepeats === undefined || nextCount < job.maxRepeats) {
                job.repeatCount = nextCount;
                job.sendAt = Date.now() + job.repeatIntervalMs;
                job.status = 'pending';
                scheduleTimer(job);
            }
        }
    }, delay);
    timers.set(job.id, timer);
};
/**
 * Schedule a message to be sent at a specific time
 */
export const scheduleMessage = (params) => {
    const id = params.id || `sched_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const job = {
        id,
        jid: params.jid,
        content: params.content,
        options: params.options,
        sendAt: params.sendAt instanceof Date ? params.sendAt.getTime() : params.sendAt,
        repeatIntervalMs: params.repeatIntervalMs,
        maxRepeats: params.maxRepeats,
        repeatCount: 0,
        status: 'pending'
    };
    jobs.set(id, job);
    scheduleTimer(job);
    return job;
};
/**
 * Schedule a message to be sent after a delay (ms)
 */
export const scheduleMessageAfter = (params) => {
    return scheduleMessage({ ...params, sendAt: Date.now() + params.delayMs });
};
/**
 * Cancel a scheduled job
 */
export const cancelScheduledMessage = (id) => {
    const job = jobs.get(id);
    if (!job)
        return false;
    const timer = timers.get(id);
    if (timer)
        clearTimeout(timer);
    timers.delete(id);
    job.status = 'cancelled';
    return true;
};
/**
 * Get a scheduled job by ID
 */
export const getScheduledMessage = (id) => jobs.get(id);
/**
 * Get all scheduled jobs
 */
export const getAllScheduledMessages = () => [...jobs.values()];
/**
 * Get all pending scheduled jobs
 */
export const getPendingScheduledMessages = () => [...jobs.values()].filter(j => j.status === 'pending');
/**
 * Cancel all pending scheduled jobs
 */
export const cancelAllScheduledMessages = () => {
    for (const [id, timer] of timers.entries()) {
        clearTimeout(timer);
        const job = jobs.get(id);
        if (job?.status === 'pending')
            job.status = 'cancelled';
    }
    timers.clear();
};
//# sourceMappingURL=message-scheduler.js.map