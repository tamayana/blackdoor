import { jidNormalizedUser, getContentType, areJidsSameUser, downloadContentFromMessage } from '@adiwajshing/baileys'
import { fileURLToPath } from 'url'
import { sizeFormatter } from 'human-readable'
import moment from 'moment-timezone'
import axios from 'axios'
import chalk from 'chalk'
import fs from 'fs'

// TEMPAT NYIMPEN FOTO SEKALI LIAT YANG BARU DATENG - BLACKDOOR - BIAR GRUP + PRIBADI BISA!
export const viewOnceCache = new Map()

/// ─────────── [ 𝖶𝖺𝗄𝗍𝗎 & 𝖳𝖺𝗇𝗀𝗀𝖺𝗅 - BLACKDOOR ] ────────── ///
export const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)

export const processTime = (timestamp, now) =>
    moment.duration(now - moment(timestamp * 1000)).asSeconds()

export const getTime = (format, date) => {
    if (date) return moment(date).locale('id').format(format)
    return moment.tz('Asia/Jakarta').locale('id').format(format)
}

export const tanggal = (numer) => {
    const bulanList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const hariList = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu']

    const tgl = new Date(numer)
    const hari = hariList[tgl.getDay()]
    const day = tgl.getDate()
    const bulan = bulanList[tgl.getMonth()]
    const yy = tgl.getYear()
    const year = (yy < 1000) ? yy + 1900 : yy

    return `${hari}, ${day} - ${bulan} - ${year}`
}

export const runtime = (seconds) => {
    seconds = Number(seconds)

    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor(seconds % (3600 * 24) / 3600)
    const m = Math.floor(seconds % 3600 / 60)
    const s = Math.floor(seconds % 60)

    const parts = []
    if (d) parts.push(`*${d}d*`)
    if (h) parts.push(`*${h}h*`)
    if (m) parts.push(`*${m}m*`)
    if (s) parts.push(`*${s}s*`)

    return parts.join(' ') || '*0s*'
}

export const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms))

/// ─────────── [ 𝖱𝖾𝗊𝗎𝖾𝗌𝗍 & 𝖡𝗎𝖿𝖿𝖾𝗋 - BLACKDOOR ] ────────── ///
export const getBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'get',
            url,
            headers: { 'DNT': 1, 'Upgrade-Insecure-Request': 1, 'User-Agent': 'Blackdoor/1.0' },
            ...options,
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (err) {
        return err
    }
}

export const fetchJson = async (url, options = {}) => {
    try {
        const res = await axios({ method: 'GET', url, headers: { 'User-Agent': 'Blackdoor/1.0' }, ...options })
        return res.data
    } catch (err) {
        return err
    }
}

/// ─────────── [ 𝖧𝖾𝗅𝗉𝖾𝗋 𝖳𝖾𝗄𝗌 & 𝖦𝗋𝗎𝗉 - BLACKDOOR ] ────────── ///
export const getRandom = (ext) => `blackdoor_${Math.floor(Math.random() * 10000)}${ext}`

export const generateMessageTag = (epoch) => {
    let tag = unixTimestampSeconds().toString()
    if (epoch) tag += '.--' + epoch
    return tag
}

