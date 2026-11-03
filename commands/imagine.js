const fs = require('fs');
const path = require('path');

const keyFile = path.join(process.env.HOME, '.config', 'cloudflare.env');

if (fs.existsSync(keyFile)) {
    for (const line of fs.readFileSync(keyFile, 'utf8').split(/\r?\n/)) {
        const i = line.indexOf('=');
        if (i < 0) continue;

        const key = line.slice(0, i).trim();
        const value = line.slice(i + 1).trim();

        if (key === 'CLOUDFLARE_API_TOKEN' ||
            key === 'CLOUDFLARE_ACCOUNT_ID') {
            process.env[key] = value;
        }
    }
}

module.exports = async function handleImagine(mek, body, from, sock) {
    const text = body || '';
    const match = text.match(/^[.!]?\s*تخيل\s+([\s\S]+)/i);

    if (!/^[.!]?\s*تخيل(?:\s|$)/i.test(text)) return false;

    if (!match || !match[1].trim()) {
        await sock.sendMessage(from, {
            text: '🎨 اكتب وصف الصورة بعد الأمر.\nمثال:\n.تخيل شخص يجلس وحيداً أمام البحر'
        }, { quoted: mek });
        return true;
    }

    try {
        const token = process.env.CLOUDFLARE_API_TOKEN;
        const account = process.env.CLOUDFLARE_ACCOUNT_ID;

        if (!token || !account) {
            throw new Error('مفتاح Cloudflare أو Account ID غير موجود.');
        }

        const userPrompt = match[1].trim();

        await sock.sendMessage(from, {
            text: '▰▰ *جـــاري الـتَّـحْـمـيـل صــــوْرَة* ▰▰ ⏳'
        }, { quoted: mek });

        const baseUrl =
            'https://api.cloudflare.com/client/v4/accounts/' +
            account + '/ai/run/';

        // المرحلة الأولى: فهم العربية وتحويلها إلى وصف دقيق
        const translateResponse = await fetch(
            baseUrl + '@cf/qwen/qwen3-30b-a3b-fp8',
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: `You are a multilingual image-prompt understanding assistant.
Understand user descriptions in ANY language, including Arabic, Moroccan Darija,
French, English, mixed languages, slang, spelling mistakes, long descriptions,
artistic requests, and incomplete natural-language instructions.

Convert the user's request into a detailed, clear English prompt suitable for
an AI image-generation model. Understand the intended visual result rather than
translating word-for-word. Preserve all requested subjects, text, names, numbers,
colors, style, mood, objects, actions, composition, and setting.
For artistic requests, interpret ordinary phrases such as "beautiful artistic
painting" as a visual-art style request. Do not reject a prompt merely because
it is long, informal, or written in a language other than English.
Do not add unrelated subjects or contradict the user's request.
If the user requests exact text in the image, preserve that text exactly.
Return only the final English image prompt, with no explanations, labels,
Markdown fences, or JSON.`
                        },
                        {
                            role: 'user',
                            content: userPrompt
                        }
                    ],
                    max_tokens: 900,
                    temperature: 0.2
                }),
                signal: AbortSignal.timeout(120000)
            }
        );

        const translated = await translateResponse.json();

        if (!translateResponse.ok || !translated.success) {
            console.error('QWEN ERROR:', JSON.stringify(translated).slice(0, 2000));
            throw new Error(
                translated.errors?.map(e => e.message).join('; ') ||
                'فشل فهم الوصف وترجمته.'
            );
        }

        // استخراج النص من أكثر من شكل محتمل لرد النموذج
        const result = translated.result || {};
        let englishPrompt =
            result.response ??
            result.text ??
            result.output ??
            result.content ??
            '';

        if (Array.isArray(englishPrompt)) {
            englishPrompt = englishPrompt
                .map(part => typeof part === 'string' ? part : (part?.text || ''))
                .join(' ');
        }

        if (englishPrompt && typeof englishPrompt === 'object') {
            englishPrompt =
                englishPrompt.text ??
                englishPrompt.content ??
                englishPrompt.response ??
                '';
        }

        englishPrompt = String(englishPrompt || '')
            .replace(/^```(?:\w+)?\s*/i, '')
            .replace(/\s*```\s*$/i, '')
            .replace(/^\s*(?:English prompt|Image prompt|Prompt)\s*:\s*/i, '')
            .trim();

        // إذا تعذرت خدمة الفهم أو رجعت رداً فارغاً، جرّب الوصف الأصلي
        // حتى لا يتوقف الأمر بسبب اختلاف تنسيق الرد.
        if (!englishPrompt) {
            console.warn('QWEN returned no usable prompt; using original user description.');
            englishPrompt = userPrompt;
        }

        console.log('IMAGINE PROMPT:', englishPrompt);

        // المرحلة الثانية: توليد الصورة
        const professionalPrompt = `
${englishPrompt}

IMAGE QUALITY:
Professional photorealistic photography.
Natural lighting, realistic anatomy and proportions,
authentic textures, physically accurate shadows,
natural colors and believable depth of field.

STRICT SCENE RULES:
Follow the described scene exactly.
Do not add people, animals, objects or actions
that were not requested.
Do not replace the requested location or activity.
No captions, text, logos or watermarks.
`;

        const imageResponse = await fetch(
            baseUrl + '@cf/black-forest-labs/flux-1-schnell',
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: professionalPrompt,
                    steps: 4
                }),
                signal: AbortSignal.timeout(240000)
            }
        );

        const imageResult = await imageResponse.json();

        if (!imageResponse.ok || !imageResult.success) {
            console.error('FLUX ERROR:', JSON.stringify(imageResult).slice(0, 2000));
            throw new Error(
                imageResult.errors?.map(e => e.message).join('; ') ||
                'فشل توليد الصورة.'
            );
        }

        const imageBase64 = imageResult.result?.image;

        if (!imageBase64) {
            throw new Error('لم ترجع خدمة الصور صورة.');
        }

        const imageBuffer = Buffer.from(imageBase64, 'base64');

        if (!imageBuffer.length) {
            throw new Error('الصورة الناتجة فارغة.');
        }

        await sock.sendMessage(from, {
            image: imageBuffer,
            mimetype: 'image/png',
            caption: '🌹 𝐀𝐘𝐎𝐔𝐁 𝐁𝐎𝐓 | 𝐀𝐈 𝐈𝐌𝐀𝐆𝐄'
        }, { quoted: mek });

    } catch (error) {
        console.error('IMAGINE ERROR:', error);

        await sock.sendMessage(from, {
            text: '❌ تعذر إنشاء الصورة.\nالسبب: ' +
                String(error.message || error).slice(0, 700)
        }, { quoted: mek });
    }

    return true;
};
