import type { USyncQueryProtocol } from '../../Types/USync.js';
import { type BinaryNode } from '../../WABinary/index.js';
export type TextStatusData = {
    text?: string;
    emoji?: string;
    ephemeralDurationSeconds?: number;
    lastUpdateTime?: Date;
};
export declare class USyncTextStatusProtocol implements USyncQueryProtocol {
    name: string;
    getQueryElement(): BinaryNode;
    getUserElement(): null;
    parser(node: BinaryNode): TextStatusData | undefined;
}
//# sourceMappingURL=USyncTextStatusProtocol.d.ts.map