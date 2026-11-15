import fs from 'fs'
import axios from 'axios'
import config from '../config.js'
import { createSticker } from './converter.js'
import { downloadMedia } from './myfunc.js'

/// ─────────── [ 𝖡𝗎𝖿𝖿𝖾𝗋 / 𝖴𝖱𝖫 / 𝖯𝖺𝗍𝗁 / 𝖡𝖺𝗌𝖾𝟨𝟦 - BLACKDOOR ] ────────── ///
export async function getFile(source) {
    if (Buffer.isBuffer(source)) return { data: source, mime: '' }
    if (typeof source === 'string') {
        if (/^https?:\/\//i.test(source)) {
            const res = await axios.get(source, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': 'Blackdoor/1.0' } })
            return { data: Buffer.from(res.data), mime: String(res.headers['content-type'] || '') }
        }
        if (/^data:.*?;base64,/i.test(source)) return { data: Buffer.from(source.split(',')[1], 'base64'), mime: '' }
        if (fs.existsSync(source)) return { data: fs.readFileSync(source), mime: '' }
    }
    throw new Error('Sumber media tidak valid - Blackdoor')
}

const sniffMime = (b) => {
    const h = b.subarray(0, 12)
    if (h.toString('ascii', 0, 4) === 'RIFF' && h.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
    if (h.toString('ascii', 4, 8) === 'ftyp') return 'video/mp4'
    if (h[0] === 0x1a && h[1] === 0x45) return 'video/webm'
    if (h.toString('ascii', 0, 3) === 'GIF') return 'image/gif'
    return 'image/jpeg'
}

/// ─────────── [ 𝖧𝖾𝗅𝗉𝖾𝗋 𝗌𝗈𝖼𝗄 - BLACKDOOR ] ────────── ///
export function attachHelpers(conn) {
    conn.sendSticker = async (jid, source, quoted, opts = {}) => {
        const { data, mime } = await getFile(source)
        const sticker = await createSticker(data, {
            mime: opts.mime || (/^(image|video)\//.test(mime) ? mime : sniffMime(data)),
            packname: opts.packname ?? config.botName ?? 'Blackdoor',
            author: opts.author ?? opts.packpublish ?? opts.packpublisher ?? config.ownerName ?? 'Tama-ID'
        })
        return conn.sendMessage(jid, { sticker }, quoted ? { quoted } : {})
    }

    conn.sendAsSticker = conn.sendSticker
    conn.sendImageAsSticker = conn.sendSticker
    conn.sendVideoAsSticker = conn.sendSticker

    // Alias Blackdoor biar enak dipanggil
    conn.sendBlackdoorSticker = conn.sendSticker

    conn.downloadMediaMessage = async (message) => {
        const msg = message?.msg || message
        const mtype = message?.mtype || Object.keys(msg || {})[0]
        return downloadMedia(message?.msg ? message.msg : msg, mtype)
    }

    return conn
}
