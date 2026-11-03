/**
 * from-messages-recv.ts
 * Source: addons/baileys + PR #2375
 *
 * All call functions as a factory — makeCallHandlers(deps) injects
 * socket-bound dependencies and returns all call functions ready to use.
 */
import { Boom } from '@hapi/boom';
import { randomBytes } from 'crypto';
import { encodeSignedDeviceIdentity } from '../Utils/index.js';
import { isJidGroup, jidEncode } from '../WABinary/index.js';
export function makeCallHandlers(deps) {
    const { authState, query, sendNode, generateMessageTag, getUSyncDevices, assertSessions, createParticipantNodes, callOfferCache } = deps;
    /** Reject an incoming call */
    const rejectCall = async (callId, callFrom) => {
        await query({
            tag: 'call',
            attrs: { from: authState.creds.me.id, to: callFrom },
            content: [
                {
                    tag: 'reject',
                    attrs: { 'call-id': callId, 'call-creator': callFrom, count: '0' },
                    content: undefined
                }
            ]
        });
    };
    /** Build and send a call offer stanza with proper E2E encryption (baileys) */
    const offerCall = async (toJid, isVideo = false) => {
        const callId = randomBytes(16).toString('hex').toUpperCase().substring(0, 64);
        const offerContent = [];
        if (isVideo) {
            offerContent.push({
                tag: 'video',
                attrs: {
                    enc: 'vp8',
                    dec: 'vp8',
                    orientation: '0',
                    screen_width: '1920',
                    screen_height: '1080',
                    device_orientation: '0'
                },
                content: undefined
            });
        }
        offerContent.push({ tag: 'audio', attrs: { enc: 'opus', rate: '16000' }, content: undefined });
        offerContent.push({ tag: 'audio', attrs: { enc: 'opus', rate: '8000' }, content: undefined });
        offerContent.push({ tag: 'net', attrs: { medium: '3' }, content: undefined });
        offerContent.push({ tag: 'capability', attrs: { ver: '1' }, content: new Uint8Array([1, 4, 255, 131, 207, 4]) });
        offerContent.push({ tag: 'encopt', attrs: { keygen: '2' }, content: undefined });
        const encKey = randomBytes(32);
        const devices = (await getUSyncDevices([toJid], true, false)).map(({ user, device }) => jidEncode(user, 's.whatsapp.net', device));
        await assertSessions(devices, true);
        const { nodes: destinations, shouldIncludeDeviceIdentity } = await createParticipantNodes(devices, { call: { callKey: new Uint8Array(encKey) } }, { count: '0' });
        offerContent.push({ tag: 'destination', attrs: {}, content: destinations });
        if (shouldIncludeDeviceIdentity) {
            offerContent.push({
                tag: 'device-identity',
                attrs: {},
                content: encodeSignedDeviceIdentity(authState.creds.account, true)
            });
        }
        await query({
            tag: 'call',
            attrs: { id: generateMessageTag(), to: toJid },
            content: [
                {
                    tag: 'offer',
                    attrs: { 'call-id': callId, 'call-creator': authState.creds.me.id },
                    content: offerContent
                }
            ]
        });
        return { id: callId, to: toJid };
    };
    /** Initiate an outgoing call — calls offerCall, caches state (PR #2375 + addons) */
    const initiateCall = async (jid, options = {}) => {
        const meId = authState.creds.me?.id;
        if (!meId)
            throw new Boom('Not authenticated');
        const isVideo = !!options.isVideo;
        const isGroup = isJidGroup(jid);
        const result = await offerCall(jid, isVideo);
        const callId = result.id;
        await callOfferCache.set(callId, {
            chatId: jid,
            from: meId,
            id: callId,
            date: new Date(),
            offline: false,
            status: 'offer',
            isVideo,
            isGroup,
            groupJid: isGroup ? jid : undefined
        });
        return { callId, to: jid, isVideo };
    };
    /** Terminate/hang up an active or ringing call (baileys) */
    const terminateCall = async (callId, callTo, callCreator, reason, duration) => {
        const meId = authState.creds.me?.id;
        if (!meId)
            throw new Boom('Not authenticated', { statusCode: 401 });
        const attrs = { 'call-id': callId, 'call-creator': callCreator || meId };
        if (reason)
            attrs.reason = reason;
        if (typeof duration === 'number') {
            attrs.duration = String(duration);
            attrs.audio_duration = String(duration);
        }
        await query({
            tag: 'call',
            attrs: { to: callTo, id: randomBytes(16).toString('hex').toUpperCase() },
            content: [{ tag: 'terminate', attrs, content: undefined }]
        });
        await callOfferCache.del(callId);
    };
    /** Cancel an outgoing call — delegates to terminateCall */
    const cancelCall = async (callId, callTo) => terminateCall(callId, callTo);
    /** Accept (answer) an incoming call (baileys) */
    const acceptCall = async (callId, callFrom, isVideo) => {
        const meId = authState.creds.me?.id;
        if (!meId)
            throw new Boom('Not authenticated', { statusCode: 401 });
        const content = [{ tag: 'audio', attrs: { rate: '16000', enc: 'opus' }, content: undefined }];
        if (isVideo)
            content.push({ tag: 'video', attrs: { dec: 'H264,AV1', device_orientation: '1' }, content: undefined });
        content.push({ tag: 'net', attrs: { medium: '2' }, content: undefined }, { tag: 'encopt', attrs: { keygen: '2' }, content: undefined });
        await query({
            tag: 'call',
            attrs: { from: meId, to: callFrom, id: randomBytes(16).toString('hex').toUpperCase() },
            content: [{ tag: 'accept', attrs: { 'call-id': callId, 'call-creator': callFrom }, content }]
        });
    };
    /** Send preaccept signal (codec capabilities) for an incoming call (baileys) */
    const preacceptCall = async (callId, callCreator, isVideo) => {
        const content = [{ tag: 'audio', attrs: { rate: '16000', enc: 'opus' }, content: undefined }];
        if (isVideo) {
            content.push({
                tag: 'video',
                attrs: { screen_width: '1080', screen_height: '2400', dec: 'H264,H265,AV1', device_orientation: '0' },
                content: undefined
            });
        }
        content.push({ tag: 'encopt', attrs: { keygen: '2' }, content: undefined }, { tag: 'capability', attrs: { ver: '1' }, content: undefined });
        await query({
            tag: 'call',
            attrs: { to: callCreator, id: randomBytes(16).toString('hex').toUpperCase() },
            content: [{ tag: 'preaccept', attrs: { 'call-id': callId, 'call-creator': callCreator }, content }]
        });
    };
    /** Report relay latency measurements (baileys) */
    const sendRelayLatency = async (callId, callCreator, relays, transactionId) => {
        const attrs = { 'call-id': callId, 'call-creator': callCreator };
        if (transactionId)
            attrs['transaction-id'] = transactionId;
        await sendNode({
            tag: 'call',
            attrs: { to: callCreator, id: randomBytes(16).toString('hex').toUpperCase() },
            content: [
                {
                    tag: 'relaylatency',
                    attrs,
                    content: relays.map(r => {
                        const a = {};
                        if (r.relayName)
                            a.relay_name = r.relayName;
                        a.latency = String(r.latency);
                        if (r.relayId)
                            a.relay_id = r.relayId;
                        if (r.dlBw !== undefined)
                            a.dl_bw = String(r.dlBw);
                        if (r.ulBw !== undefined)
                            a.ul_bw = String(r.ulBw);
                        return { tag: 'te', attrs: a, content: undefined };
                    })
                }
            ]
        });
    };
    /** Send ICE transport candidates (baileys) */
    const sendTransport = async (callId, callCreator, to, candidates, round) => {
        const attrs = {
            'call-id': callId,
            'call-creator': callCreator,
            'transport-message-type': '1'
        };
        if (round !== undefined)
            attrs['p2p-cand-round'] = String(round);
        await sendNode({
            tag: 'call',
            attrs: { to, id: randomBytes(16).toString('hex').toUpperCase() },
            content: [
                {
                    tag: 'transport',
                    attrs,
                    content: candidates.map(c => ({ tag: 'te', attrs: { priority: c.priority }, content: c.data }))
                }
            ]
        });
    };
    /** Send call duration log after a call ends (baileys) */
    const sendCallDuration = async (callId, callCreator, peer, audioDuration, callType = '1x1') => {
        await sendNode({
            tag: 'call',
            attrs: { to: 'call', id: randomBytes(16).toString('hex').toUpperCase() },
            content: [
                {
                    tag: 'duration',
                    attrs: {
                        'call-id': callId,
                        'call-creator': callCreator,
                        peer,
                        audio_duration: String(audioDuration),
                        type: callType
                    },
                    content: undefined
                }
            ]
        });
    };
    /** Mute or unmute during a call (baileys) */
    const muteCall = async (callId, callCreator, to, muted) => {
        await sendNode({
            tag: 'call',
            attrs: { to, id: randomBytes(16).toString('hex').toUpperCase() },
            content: [
                {
                    tag: 'mute_v2',
                    attrs: { 'mute-state': muted ? '1' : '0', 'call-id': callId, 'call-creator': callCreator },
                    content: undefined
                }
            ]
        });
    };
    /** Send heartbeat to keep a group/link call alive (baileys) */
    const sendHeartbeat = async (callId, callCreator) => {
        await sendNode({
            tag: 'call',
            attrs: { to: `${callId}@call`, id: randomBytes(16).toString('hex').toUpperCase() },
            content: [{ tag: 'heartbeat', attrs: { 'call-id': callId, 'call-creator': callCreator }, content: undefined }]
        });
    };
    /** Send encryption re-key during a call (baileys) */
    const sendEncRekey = async (callId, callCreator, to, transactionId) => {
        await sendNode({
            tag: 'call',
            attrs: { to, id: randomBytes(16).toString('hex').toUpperCase() },
            content: [
                {
                    tag: 'enc_rekey',
                    attrs: { 'transaction-id': transactionId, 'call-id': callId, 'call-creator': callCreator },
                    content: [
                        { tag: 'encopt', attrs: { keygen: '2' }, content: undefined },
                        { tag: 'enc', attrs: { v: '2', type: 'msg' }, content: undefined }
                    ]
                }
            ]
        });
    };
    /** Send video state change during a call (baileys) */
    const sendVideoState = async (callId, callCreator, to, enabled, orientation = '1') => {
        await sendNode({
            tag: 'call',
            attrs: { to, id: randomBytes(16).toString('hex').toUpperCase() },
            content: [
                {
                    tag: 'video',
                    attrs: {
                        'call-id': callId,
                        'call-creator': callCreator,
                        state: enabled ? '1' : '0',
                        device_orientation: orientation
                    },
                    content: undefined
                }
            ]
        });
    };
    /** Query info about a call link before joining (baileys) */
    const queryCallLink = async (token, media = 'video') => {
        return await query({
            tag: 'call',
            attrs: { to: 'call', id: randomBytes(16).toString('hex').toUpperCase() },
            content: [{ tag: 'link_query', attrs: { media, token }, content: undefined }]
        });
    };
    /** Join a call via its link token (baileys) */
    const joinCallLink = async (token, media = 'video') => {
        const content = [
            { tag: 'audio', attrs: { rate: '16000', enc: 'opus' }, content: undefined },
            { tag: 'net', attrs: { medium: '2' }, content: undefined },
            { tag: 'capability', attrs: { ver: '1' }, content: undefined }
        ];
        if (media === 'video') {
            content.splice(1, 0, {
                tag: 'video',
                attrs: { screen_width: '1080', screen_height: '2400', dec: 'H264,H265,AV1', device_orientation: '0' },
                content: undefined
            });
        }
        return await query({
            tag: 'call',
            attrs: { to: 'call', id: randomBytes(16).toString('hex').toUpperCase() },
            content: [{ tag: 'link_join', attrs: { media, token }, content }]
        });
    };
    return {
        rejectCall,
        offerCall,
        initiateCall,
        terminateCall,
        cancelCall,
        acceptCall,
        preacceptCall,
        sendRelayLatency,
        sendTransport,
        sendCallDuration,
        muteCall,
        sendHeartbeat,
        sendEncRekey,
        sendVideoState,
        queryCallLink,
        joinCallLink
    };
}
//# sourceMappingURL=from-messages-recv.js.map