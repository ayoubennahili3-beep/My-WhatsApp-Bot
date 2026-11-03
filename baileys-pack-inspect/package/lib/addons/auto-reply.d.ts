import type { WAMessage } from '../Types/index.js';
import type { AnyMessageContent } from '../Types/index.js';
export interface AutoReplyRule {
    id?: string;
    keywords?: string[];
    pattern?: RegExp;
    exactMatch?: string;
    response: AnyMessageContent | ((message: WAMessage, match: RegExpMatchArray | string[]) => Promise<AnyMessageContent> | AnyMessageContent);
    cooldown?: number;
    priority?: number;
    active?: boolean;
    groupsOnly?: boolean;
    privateOnly?: boolean;
    allowedJids?: string[];
    blockedJids?: string[];
    quoted?: boolean;
}
export interface AutoReplyOptions {
    globalCooldown?: number;
    simulateTyping?: boolean;
    typingDuration?: number;
    multiMatch?: boolean;
    onReply?: (rule: AutoReplyRule, message: WAMessage, response: AnyMessageContent) => void;
    onError?: (error: Error, rule: AutoReplyRule, message: WAMessage) => void;
}
export declare class AutoReplyHandler {
    private rules;
    private cooldowns;
    private globalCooldown;
    private sendMessage;
    private sendPresence?;
    private options;
    constructor(sendMessage: (jid: string, content: AnyMessageContent, options?: any) => Promise<any>, sendPresence?: (jid: string, presence: string) => Promise<void>, options?: AutoReplyOptions);
    private generateId;
    addRule(rule: AutoReplyRule): {
        id: string;
        active: boolean;
        priority: number;
        keywords?: string[];
        pattern?: RegExp;
        exactMatch?: string;
        response: AnyMessageContent | ((message: WAMessage, match: RegExpMatchArray | string[]) => Promise<AnyMessageContent> | AnyMessageContent);
        cooldown?: number;
        groupsOnly?: boolean;
        privateOnly?: boolean;
        allowedJids?: string[];
        blockedJids?: string[];
        quoted?: boolean;
    };
    removeRule(id: string): boolean;
    getRules(): (AutoReplyRule & {
        id: string;
    })[];
    getRule(id: string): (AutoReplyRule & {
        id: string;
    }) | undefined;
    setRuleActive(id: string, active: boolean): boolean;
    clearRules(): void;
    private checkCooldown;
    private checkGlobalCooldown;
    private setCooldown;
    private matchRule;
    private isJidAllowed;
    processMessage(message: WAMessage): Promise<boolean>;
}
export declare const createAutoReply: (sendMessage: (jid: string, content: AnyMessageContent, options?: any) => Promise<any>, sendPresence?: (jid: string, presence: string) => Promise<void>, options?: AutoReplyOptions) => AutoReplyHandler;
//# sourceMappingURL=auto-reply.d.ts.map