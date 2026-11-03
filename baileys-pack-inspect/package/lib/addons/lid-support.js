/**
 * addon: lid-support
 * Source patch: Baileys-fix-on-whatsapp-lid-support
 *
 * Fixes onWhatsApp() to support LID (@lid) JIDs in addition to PN JIDs.
 * Previously LID JIDs were silently skipped with a warning.
 *
 * This module exports a helper that extends the result of onWhatsApp()
 * with LID lookup results, and the type for the extended result.
 *
 * How it works:
 *   - PN JIDs go into the normal USyncQuery
 *   - LID JIDs go into a separate USyncQuery with LIDProtocol
 *   - Both results are merged and returned
 */
/**
 * Split a list of JIDs into PN and LID groups.
 * Uses simple domain check: @lid suffix = LID JID.
 */
export const splitJidsByType = (jids) => {
    const pnJids = [];
    const lidJids = [];
    for (const jid of jids) {
        if (jid.endsWith('@lid')) {
            lidJids.push(jid);
        }
        else {
            pnJids.push(jid);
        }
    }
    return { pnJids, lidJids };
};
/**
 * Merge PN lookup results and LID lookup results into a single array.
 */
export const mergeLidAndPnResults = (pnResults, lidResults) => {
    return [
        ...pnResults.map(r => ({ jid: r.jid, exists: r.exists })),
        ...lidResults.map(r => ({ jid: r.jid, exists: r.exists, lid: r.lid }))
    ];
};
//# sourceMappingURL=lid-support.js.map