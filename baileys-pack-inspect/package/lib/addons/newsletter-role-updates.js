const ROLE_BY_ACTION = {
    promote: 'ADMIN',
    demote: 'SUBSCRIBER'
};
/**
 * `updates` comes from `JSON.parse`d mex notification content, so it's
 * untyped at the call site; each entry is expected to carry `jid` and
 * `user` when it represents a role change.
 */
export const emitNewsletterRoleUpdate = (ev, updates, author, action) => {
    for (const update of updates) {
        if (update.jid && update.user) {
            ev.emit('newsletter-participants.update', {
                id: update.jid,
                author: author ?? '',
                user: update.user,
                new_role: ROLE_BY_ACTION[action],
                action
            });
        }
    }
};
//# sourceMappingURL=newsletter-role-updates.js.map