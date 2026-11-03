import { getBinaryNodeChild } from '../../WABinary/index.js';
export class USyncTextStatusProtocol {
    constructor() {
        this.name = 'text_status';
    }
    getQueryElement() {
        return {
            tag: 'text_status',
            attrs: {}
        };
    }
    getUserElement() {
        return null;
    }
    parser(node) {
        if (node.tag === 'text_status') {
            if (getBinaryNodeChild(node, 'error')) {
                return undefined;
            }
            const text = node.attrs?.text;
            const emojiChild = getBinaryNodeChild(node, 'emoji');
            const emoji = emojiChild?.attrs?.content;
            const ephemeralDurationSeconds = node.attrs?.ephemeral_duration_sec
                ? +node.attrs.ephemeral_duration_sec
                : undefined;
            const lastUpdateTime = node.attrs?.last_update_time ? new Date(+node.attrs.last_update_time * 1000) : undefined;
            return {
                text,
                emoji,
                ephemeralDurationSeconds,
                lastUpdateTime
            };
        }
    }
}
//# sourceMappingURL=USyncTextStatusProtocol.js.map