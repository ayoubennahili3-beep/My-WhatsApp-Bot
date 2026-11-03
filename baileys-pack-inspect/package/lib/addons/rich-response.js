/**
 * Rich Response Utilities
 * sendTable, sendList, sendCodeBlock, sendLatex, sendLatexImage,
 * sendLatexInlineImage, sendRichMessage, captureUnifiedResponse, sendUnifiedResponse
 */
import { proto } from '../../WAProto/index.js';
import { RichSubMessageType, tokenizeCode } from './message-composer.js';
import { toUnified, wrapToBotForwardedMessage } from './rich-message-utils.js';
// ─── Table ────────────────────────────────────────────────────────────────────
/**
 * Format a 2D array as a plain-text table and send it.
 * @example sendTable(sock.sendMessage, jid, [['Name','Age'],['Alice','30']])
 */
export const sendTable = async (sendMessage, jid, title, headers, rows, quoted, opts) => {
    const tableRows = [
        { items: headers, isHeading: true },
        ...rows.map(row => ({ items: row.map(String) }))
    ];
    const submessages = [];
    if (opts?.headerText)
        submessages.push({ messageType: RichSubMessageType.TEXT, messageText: opts.headerText });
    submessages.push({
        messageType: RichSubMessageType.TABLE,
        tableMetadata: { title, rows: tableRows }
    });
    if (opts?.footer)
        submessages.push({ messageType: RichSubMessageType.TEXT, messageText: opts.footer });
    const content = wrapToBotForwardedMessage(proto.AIRichResponseMessage.create({
        submessages: submessages,
        messageType: proto.AIRichResponseMessageType.AI_RICH_RESPONSE_TYPE_STANDARD,
        contextInfo: quoted?.key
            ? {
                stanzaId: quoted.key.id,
                participant: quoted.key.participant ?? quoted.key.remoteJid,
                quotedMessage: quoted.message
            }
            : undefined
    }));
    return sendMessage(jid, content, opts);
};
// ─── List ─────────────────────────────────────────────────────────────────────
/**
 * Send a rich list — each item can be a single string or an array of
 * cells for a multi-column row. Renders as a native table primitive
 * (same underlying mechanism as sendTable).
 */
export const sendList = async (sendMessage, jid, title, items, quoted, opts) => {
    const tableRows = items.map(item => ({ items: Array.isArray(item) ? item.map(String) : [String(item)] }));
    const submessages = [];
    if (opts?.headerText)
        submessages.push({ messageType: RichSubMessageType.TEXT, messageText: opts.headerText });
    submessages.push({
        messageType: RichSubMessageType.TABLE,
        tableMetadata: { title, rows: tableRows }
    });
    if (opts?.footer)
        submessages.push({ messageType: RichSubMessageType.TEXT, messageText: opts.footer });
    const content = wrapToBotForwardedMessage(proto.AIRichResponseMessage.create({
        submessages: submessages,
        messageType: proto.AIRichResponseMessageType.AI_RICH_RESPONSE_TYPE_STANDARD,
        contextInfo: quoted?.key
            ? {
                stanzaId: quoted.key.id,
                participant: quoted.key.participant ?? quoted.key.remoteJid,
                quotedMessage: quoted.message
            }
            : undefined
    }));
    return sendMessage(jid, content, opts);
};
// ─── Code Block ───────────────────────────────────────────────────────────────
/**
 * Send a code block (wrapped in triple backticks).
 * language is a hint for syntax highlighting in clients that support it.
 */
export const sendCodeBlock = async (sendMessage, jid, code, quoted, opts) => {
    const { language = 'javascript', title, footer, ...sendOpts } = opts ?? {};
    const submessages = [];
    if (title)
        submessages.push({ messageType: RichSubMessageType.TEXT, messageText: title });
    submessages.push({
        messageType: RichSubMessageType.CODE,
        codeMetadata: { codeLanguage: language, codeBlocks: tokenizeCode(code, language) }
    });
    if (footer)
        submessages.push({ messageType: RichSubMessageType.TEXT, messageText: footer });
    const content = wrapToBotForwardedMessage(proto.AIRichResponseMessage.create({
        submessages: submessages,
        messageType: proto.AIRichResponseMessageType.AI_RICH_RESPONSE_TYPE_STANDARD,
        contextInfo: quoted?.key
            ? {
                stanzaId: quoted.key.id,
                participant: quoted.key.participant ?? quoted.key.remoteJid,
                quotedMessage: quoted.message
            }
            : undefined
    }));
    return sendMessage(jid, content, sendOpts);
};
// ─── LaTeX ────────────────────────────────────────────────────────────────────
/**
 * Send a LaTeX expression as raw text (wrapped in backticks).
 * Note: WhatsApp does not natively render LaTeX. This sends the raw expression.
 */
export const sendLatex = async (sendMessage, jid, expression, opts) => {
    await sendMessage(jid, { text: '`' + expression + '`' }, opts);
};
/**
 * Render a LaTeX expression to a PNG image via an external API (e.g. quicklatex.com)
 * and send it as an image message.
 */
