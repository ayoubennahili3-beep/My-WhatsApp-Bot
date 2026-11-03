/**
 * addon: past-participants
 * Source patch: Baileys-pastParticepnts
 *
 * Adds:
 *   - pastParticipants field on history sync events
 *   - GroupParticipant.authorPn — phone-number JID of the actor
 *   - handlePastParticipants() — processes proto.IPastParticipants[]
 *     and returns structured GroupPastParticipant[]
 *
 * The patch replaces chunkOrder with pastParticipants in history sync events.
 * groups.ts emit now includes authorPn from actingParticipantPn.
 */
import { proto } from '../../WAProto/index.js';
/**
 * Process proto.IPastParticipants[] from a history sync payload.
 * Returns a structured list per group.
 */
export const processPastParticipants = (pastParticipantsList) => {
    return pastParticipantsList.map(pp => {
        const groupJid = pp.groupJid ?? '';
        const participants = (pp.pastParticipants ?? []).map(p => ({
            jid: p.userJid ?? '',
            leaveTs: p.leaveTs ? Number(p.leaveTs) : undefined,
            leaveReason: p.leaveReason === proto.PastParticipant.LeaveReason.LEFT
                ? 'left'
                : p.leaveReason === proto.PastParticipant.LeaveReason.REMOVED
                    ? 'removed'
                    : undefined
        }));
        return { groupJid, participants };
    });
};
/**
 * Check if a history sync event contains past participants data.
 * (pastParticipants field replaces chunkOrder in this patch)
 */
export const hasPastParticipants = (event) => {
    return Array.isArray(event.pastParticipants) && event.pastParticipants.length > 0;
};
//# sourceMappingURL=past-participants.js.map