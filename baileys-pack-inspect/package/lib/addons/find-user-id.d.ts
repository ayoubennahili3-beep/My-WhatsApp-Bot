export type UserIdLookup = {
    lid?: string;
    phoneNumber?: string;
};
type LidMappingLookup = {
    getLIDForPN(pn: string): Promise<string | null>;
    getPNForLID(lid: string): Promise<string | null>;
};
export declare const findUserId: (pnOrLid: string, lidMapping: LidMappingLookup) => Promise<UserIdLookup>;
export {};
//# sourceMappingURL=find-user-id.d.ts.map