export const sendLatexImage = async (sendMessage, jid, expression, opts) => {
    // Uses QuickLaTeX render API — no API key required for simple expressions
    const encodedFormula = encodeURIComponent(`\\documentclass{standalone}\\begin{document}\\Large $${expression}$\\end{document}`);
    const apiUrl = `https://quicklatex.com/latex3.f?formula=${encodedFormula}&fsize=50px&fcolor=000000&bcolor=ffffff`;
    const { caption, ...sendOpts } = opts ?? {};
    const resp = await fetch(apiUrl);
    const text = await resp.text();
    // Response format: "0\n<imageUrl>\n<width> <height>"
    const lines = text.trim().split('\n');
    if (lines[0] !== '0')
        throw new Error('LaTeX render failed: ' + text);
    const imageUrl = lines[1].trim();
    await sendMessage(jid, { image: { url: imageUrl }, caption }, sendOpts);
};
/**
 * Render a LaTeX expression to PNG and send it inline (as image with expression as caption).
 */
export const sendLatexInlineImage = async (sendMessage, jid, expression, opts) => {
    await sendLatexImage(sendMessage, jid, expression, { ...opts, caption: expression });
};
const renderTable = (table) => {
    const rows = table.rows;
    if (!rows.length)
        return '';
    const hasHeader = table.headerRow !== false;
    const colWidths = rows[0].map((_, ci) => Math.max(...rows.map(r => (r[ci] ?? '').length)));
    const divider = colWidths.map((w) => '─'.repeat(w + 2)).join('┼');
    const lines = rows.map((row, ri) => {
        const line = row.map((cell, ci) => (cell ?? '').padEnd(colWidths[ci] ?? 0)).join(' │ ');
        if (hasHeader && ri === 0)
            return `┌${divider}┐\n│ ${line} │\n├${divider}┤`;
        return `│ ${line} │`;
    });
    lines.push(`└${divider}┘`);
    return (table.title ? `*${table.title}*\n` : '') + '```\n' + lines.join('\n') + '\n```';
};
const renderCode = (code) => '```' + (code.language ?? '') + '\n' + code.code + '\n```';
const renderLatex = (latex) => '`' + latex.expression + '`';
/**
 * Send a fully custom rich message by assembling raw submessage objects
 * (messageType: 2=Text, 3=Inline Image, 4=Table, 5=Code Block, 8=LaTeX).
 * With `{ useMarkdown: true }`, builds the real botForwardedMessage +
 * unifiedResponse payload so WhatsApp renders native markdown/table/code
 * primitives instead of a flattened text fallback.
 */
export const sendRichMessage = async (sendMessage, jid, submessages, quoted, opts) => {
    const { useMarkdown, ...sendOpts } = opts ?? {};
    if (useMarkdown) {
        const unified = toUnified(submessages);
        const richResponseMessage = proto.AIRichResponseMessage.create({
            submessages: submessages,
            messageType: proto.AIRichResponseMessageType.AI_RICH_RESPONSE_TYPE_STANDARD,
            unifiedResponse: { data: Buffer.from(JSON.stringify(unified), 'utf-8') },
            contextInfo: quoted?.key
                ? {
                    stanzaId: quoted.key.id,
                    participant: quoted.key.participant ?? quoted.key.remoteJid,
                    quotedMessage: quoted.message
                }
                : undefined
        });
        const content = wrapToBotForwardedMessage(richResponseMessage);
        return sendMessage(jid, content, sendOpts);
    }
    // Fallback: flatten submessages into plain text
    const parts = submessages.map(sub => {
        switch (sub.messageType) {
            case 2: // TEXT
                return sub.messageText ?? '';
            case 4: {
                // TABLE
                const meta = sub.tableMetadata;
                return meta ? renderTable({ rows: meta.rows.map((r) => r.items), title: meta.title }) : '';
            }
            case 5: {
                // CODE
                const meta = sub.codeMetadata;
                return meta
                    ? renderCode({ code: meta.codeBlocks.map((b) => b.codeContent).join(''), language: meta.codeLanguage })
                    : '';
            }
            case 8: {
                // LATEX
                const meta = sub.latexExpression;
                return meta ? renderLatex({ expression: meta }) : '';
            }
            default:
                return '';
        }
    });
    const text = parts.join('\n\n');
    return sendMessage(jid, { text }, { ...sendOpts, quoted: quoted ?? undefined });
};
let capturedResponses = [];
/**
 * Capture a response without immediately sending it.
 * Useful for building batched sends.
 */
export const captureUnifiedResponse = (jid, content, options) => {
    const entry = { jid, content, options };
    capturedResponses.push(entry);
    return entry;
};
/**
 * Send all captured unified responses and clear the capture buffer.
 * Returns the results in order.
 */
export const sendUnifiedResponse = async (sendMessage) => {
    const toSend = [...capturedResponses];
    capturedResponses = [];
    return Promise.all(toSend.map(e => sendMessage(e.jid, e.content, e.options)));
};
/**
 * Clear captured responses without sending them
 */
export const clearCapturedResponses = () => {
    capturedResponses = [];
};
/**
 * Get current captured responses without clearing
 */
export const getCapturedResponses = () => [...capturedResponses];
//# sourceMappingURL=rich-response.js.map