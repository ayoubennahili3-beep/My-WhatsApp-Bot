/**
 * JID Plotting & LID Support utilities
 * Maps between PN JIDs (@s.whatsapp.net) and LID JIDs (@lid)
 * Useful for resolving JIDs in groups that use LID addressing
 */
export type JidPlotEntry = {
    pnJid: string;
    lidJid: string;
};
/**
 * Register a PN <-> LID mapping in the plot
 */
export declare const plotJidPair: (pnJid: string, lidJid: string) => void;
/**
 * Batch register multiple PN <-> LID pairs
 */
export declare const plotJidPairs: (entries: JidPlotEntry[]) => void;
/**
 * Resolve a JID to its PN form (@s.whatsapp.net)
 * If already PN, returns as-is. If LID, looks up the mapped PN.
 */
export declare const resolvePnJid: (jid: string) => string | undefined;
/**
 * Resolve a JID to its LID form (@lid)
 * If already LID, returns as-is. If PN, looks up the mapped LID.
 */
export declare const resolveLidJid: (jid: string) => string | undefined;
/**
 * Check whether a JID has a known LID counterpart in the plot
 */
export declare const hasLidMapping: (pnJid: string) => boolean;
/**
 * Check whether a LID JID has a known PN counterpart in the plot
 */
export declare const hasPnMapping: (lidJid: string) => boolean;
/**
 * Get all registered plot entries
 */
export declare const getAllJidPlotEntries: () => JidPlotEntry[];
/**
 * Clear all JID plot mappings
 */
export declare const clearJidPlot: () => void;
/**
 * Normalize a JID — convert @c.us to @s.whatsapp.net,
 * strip device suffix, and resolve LID to PN if mapped.
 */
export declare const normalizeJidForSend: (jid: string) => string;
//# sourceMappingURL=jid-plot.d.ts.map