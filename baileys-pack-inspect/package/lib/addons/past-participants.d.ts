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
export type GroupPastParticipant = {
    /** JID of the participant */
    jid: string;
    /** LID JID if available */
    lid?: string;
    /** ISO timestamp when they left/were removed */
    leaveTs?: number;
    /** How they left: 'left' | 'removed' */
    leaveReason?: 'left' | 'removed';
};
export type GroupPastParticipantsResult = {
    /** Group JID */
    groupJid: string;
    participants: GroupPastParticipant[];
};
/**
 * Process proto.IPastParticipants[] from a history sync payload.
 * Returns a structured list per group.
 */
export declare const processPastParticipants: (pastParticipantsList: proto.IPastParticipants[]) => GroupPastParticipantsResult[];
/**
 * Check if a history sync event contains past participants data.
 * (pastParticipants field replaces chunkOrder in this patch)
 */
export declare const hasPastParticipants: (event: {
    pastParticipants?: proto.IPastParticipants[] | null;
}) => boolean;
//# sourceMappingURL=past-participants.d.ts.map