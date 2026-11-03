import type { SignalKeyStoreWithTransaction } from '../Types/index.js';
import type { BinaryNode } from '../WABinary/index.js';
import type { ILogger } from './logger.js';
/** Sentinel key under `tctoken` store holding a JSON array of tracked storage JIDs for cross-session pruning. */
export declare const TC_TOKEN_INDEX_KEY = "__index";
/** Read the persisted tctoken JID index and return its entries (never contains the sentinel key itself). */
export declare function readTcTokenIndex(keys: SignalKeyStoreWithTransaction): Promise<string[]>;
/** Build a SignalDataSet fragment that writes the merged index (persisted ∪ added) under the sentinel key. */
export declare function buildMergedTcTokenIndexWrite(keys: SignalKeyStoreWithTransaction, addedJids: Iterable<string>): Promise<{
    [TC_TOKEN_INDEX_KEY]: {
        token: Buffer;
    };
}>;
export declare function isTcTokenExpired(timestamp: number | string | null | undefined): boolean;
export declare function shouldSendNewTcToken(senderTimestamp: number | undefined): boolean;
/** Resolve JID to LID for tctoken storage (WA Web stores under LID) */
export declare function resolveTcTokenJid(jid: string, getLIDForPN: (pn: string) => Promise<string | null>): Promise<string>;
/** Resolve target JID for issuing privacy token based on AB prop 14303 */
export declare function resolveIssuanceJid(jid: string, issueToLid: boolean, getLIDForPN: (pn: string) => Promise<string | null>, getPNForLID?: (lid: string) => Promise<string | null>): Promise<string>;
type TcTokenParams = {
    jid: string;
    baseContent?: BinaryNode[];
    authState: {
        keys: SignalKeyStoreWithTransaction;
    };
    getLIDForPN: (pn: string) => Promise<string | null>;
};
export declare function buildTcTokenFromJid({ authState, jid, baseContent, getLIDForPN }: TcTokenParams): Promise<BinaryNode[] | undefined>;
type StoreTcTokensParams = {
    result: BinaryNode;
    fallbackJid: string;
    keys: SignalKeyStoreWithTransaction;
    getLIDForPN: (pn: string) => Promise<string | null>;
    onNewJidStored?: (jid: string) => void;
};
export declare function storeTcTokensFromIqResult({ result, fallbackJid, keys, getLIDForPN, onNewJidStored }: StoreTcTokensParams): Promise<void>;
export type StoreTcTokenFromMessageParams = {
    /** The raw incoming <message> stanza (not yet decrypted) */
    node: BinaryNode;
    keys: SignalKeyStoreWithTransaction;
    getLIDForPN: (pn: string) => Promise<string | null>;
    onNewJidStored?: (jid: string) => void;
    /** Required for any code path crossing an async boundary (key-store + LID resolution) */
    logger: ILogger;
    /**
     * Preferred sender JID, e.g. `msg.key.participant || node.attrs.from` from
     * the already-decrypted message envelope. In a group context, `node.attrs.from`
     * alone is the GROUP jid, not the actual sender — pass this to resolve the
     * individual participant correctly. Falls back to `node.attrs.from` if omitted.
     */
    fallbackJid?: string;
};
/**
 * Opportunistically captures a <tctoken> child WhatsApp attaches directly to
 * incoming <message> stanzas — mirrors WA Web's WAWebSetTcTokenChatAction.
 * handleIncomingTcToken, which keeps a token on hand for warm contacts
 * proactively, before a reply is ever attempted (avoiding a later 463).
 *
 * Call this fire-and-forget right after `decryptMessageNode` returns (so
 * `msg.key.participant` is available for correct group-sender resolution via
 * `fallbackJid`), but before requiring successful decryption — capture must
 * not depend on the message body actually decrypting.
 *
 * Source: PR #2752 (sahilashraff)
 * Fixes applied vs the PR (reviewer-flagged):
 *  - P2: read-compare-write serialized per storageJid via makeKeyedMutex
 *    (prevents a race where an older token clobbers a newer one)
 *  - P2: dedup uses `>` (overwrite on equal timestamp) to match
 *    storeTcTokensFromIqResult's semantics
 *  - nit: accepts logger: ILogger and passes it through
 *  - group-context fix: accepts `fallbackJid` (caller-supplied
 *    `msg.key.participant || node.attrs.from`) instead of only trusting
 *    `node.attrs.from`, which is the GROUP jid — not the sender — on
 *    group message stanzas
 *
 * NOTE: the exact wire shape here is reverse-engineered from the upstream
 * PR and not independently traffic-verified in this fork — confirm against a
 * live capture before relying on it if tokens aren't refreshing as expected.
 */
export declare function storeTcTokenFromMessageNode({ node, keys, getLIDForPN, onNewJidStored, logger, fallbackJid }: StoreTcTokenFromMessageParams): Promise<string | undefined>;
export {};
//# sourceMappingURL=tc-token-utils.d.ts.map