export const formatp = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`
})

export const isUrl = (url) =>
    url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))

export const parseMention = (text = '') =>
    [...text.matchAll(/@([0-9]{5,16})/g)].map(v => v[1] + '@s.whatsapp.net')

export const getGroupAdmins = (participants = []) =>
    participants.filter(p => p.admin).map(p => p.id)

/// ─────────── [ 𝖴𝗇𝗐𝗋𝖺𝗉 𝖯𝖾𝗌𝖺𝗇 - BLACKDOOR ] ────────── ///
const WRAPPERS = [
    'ephemeralMessage',
    'viewOnceMessage',
    'viewOnceMessageV2',
    'viewOnceMessageV2Extension',
    'documentWithCaptionMessage',
    'editedMessage'
]

export const unwrapMessage = (message) => {
    let current = message

    for (let i = 0; i < 5 && current; i++) {
        const key = WRAPPERS.find(k => current[k]?.message)
        if (!key) break
        current = current[key].message
    }

    return current
}

/// ─────────── [ 𝖣𝗈𝗐𝗇𝗅𝗈𝖺𝖽 𝖬𝖾𝖽𝗂𝖺 𝗄𝖾 𝖡𝗎𝖿𝖿𝖾𝗋 - BLACKDOOR ] ────────── ///
const MEDIA_TYPES = {
    imageMessage: 'image',
    videoMessage: 'video',
    ptvMessage: 'video',
    audioMessage: 'audio',
    stickerMessage: 'sticker',
    documentMessage: 'document'
}

export const downloadMedia = async (content, mtype) => {
    const type = MEDIA_TYPES[mtype]
    if (!type || !content) return null

    const stream = await downloadContentFromMessage(content, type)
    const chunks = []
    for await (const chunk of stream) chunks.push(chunk)

    const buffer = Buffer.concat(chunks)
    return buffer.length ? buffer : null
}

/// ─────────── [ 𝖲𝖾𝗋𝗂𝖺𝗅𝗂𝗓𝖾 𝖯𝖾𝗌𝖺𝗇 - BLACKDOOR ] ────────── ///
export const smsg = (conn, m, store) => {
    if (!m) return m

    const decode = (jid) => conn.decodeJid?.(jid) || jidNormalizedUser(jid || '')
    if (m.key) {
        m.id = m.key.id
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = decode(m.fromMe ? conn.user?.id : m.key.participant || m.chat)
        if (m.isGroup) m.participant = decode(m.key.participant)

        const altJid = m.key.participantAlt || m.key.remoteJidAlt
        if (m.sender?.endsWith('@lid') && altJid?.endsWith('@s.whatsapp.net')) m.sender = decode(altJid)
    }

    if (m.message) {
        // CEK APAKAH INI FOTO SEKALI LIAT? KALO IYA, SIMPEN KUNCI NYA SEBELUM DI-UNWRAP!
        let isViewOnce = m.message.viewOnceMessage || m.message.viewOnceMessageV2 || m.message.viewOnceMessageV2Extension || m.message.ephemeralMessage?.message?.viewOnceMessageV2 || m.message.ephemeralMessage?.message?.viewOnceMessageV2Extension || m.message.ephemeralMessage?.message?.viewOnceMessage

        m.message = unwrapMessage(m.message)
        m.mtype = getContentType(m.message)
        m.msg = m.message[m.mtype]
        m.text = m.msg?.text || m.msg?.caption || m.message.conversation || ''

        // SIMPEN KE CACHE! INI KUNCI NYA MASIH ADA! BIAR GRUP + PRIBADI BISA!
        if (isViewOnce && m.msg?.mediaKey && m.id) {
            viewOnceCache.set(m.id, { media: m.msg, type: m.mtype })
            setTimeout(() => viewOnceCache.delete(m.id), 10 * 60 * 1000)
        }

        const quoted = unwrapMessage(m.msg?.contextInfo?.quotedMessage)

        if (quoted) {
            const type = getContentType(quoted)
            const content = quoted[type]
            const ctx = m.msg.contextInfo

            m.quoted = (content && typeof content === 'object')
                ? content
                : { [type]: content }

            m.quoted.mtype = type
            m.quoted.msg = content
            m.quoted.key = {
                remoteJid: m.chat,
                fromMe: areJidsSameUser(decode(ctx.participant), decode(conn.user?.id)),
                id: ctx.stanzaId,
                participant: decode(ctx.participant)
            }
            m.quoted.sender = decode(ctx.participant)
            m.quoted.download = () => downloadMedia(content, type)
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || ''
        }
    }

    // ── Shortcut aksi
    m.download = () => downloadMedia(m.msg, m.mtype)

    m.react = (emoji) =>
        conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }).catch(() => null)

    m.reply = (text, chatId = m.chat, options = {}) =>
        conn.sendMessage(chatId, { text }, { quoted: m, ...options })

    return m
}

/// ─────────── [ 𝖢𝗈𝗇𝗌𝗈𝗅𝖾 𝖥𝗂𝗅𝖾 - BLACKDOOR ] ────────── ///
const __filename = fileURLToPath(import.meta.url)

fs.watchFile(__filename, () => {
    fs.unwatchFile(__filename)
    console.log(chalk.hex('#8B00FF')(`Update Blackdoor ${__filename}`))
})
