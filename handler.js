import fs from 'fs'
import crypto from 'crypto'
import path from 'path'
import axios from 'axios'
import sharp from 'sharp'
import chalk from 'chalk'
import config from './config.js'
import { fileURLToPath, pathToFileURL } from 'url'
import { proto, generateWAMessageFromContent, generateWAMessageContent, downloadContentFromMessage } from '@adiwajshing/baileys'
import { getGroupSettings, isBlacklisted } from './lib/database.js'
import print from './lib/print.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const pluginDir = path.join(__dirname, 'plugins')
const ownerPath = path.join(__dirname, 'database/owner.json')
const premiumPath = path.join(__dirname, 'database/premium.json')
const thumbPath = path.join(__dirname, 'media/bot.jpg')

export const plugins = new Map()
const pluginCache = new Map()
const pluginMtime = new Map()
const pluginHandlers = new Map()
const watchers = new Map()
const pendingReloads = new Map()
const msgCache = new Map()
const metaCache = new Map()
if (!global.confessDelete) global.confessDelete = new Set()
if (!global.confessPending) global.confessPending = {}
let thumb

const qkontak = {
    key: {
        fromMe: false,
        participant: '6285393659857@s.whatsapp.net',
        remoteJid: 'status@broadcast',
        id: 'Blackdoor'
    },
    message: {
        contactMessage: {
            displayName: 'Blackdoor by Tama-ID',
            vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;;;;\nFN:Blackdoor\nitem1.TEL;waid=6285393659857:+6285393659857\nitem1.X-ABLabel:Ponsel\nEND:VCARD',
            sendEphemeral: true
        }
    }
}

const relPath = (file) => path.relative(pluginDir, file).split(path.sep).join('/')

export function getPluginCommands(file) {
    const handler = pluginHandlers.get(file)
    if (!handler) return []
    const { command, help } = handler
    if (command && !(command instanceof RegExp)) {
        return [].concat(command).map(v => String(v).toLowerCase())
    }
    if (command instanceof RegExp) {
        const names = [].concat(help ?? [])
            .filter(v => typeof v === 'string')
            .map(v => v.trim().split(/\s+/)[0].toLowerCase())
            .filter(Boolean)
        return [...new Set(names)]
    }
    return []
}

export function findPlugin(command) {
    if (!command) return null
    const exact = plugins.get(command)
    if (exact) return exact
    for (const handler of new Set(plugins.values())) {
        const re = handler.command
        if (!(re instanceof RegExp)) continue
        re.lastIndex = 0
        if (re.test(command)) return handler
    }
    return null
}

export function getPluginFiles(dir) {
    let files = []
    if (!fs.existsSync(dir)) return files
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name)
        if (item.isDirectory()) files.push(...getPluginFiles(full))
        else if (item.isFile() && item.name.endsWith('.js')) files.push(full)
    }
    return files
}

export async function loadPlugin(file, { silent = false } = {}) {
    try { pluginMtime.set(file, fs.statSync(file).mtimeMs) } catch {}
    try {
        const module = await import(`${pathToFileURL(file).href}?update=${Date.now()}`)
        const handler = module.default
        if (!handler) return false
        const isUpdate = pluginCache.has(file)
        if (isUpdate) {
            for (const key of pluginCache.get(file)) plugins.delete(key)
        }
        const keys = []
        if (handler.command instanceof RegExp) {
            const key = Symbol(`command:${file}`)
            plugins.set(key, handler)
            keys.push(key)
        } else if (handler.command) {
            const commands = Array.isArray(handler.command) ? handler.command : [handler.command]
            for (const cmd of commands) {
                const key = String(cmd).toLowerCase()
                plugins.set(key, handler)
                keys.push(key)
            }
        }
        if (handler.customPrefix) {
            const key = Symbol(`prefix:${file}`)
            plugins.set(key, handler)
            keys.push(key)
        }
        pluginHandlers.set(file, handler)
        pluginCache.set(file, keys)
        if (!silent) console.log(chalk.redBright(`Update ${relPath(file)}`))
        return true
    } catch (e) {
        console.error(chalk.red(`Gagal memuat ${relPath(file)}: ${e?.message || e}`))
        return false
    }
}

export async function unloadPlugin(file) {
    pluginMtime.delete(file)
    if (!pluginCache.has(file)) return
    for (const key of pluginCache.get(file)) plugins.delete(key)
    pluginCache.delete(file)
    pluginHandlers.delete(file)
    console.log(chalk.redBright(`Delete ${relPath(file)}`))
}

async function reloadIfChanged(file) {
    try {
        if (pluginMtime.get(file) === fs.statSync(file).mtimeMs) return
    } catch {}
    await loadPlugin(file)
}

let scanning = false

async function scanPlugins() {
    if (scanning) return
    scanning = true
    try {
        const files = getPluginFiles(pluginDir)
        for (const file of files) await reloadIfChanged(file)
        for (const file of [...pluginCache.keys()]) {
            if (!files.includes(file)) await unloadPlugin(file)
        }
    } finally {
        scanning = false
    }
}

export async function initPlugins() {
    let total = 0
    for (const file of getPluginFiles(pluginDir)) {
        if (await loadPlugin(file, { silent: true })) total++
    }
    watch(pluginDir)
    setInterval(scanPlugins, 2000)
    return total
}

function watch(dir) {
    if (watchers.has(dir)) return
    watchers.set(dir, fs.watch(dir, (_, filename) => {
        if (!filename) return
        const file = path.join(dir, filename)
        if (!filename.endsWith('.js')) {
            try {
                if (fs.statSync(file).isDirectory() && !watchers.has(file)) {
                    watch(file)
                    for (const f of getPluginFiles(file)) reloadIfChanged(f)
                }
            } catch {}
            return
        }
        if (pendingReloads.has(file)) clearTimeout(pendingReloads.get(file))
        pendingReloads.set(file, setTimeout(async () => {
            pendingReloads.delete(file)
            if (fs.existsSync(file)) await reloadIfChanged(file)
            else await unloadPlugin(file)
        }, 200))
    }))
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        if (item.isDirectory()) watch(path.join(dir, item.name))
    }
}

const COLORS = ['#128C7E', '#075E54', '#34B7F1', '#9C27B0', '#E91E63', '#FF5722', '#795548', '#607D8B', '#3F51B5', '#009688']
const MEDIA_TYPES = { imageMessage: 'image', videoMessage: 'video', audioMessage: 'audio' }
const KIND_LABEL = { text: 'Teks', image: 'Gambar', video: 'Video', audio: 'Audio' }

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
export const describeSource = (src) => KIND_LABEL[src.kind] || 'Konten'
export const getRawArgs = (m) => (m.text || '').replace(/^\S+\s*/, '')

async function downloadBuffer(msg, type) {
    const chunks = []
    for await (const chunk of await downloadContentFromMessage(msg, type)) chunks.push(chunk)
    return Buffer.concat(chunks)
}

export async function resolveStatusSource(m, caption = '') {
    const text = (caption || '').trim()
    if (m.quoted?.mtype && MEDIA_TYPES[m.quoted.mtype]) {
        const kind = MEDIA_TYPES[m.quoted.mtype]
        return {
            kind,
            buffer: await downloadBuffer(m.quoted.msg, kind),
            caption: text || m.quoted.caption || '',
            mimetype: m.quoted.msg?.mimetype
        }
    }
    if (m.mtype && MEDIA_TYPES[m.mtype]) {
        const kind = MEDIA_TYPES[m.mtype]
        return { kind, buffer: await downloadBuffer(m.msg, kind), caption: text, mimetype: m.msg?.mimetype }
    }
    const finalText = text || (m.quoted?.text || '').trim()
    if (finalText) return { kind: 'text', text: finalText }
    return { error: 'Isi story belum ada. Kirim teks, atau reply / kirim gambar, video, audio.' }
}

export function prepareGroupStatus(conn, src) {
    const contents = {
        text: { text: src.text },
        image: { image: src.buffer, caption: src.caption },
        video: { video: src.buffer, caption: src.caption },
        audio: { audio: src.buffer, mimetype: src.mimetype || 'audio/mp4', ptt: true }
    }
    const content = contents[src.kind]
    if (!content) throw new Error('Tipe konten tidak didukung')
    return generateWAMessageContent(content, {
        upload: conn.waUploadToServer,
        backgroundColor: src.kind === 'text' ? COLORS[Math.floor(Math.random() * COLORS.length)] : undefined
    })
}

export async function relayGroupStatus(conn, jid, inside) {
    const messageSecret = crypto.randomBytes(32)
    const msg = generateWAMessageFromContent(jid, {
        messageContextInfo: { messageSecret },
        groupStatusMessageV2: { message: { ...inside, messageContextInfo: { messageSecret } } }
    }, { userJid: conn.user.id })
    await conn.relayMessage(jid, msg.message, { messageId: msg.key.id })
    return msg
}

export async function listGroups(conn) {
    const all = await conn.groupFetchAllParticipating()
    return Object.values(all)
        .map(g => ({ id: g.id, subject: g.subject || 'Tanpa Nama', size: g.participants?.length || 0 }))
        .sort((a, b) => a.subject.localeCompare(b.subject))
}

const guardNorm = (jid) => (typeof jid === 'string' ? jid.replace(/:\d+@/, '@') : '')

const notified = new Map()

async function removeMessage(conn, m) {
    try {
        await conn.sendMessage(m.chat, { delete: m.key })
        return true
    } catch {
        return false
    }
}

async function kickSender(conn, m, metadata) {
    const member = (metadata?.participants || []).find(p => [p.id, p.lid, p.jid, p.phoneNumber].some(v => v && guardNorm(v) === guardNorm(m.sender)))
    try {
        await conn.groupParticipantsUpdate(m.chat, [member?.id || m.sender], 'remove')
        return true
    } catch {
        return false
    }
}

async function notify(conn, m, scope, text) {
    const key = `${scope}:${m.chat}:${m.sender}`
    if (Date.now() - (notified.get(key) || 0) < 30000) return
    notified.set(key, Date.now())
    if (notified.size > 400) notified.delete(notified.keys().next().value)
    await conn.sendMessage(m.chat, { text, mentions: [m.sender] }).catch(() => {})
}

const TAGSW_KEY = /statusmention/i

function hasStatusMention(node, depth = 0) {
    if (!node || typeof node !== 'object' || depth > 6 || node instanceof Uint8Array) return false
    for (const [key, value] of Object.entries(node)) {
        if (key === 'contextInfo' || key === 'quotedMessage') continue
        if (TAGSW_KEY.test(key)) return true
        if (key === 'protocolMessage' && value && (value.type === 25 || value.type === 'STATUS_MENTION_MESSAGE')) return true
        if (value && typeof value === 'object' && hasStatusMention(value, depth + 1)) return true
    }
    return false
}

async function antiTagSw(conn, m, getContext) {
    if (!getGroupSettings(m.chat).antitagsw) return false
    if (!(TAGSW_KEY.test(m.mtype || '') || hasStatusMention(m.message))) return false
    const { isAdmin, isBotAdmin } = await getContext()
    if (isAdmin || !isBotAdmin) return false
    if (!(await removeMessage(conn, m))) return false
    await notify(conn, m, 'tagsw', `*Anti Tag Sw*\n\n@${m.sender.split('@')[0]} terdeteksi tag grup di status, pesan dihapus.`)
    return true
}

async function antiSwgc(conn, m, getContext) {
    if (!getGroupSettings(m.chat).antiswgc) return false
    const isGroupStatus = Object.keys(m.message || {}).some(k => /^groupStatusMessage/i.test(k)) || /^groupStatusMessage/i.test(m.mtype || '')
    if (!isGroupStatus) return false
    const { isAdmin, isBotAdmin } = await getContext()
    if (isAdmin || !isBotAdmin) return false
    if (!(await removeMessage(conn, m))) return false
    await notify(conn, m, 'swgc', `*Anti Sw Group*\n> @${m.sender.split('@')[0]} terdeteksi mengirim status grup, pesan dihapus.`)
    return true
}

const BOT_ONLY_TYPES = ['interactiveMessage', 'buttonsMessage', 'listMessage', 'templateMessage', 'highlyStructuredMessage', 'richResponseMessage', 'botForwardedMessage', 'botInvokeMessage']

function detectBot(m) {
    const id = String(m.key?.id || '')
    if (id.startsWith('BAE5') && id.length === 16) return 'id Baileys'
    if (id.startsWith('NJX-')) return 'id bot'
    if (/^3EB0[0-9A-F]{36}$/.test(id)) return 'id Baileys'
    if (Object.keys(m.message || {}).some(k => BOT_ONLY_TYPES.includes(k))) return 'pesan interaktif'
    return ''
}

async function antiBot(conn, m, getContext) {
    const cfg = getGroupSettings(m.chat)
    if (!cfg.antibot) return false
    const reason = detectBot(m)
    if (!reason) return false
    const { metadata, isAdmin, isBotAdmin } = await getContext()
    if (isAdmin || !isBotAdmin) return false
    if (!(await removeMessage(conn, m))) return false
    const kicked = cfg.antibotKick ? await kickSender(conn, m, metadata) : false
    await notify(conn, m, 'bot', `*Anti Bot*\n\n@${m.sender.split('@')[0]} terdeteksi sebagai bot (${reason}), pesan dihapus${kicked ? ' dan bot dikeluarkan' : ''}.`)
    return true
}

const STRONG = [
    'slot gacor', 'slot online', 'situs slot', 'agen slot', 'link slot', 'daftar slot', 'bocoran slot', 'slot88', 'slot777',
    'judi online', 'judi slot', 'judi bola', 'judol', 'togel', 'toto macau', 'bandar togel', 'bandar judi', 'bandar bola',
    'casino online', 'live casino', 'sbobet', 'joker123', 'pragmatic play', 'gates of olympus', 'starlight princess',
    'sweet bonanza', 'mahjong ways', 'maxwin', 'max win', 'rtp slot', 'rtp live', 'rtp gacor', 'bocoran rtp',
    'link alternatif', 'agen judi', 'agen bola', 'taruhan online', 'sportsbook', 'poker online', 'domino qq', 'dominoqq',
    'bandarq', 'sicbo', 'baccarat', 'akun pro', 'akun vip', 'akun gacor', 'pola gacor', 'jam gacor', 'scatter hitam'
]

const MEDIUM = [
    'gacor', 'jackpot', 'deposit', 'depo', 'withdraw', 'wd', 'bonus new member', 'bonus deposit', 'new member', 'cashback',
    'rollingan', 'turnover', 'freebet', 'free spin', 'anti rungkad', 'anti blokir', 'modal receh', 'modal kecil',
    'pasti jp', 'pasti wd', 'pasti cair', 'auto cuan', 'daftar sekarang', 'link daftar', 'situs terpercaya', 'situs resmi',
    'situs gacor', 'winrate', 'member baru', 'bonus harian', 'bonus mingguan', 'min depo', 'scatter', 'rtp'
]

const STRONG_WEIGHT = 3
const MEDIUM_WEIGHT = 1.5
const URL_BONUS = 1.5
const THRESHOLD = 4

const esc = (c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const build = (phrase) => {
    const words = phrase.split(' ').map(w => [...w].map(esc).join('[^a-z0-9]?'))
    const letters = phrase.replace(/ /g, '').length
    return new RegExp(`(?<![a-z0-9])${words.join('[^a-z0-9]{0,3}')}${letters <= 4 ? '(?![a-z0-9])' : ''}`)
}

const STRONG_RE = STRONG.map(build)
const MEDIUM_RE = MEDIUM.map(build)
const DOMAIN_RE = /(?:slot|toto|togel|judi|gacor|casino|maxwin|jackpot|sbo|joker|pragmatic|olympus|zeus|mahjong|bandar)[a-z0-9-]*\.(?:com|net|org|xyz|online|site|id|vip|club|top|live|lol|info|co|me|cc|pro|bar|fun|win|bet|link|shop|one|app|click|games)\b/
const URL_RE = /(?:https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|xyz|online|site|id|vip|club|top|live|lol|info|co|me|cc|pro|bar|fun|win|bet|link|shop|one|app|click|games)\b)/

const clean = (t) => String(t)
    .normalize('NFKC')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '')
    .toLowerCase()

const LEET_A = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's' }
const LEET_B = { ...LEET_A, 1: 'l' }
const deleet = (t, map) => t.replace(/[013457@$]/g, (c) => map[c])

function analyze(raw) {
    const base = clean(raw).slice(0, 3000)
    if (base.length < 6) return { score: 0, hits: [] }
    let best = { score: 0, hits: [] }
    for (const text of new Set([base, deleet(base, LEET_A), deleet(base, LEET_B)])) {
        let score = 0
        const hits = []
        STRONG_RE.forEach((re, i) => { if (re.test(text)) { score += STRONG_WEIGHT; hits.push(STRONG[i]) } })
        MEDIUM_RE.forEach((re, i) => { if (re.test(text)) { score += MEDIUM_WEIGHT; hits.push(MEDIUM[i]) } })
        if (DOMAIN_RE.test(text)) { score += STRONG_WEIGHT; hits.push('domain judi') }
        if (score >= MEDIUM_WEIGHT && URL_RE.test(text)) score += URL_BONUS
        if (score > best.score) best = { score, hits }
    }
    return best
}
const TEXT_KEYS = new Set(['text', 'caption', 'conversation', 'title', 'description', 'body', 'contentText', 'name', 'displayName', 'optionName', 'matchedText'])

function collectText(node, out = [], depth = 0) {
    if (!node || typeof node !== 'object' || depth > 6 || node instanceof Uint8Array) return out
    for (const [key, value] of Object.entries(node)) {
        if (key === 'contextInfo' || key === 'quotedMessage') continue
        if (typeof value === 'string') { if (TEXT_KEYS.has(key)) out.push(value) }
        else if (Array.isArray(value)) value.forEach(v => collectText(v, out, depth + 1))
        else if (value && typeof value === 'object') collectText(value, out, depth + 1)
    }
    return out
}

async function antiJudol(conn, m, getContext) {
    const cfg = getGroupSettings(m.chat)
    if (!cfg.antijudol) return false
    const text = collectText(m.message).join('\n')
    if (!text) return false
    const { score } = analyze(text)
    if (score < THRESHOLD) return false
    const { metadata, isAdmin, isBotAdmin } = await getContext()
    if (isAdmin || !isBotAdmin) return false
    if (!(await removeMessage(conn, m))) return false
    const kicked = cfg.antijudolKick ? await kickSender(conn, m, metadata) : false
    if (kicked) {
        await conn.sendMessage(m.chat, { text: `🚨 *KENA KICK!* 🚨\n\n@${m.sender.split('@')[0]} udah kebanyakan kirim JUDOL!\n\n❌ Pesan dihapus\n❌ LANGSUNG DIKICK!`, mentions: [m.sender] })
        return true
    }
    if (!global.antijudolWarn) global.antijudolWarn = {}
    if (!global.antijudolWarn[m.chat]) global.antijudolWarn[m.chat] = {}
    if (!global.antijudolWarn[m.chat][m.sender]) global.antijudolWarn[m.chat][m.sender] = 0
    global.antijudolWarn[m.chat][m.sender]++
    const warnCount = global.antijudolWarn[m.chat][m.sender]
    const marahList = [
        `🚨 *WOY TOLOL! KETANGKEP JUDOL!* 🚨\n\n@${m.sender.split('@')[0]} Otak lu di mana?! Ngapain kirim JUDOL di sini?!\n\n❌ Pesan sampah lu udah gua hapus!\n⚠️ Warn lu: *${warnCount}/3*`,
        `😡 *EH BABI!* 😡\n\n@${m.sender.split('@')[0]} lu kira ini grup bandar?! Hah?!\n\n❌ Pesan lu gua hapus!\n⚠️ Warn: *${warnCount}/3*`,
        `🤬 *WOY ANJING!* 🤬\n\n@${m.sender.split('@')[0]} STOP KIRIM JUDOL! LU PIKIR GRUP INI TEMPAT JUALAN TOGEL?!\n\n❌ Dihapus!\n⚠️ Warn: *${warnCount}/3*`,
        `🖕 *WOY SAMPAH!* 🖕\n\n@${m.sender.split('@')[0]} lu jualan judol di sini? Lu mau gua laporin ke polisi?!\n\n❌ Pesan lu udah gua hapus!\n⚠️ Warn: *${warnCount}/3*`
    ]
    const marah = marahList[Math.floor(Math.random() * marahList.length)]
    await conn.sendMessage(m.chat, { text: marah, mentions: [m.sender] })
    await conn.sendMessage(m.chat, { react: { text: '😡', key: m.key } })
    return true
}

const SPAM_LIMIT = 6
const SPAM_WINDOW = 7000
const spamLog = new Map()

async function antiSpam(conn, m, getContext) {
    const cfg = getGroupSettings(m.chat)
    if (!cfg.antispam) return false
    const id = `${m.chat}:${m.sender}`
    const now = Date.now()
    const log = (spamLog.get(id) || []).filter(e => now - e.time < SPAM_WINDOW)
    log.push({ time: now, key: m.key, deleted: false })
    spamLog.set(id, log)
    if (spamLog.size > 500) spamLog.delete(spamLog.keys().next().value)
    if (log.length < SPAM_LIMIT) return false
    const { metadata, isAdmin, isBotAdmin } = await getContext()
    if (isAdmin || !isBotAdmin) return false
    for (const entry of log) {
        if (entry.deleted) continue
        entry.deleted = true
        await conn.sendMessage(m.chat, { delete: entry.key }).catch(() => {})
    }
    const kicked = cfg.antispamKick ? await kickSender(conn, m, metadata) : false
    await notify(conn, m, 'spam', `*Anti Spam*\n\n@${m.sender.split('@')[0]} terdeteksi spam, pesan dihapus${kicked ? ' dan pengirim dikeluarkan' : ''}.`)
    return true
}

const VIRTEX_MAX_TEXT = 10000
const VIRTEX_MAX_LABEL = 1500
const VIRTEX_MAX_HIDDEN = 300
const VIRTEX_LABEL_KEYS = new Set(['fileName', 'displayName', 'title', 'name', 'address'])
const HIDDEN_CHARS = /[\u034F\u115F\u1160\u200B-\u200F\u202A-\u202E\u2060-\u2064\u3164\uFEFF\uFFA0]/g
const MARK_RUN = /\p{M}{25,}/u

function collectStrings(node, out = [], depth = 0) {
    if (!node || typeof node !== 'object' || depth > 8 || node instanceof Uint8Array) return out
    for (const [key, value] of Object.entries(node)) {
        if (key === 'quotedMessage') continue
        if (typeof value === 'string') out.push([key, value])
        else if (value && typeof value === 'object') collectStrings(value, out, depth + 1)
    }
    return out
}

function detectVirtex(m) {
    const strings = collectStrings(m.message)
    let hidden = 0
    for (const [key, value] of strings) {
        if (value.length > VIRTEX_MAX_TEXT) return 'teks terlalu panjang'
        if (VIRTEX_LABEL_KEYS.has(key) && value.length > VIRTEX_MAX_LABEL) return 'nama / judul terlalu panjang'
        if (value.length > 200) {
            hidden += (value.match(HIDDEN_CHARS) || []).length
            if (MARK_RUN.test(value)) return 'karakter rusak'
        }
    }
    if (hidden > VIRTEX_MAX_HIDDEN) return 'karakter tersembunyi'
    const contacts = m.message?.contactsArrayMessage?.contacts || []
    const vcards = [m.message?.contactMessage?.vcard, ...contacts.map(c => c?.vcard)].filter(Boolean)
    if (contacts.length > 20 || vcards.reduce((n, v) => n + v.length, 0) > 50000) return 'kontak berlebihan'
    return ''
}

async function antiVirtex(conn, m, getContext) {
    const cfg = getGroupSettings(m.chat)
    if (!cfg.antivirtex) return false
    const reason = detectVirtex(m)
    if (!reason) return false
    const { metadata, isAdmin, isBotAdmin } = await getContext()
    if (isAdmin || !isBotAdmin) return false
    if (!(await removeMessage(conn, m))) return false
    const kicked = cfg.antivirtexKick ? await kickSender(conn, m, metadata) : false
    await notify(conn, m, 'virtex', `*Anti Virtex*\n\n@${m.sender.split('@')[0]} terdeteksi mengirim virtex (${reason}), pesan dihapus${kicked ? ' dan pengirim dikeluarkan' : ''}.`)
    return true
}

const GUARDS = [
    ['Anti Tag SW', antiTagSw],
    ['Anti SWGC', antiSwgc],
    ['Anti Bot', antiBot],
    ['Anti Judol', antiJudol],
    ['Anti Virtex', antiVirtex],
    ['Anti Spam', antiSpam]
]

async function runGuards(conn, m, getContext, isOld) {
    if (m.fromMe || m.isOwner || isOld) return false
    for (const [name, guard] of GUARDS) {
        try {
            if (await guard(conn, m, getContext)) return true
        } catch (e) {
            console.error(`${name} error: ${e?.message || e}`)
        }
    }
    return false
}

async function checkGuards(conn, m) {
    let context = null
    const getContext = async () => {
        if (context) return context
        const cached = metaCache.get(m.chat)
        let metadata = cached && Date.now() - cached.time < 60000 ? cached.data : null
        if (!metadata) {
            metadata = await conn.groupMetadata(m.chat).catch(() => cached?.data || null)
            if (metadata) metaCache.set(m.chat, { data: metadata, time: Date.now() })
        }
        const admins = new Set()
        for (const p of metadata?.participants || []) {
            if (!p.admin) continue
            for (const id of [p.id, p.lid, p.jid, p.phoneNumber]) if (id) admins.add(guardNorm(id))
        }
        context = {
            metadata,
            isAdmin: [m.sender, m.participant, m.key?.participant, m.key?.participantAlt]
                .filter(Boolean).some(id => admins.has(guardNorm(id))),
            isBotAdmin: [conn.user?.id, conn.user?.lid, conn.user?.jid]
                .filter(Boolean).some(id => admins.has(guardNorm(id)))
        }
        return context
    }
    const ts = m.messageTimestamp
    const sec = typeof ts === 'object' && ts ? Number(ts.toNumber?.() ?? ts.low ?? 0) : Number(ts || 0)
    const isOld = !!sec && Math.floor(Date.now() / 1000) - sec > 60
    return runGuards(conn, m, getContext, isOld)
}

async function guardUnadmin(conn, data, toPn) {
    const { id, participants = [], author } = data
    if (!author) return
    const botIds = [conn.user?.id, conn.user?.lid, conn.user?.jid].filter(Boolean).map(guardNorm)
    if (botIds.includes(guardNorm(author))) return
    const authorJid = await toPn(author)
    const number = authorJid.split('@')[0]
    const owner = (() => { try { return JSON.parse(fs.readFileSync(ownerPath, 'utf8')) } catch { return [] } })()
    const trusted = [...(config.creator || []), ...owner].map(v => String(v).split('@')[0].replace(/[^0-9]/g, ''))
    if (trusted.includes(number)) return
    const metadata = await conn.groupMetadata(id).catch(() => null)
    const botAdmin = (metadata?.participants || []).some(p => p.admin && [p.id, p.lid, p.jid, p.phoneNumber].some(v => v && botIds.includes(guardNorm(v))))
    if (!botAdmin) return
    const restored = []
    for (const user of participants) {
        const target = typeof user === 'string' ? user : user.id
        if (!target || guardNorm(target) === guardNorm(author)) continue
        const ok = await conn.groupParticipantsUpdate(id, [target], 'promote').then(() => true).catch(() => false)
        if (ok) restored.push(await toPn(user))
    }
    if (!restored.length) return
    await conn.groupParticipantsUpdate(id, [author], 'demote').catch(() => {})
    await conn.sendMessage(id, {
        text: `*Anti Unadmin*\n\n@${number} terdeteksi menurunkan admin. ${restored.map(j => `@${j.split('@')[0]}`).join(', ')} dikembalikan jadi admin, dan @${number} diturunkan.`,
        mentions: [authorJid, ...restored]
    }).catch(() => {})
}

export default async function handler(conn, event, data) {
    const norm = (jid) => (typeof jid === 'string' ? jid.replace(/:\d+@/, '@') : '')
    if (event === 'message') {
        const m = data
        try {
            const msg = m.message || {}
            let body = ''
            let isButtonResponse = false
            if (msg.conversation) body = msg.conversation
            else if (msg.extendedTextMessage?.text) body = msg.extendedTextMessage.text
            else if (msg.imageMessage?.caption) body = msg.imageMessage.caption
            else if (msg.videoMessage?.caption) body = msg.videoMessage.caption
            else if (msg.documentMessage?.caption) body = msg.documentMessage.caption
            else if (msg.interactiveResponseMessage) {
                const inter = msg.interactiveResponseMessage
                if (inter.nativeFlowResponseMessage) {
                    const flow = inter.nativeFlowResponseMessage
                    if (flow.paramsJson) {
                        try {
                            const params = JSON.parse(flow.paramsJson)
                            body = params.id || params.buttonId || params.rowId || params.index || ''
                        } catch { body = flow.name || '' }
                    } else body = flow.name || ''
                    isButtonResponse = true
                } else if (inter.buttonReply) {
                    body = inter.buttonReply.selectedButtonId || ''
                    isButtonResponse = true
                } else if (inter.singleSelectReply) {
                    body = inter.singleSelectReply.selectedRowId || ''
                    isButtonResponse = true
                }
            } else if (msg.templateButtonReplyMessage) {
                body = msg.templateButtonReplyMessage.selectedId || ''
                isButtonResponse = true
            } else if (msg.buttonsResponseMessage) {
                body = msg.buttonsResponseMessage.selectedButtonId || ''
                isButtonResponse = true
            } else if (
                Object.keys(msg).some(key => /^groupStatusMention/i.test(key)) ||
                msg.protocolMessage?.type === 25 ||
                msg.protocolMessage?.type === 'STATUS_MENTION_MESSAGE'
            ) body = '[groupStatusMention]'

            m.text = body || m.text || ''
            m.isButtonResponse = isButtonResponse

            const [owner, premium] = [ownerPath, premiumPath].map(file => {
                try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return [] }
            })
            const number = m.sender.split('@')[0]
            const botNumber = conn.decodeJid(conn.user.id).split('@')[0]
            const creators = [botNumber, ...(config.creator || [])].map(v => String(v).replace(/[^0-9]/g, ''))
            m.isCreator = creators.includes(number)
            m.isOwner = m.isCreator || owner.map(v => v.split('@')[0]).includes(number)
            m.isPremium = m.isOwner || premium.map(v => v.split('@')[0]).includes(number)
            await print(m, conn)
            if (m.isGroup && m.key?.id && m.message) {
                msgCache.set(m.key.id, { key: m.key, message: m.message, chat: m.chat, sender: m.sender })
                if (msgCache.size > 500) msgCache.delete(msgCache.keys().next().value)
            }
            if (m.isGroup && !m.fromMe) {
                if (await checkGuards(conn, m)) {
                    msgCache.delete(m.key.id)
                    return
                }
                if (/^BAE5/.test(m.key?.id || '') && String(m.key.id).length === 16) return
            }
            try {
                if (!global.db) global.db = { data: { users: {} } }
                if (!global.db.data.users) global.db.data.users = {}
                let users = global.db.data.users
                const cariMention = (obj, out = [], depth = 0) => {
                    if (!obj || typeof obj !== 'object' || depth > 6) return out
                    if (Array.isArray(obj)) { for (let v of obj) cariMention(v, out, depth + 1); return out }
                    for (let k in obj) {
                        if (k === 'mentionedJid' && Array.isArray(obj[k])) out.push(...obj[k])
                        else if (typeof obj[k] === 'object' && k !== 'conn' && k !== 'key') cariMention(obj[k], out, depth + 1)
                    }
                    return out
                }
                let mentionedAFK = [...new Set([
                    ...(m.mentionedJid || []),
                    ...cariMention(m.message),
                    ...cariMention(m.msg),
                    ...cariMention(m.message?.extendedTextMessage?.contextInfo),
                    ...cariMention(m.msg?.contextInfo)
                ])]
                let meta = null
                let isGroup = m.chat?.endsWith('@g.us')
                if (isGroup) {
                    try { meta = await conn.groupMetadata(m.chat) } catch {}
                }
                const lidToPn = (jid) => {
                    let j = String(jid)
                    if (!j.endsWith('@lid')) return j
                    let p = (meta?.participants || []).find(x => String(x.lid) === j || String(x.id) === j)
                    if (p?.phoneNumber) return p.phoneNumber
                    if (p?.id && p.id.endsWith('@s.whatsapp.net')) return p.id
                    return j
                }
                const toPn = async (jid) => {
                    let j = lidToPn(jid)
                    if (!j.endsWith('@lid')) return j
                    try {
                        let pn = await conn.signalRepository?.lidMapping?.getPNForLID(j)
                        if (pn) return String(pn).includes('@') ? pn : pn + '@s.whatsapp.net'
                    } catch {}
                    return j
                }
                const cariUser = async (jid) => {
                    let pn = await toPn(jid)
                    if (users[pn]) return { jid: pn, data: users[pn] }
                    for (let k in users) {
                        if (!users[k]?.afk) continue
                        let kPn = await toPn(k)
                        if (kPn === pn || k === String(jid)) return { jid: k, data: users[k] }
                        if (kPn.split('@')[0] === pn.split('@')[0]) return { jid: k, data: users[k] }
                    }
                    return null
                }
                if (mentionedAFK.length > 0) {
                    let pnSender = await toPn(m.sender)
                    for (let jid of mentionedAFK) {
                        let pnTarget = await toPn(jid)
                        if (pnTarget.split('@')[0] === pnSender.split('@')[0]) continue
                        let found = await cariUser(jid)
                        if (found?.data?.afk) {
                            let lama = Math.floor((Date.now() - found.data.afk) / 60000)
                            await conn.sendMessage(m.chat, { text: `*DIA LAGI AFK!* 💤\n\n@${pnTarget.split('@')[0]} lagi AFK ${lama < 1 ? 'baru aja' : lama + ' menit yang lalu'}!\nAlasan: ${found.data.afkReason || 'tanpa alasan'}\n\nJangan diganggu dulu!`, mentions: [pnTarget] }, { quoted: m })
                        }
                    }
                }
                let me = await cariUser(m.sender)
                let low = (body || '').toLowerCase().trim()
                if (me?.data?.afk && !low.startsWith('afk') && !low.startsWith('.afk')) {
                    me.data.afk = 0
                    me.data.afkReason = ''
                    await conn.sendMessage(m.chat, { text: `Welcome back! Lu udah gak AFK lagi!` }, { quoted: m })
                }
            } catch (e) { console.log('AFK error:', e.message) }
            if (!body) return
            if (config.botMode === 'self' && !m.isOwner && !m.fromMe) return
            if (!m.isOwner && isBlacklisted(m.sender)) return
            const prefixes = config.prefix || ['.']
            let plugin = null
            let command = ''
            let args = []
            let prefix = ''
            let viaCustom = false
            if (isButtonResponse) {
                let text = body
                for (const p of prefixes) {
                    if (text.startsWith(p)) { text = text.slice(p.length); break }
                }
                args = text.trim().split(/\s+/)
                command = args.shift().toLowerCase()
                plugin = findPlugin(command)
            } else {
                prefix = prefixes.find(p => m.text.startsWith(p)) || ''
                if (!prefix) {
                    const customs = [...plugins.values()].filter(h => h.customPrefix)
                    plugin = customs.find(h => h.customPrefix.source.startsWith('^') && h.customPrefix.test(m.text)) ||
                        customs.find(h => !h.customPrefix.source.startsWith('^') && h.customPrefix.test(m.text)) ||
                        null
                    viaCustom = !!plugin
                }
                if (!plugin) {
                    if (prefix) {
                        const rest = m.text.slice(prefix.length).trim()
                        if (!rest) return
                        args = rest.split(/\s+/)
                        command = args.shift().toLowerCase()
                    } else {
                        const trimmed = m.text.trim()
                        if (/\s/.test(trimmed)) return
                        command = trimmed.toLowerCase()
                    }
                    plugin = findPlugin(command)
                }
            }
            if (!plugin) {
                if (isButtonResponse || m.text.trim().toLowerCase() !== 'bot') return
                const meta = m.isGroup ? await conn.groupMetadata(m.chat).catch(() => null) : null
                thumb ??= await sharp(thumbPath).resize(300, 300).jpeg({ quality: 80 }).toBuffer().catch(() => undefined)
                return await conn.relayMessage(m.chat, {
                    extendedTextMessage: {
                        text: '*BLACKDOOR ONLINE BUNG 🔥*',
                        contextInfo: {
                            mentionedJid: meta?.participants?.map(u => u.id) || [],
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterName: config.saluranName,
                                newsletterJid: config.saluranId,
                                serverMessageId: 143
                            },
                            businessMessageForwardInfo: {
                                businessOwnerJid: conn.decodeJid(conn.user.id)
                            },
                            externalAdReply: {
                                automatedGreetingMessageShown: true,
                                greetingMessageBody: 'BLACKDOOR ONLINE',
                                thumbnail: thumb,
                                title: `Blackdoor by Tama-ID`,
                                body: `${m.pushName}`,
                                mediaType: 1,
                                containsAutoReply: true
                            }
                        }
                    }
                }, {}).catch(() => {})
            }
            const RaplyGwe = async (text) => {
                await conn.sendMessage(m.chat, {
                    text: `${text}`,
                    contextInfo: {
                        forwardingScore: 9,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: config.saluranId,
                            newsletterName: config.saluranName,
                            serverMessageId: 127
                        }
                    }
                }, { quoted: qkontak })
            }
            const mutating = !!(plugin.admin || plugin.botAdmin)
            let groupMetadata = null
            let participants = []
            let isAdmin = false
            let isBotAdmin = false
            if (m.isGroup) {
                const cached = metaCache.get(m.chat)
                if (!mutating && cached && Date.now() - cached.time < 60000) groupMetadata = cached.data
                else {
                    groupMetadata = await conn.groupMetadata(m.chat).catch(() => cached?.data || null)
                    if (groupMetadata) metaCache.set(m.chat, { data: groupMetadata, time: Date.now() })
                }
                participants = (groupMetadata?.participants || []).map(p => ({
                    ...p,
                    tag: '@' + ([p.phoneNumber, p.jid, p.id].find(v => typeof v === 'string' && v.endsWith('@s.whatsapp.net')) || p.id).split('@')[0]
                }))
                const admins = new Set()
                for (const p of participants) {
                    if (!p.admin) continue
                    for (const id of [p.id, p.lid, p.jid, p.phoneNumber]) if (id) admins.add(norm(id))
                }
                isAdmin = [m.sender, m.participant, m.key?.participant, m.key?.participantAlt]
                    .filter(Boolean).some(id => admins.has(norm(id)))
                isBotAdmin = [conn.user?.id, conn.user?.lid, conn.user?.jid]
                    .filter(Boolean).some(id => admins.has(norm(id)))
            }
            const denied = [
                [!m.isGroup && config.privateOnlyPremium === true && !m.isPremium && !m.fromMe, 'privatePremium'],
                [plugin.owner && !m.isOwner, 'owner'],
                [plugin.creator && !m.isCreator, 'creator'],
                [plugin.premium && !m.isPremium, 'premium'],
                [(plugin.group || plugin.admin || plugin.botAdmin) && !m.isGroup, 'group'],
                [plugin.admin && !isAdmin && !m.isOwner, 'admin'],
                [plugin.botAdmin && !isBotAdmin, 'botAdmin']
            ].find(([cond]) => cond)
            if (denied) return await RaplyGwe(config.accessDenied[denied[1]])
            if (!viaCustom && m.isGroup && !m.isOwner && !isAdmin && getGroupSettings(m.chat).adminOnly) {
                return await RaplyGwe('🚫 Fitur hanya untuk admin grup!')
            }
            const mentioned = m.msg?.contextInfo?.mentionedJid || []
            const targets = mentioned.length
                ? [...new Set(mentioned.map(norm))]
                : m.quoted?.sender
                    ? [norm(m.quoted.sender)]
                    : [...new Set(args.map(v => v.replace(/[^0-9]/g, '')).filter(v => /^\d{5,16}$/.test(v)).map(v => `${v}@s.whatsapp.net`))]
            const ts = m.messageTimestamp
            const sec = typeof ts === 'object' && ts ? Number(ts.toNumber?.() ?? ts.low ?? 0) : Number(ts || 0)
            try {
                await plugin(m, {
                    conn,
                    args,
                    text: viaCustom ? m.text : args.join(' '),
                    command,
                    prefix,
                    usedPrefix: prefix || prefixes[0],
                    RaplyGwe,
                    groupMetadata,
                    participants,
                    isAdmin,
                    isBotAdmin,
                    isOwner: m.isOwner,
                    isCreator: m.isCreator,
                    isPremium: m.isPremium,
                    botJids: [conn.user?.id, conn.user?.lid, conn.user?.jid].filter(Boolean).map(norm),
                    targets,
                    isOld: !!sec && Math.floor(Date.now() / 1000) - sec > 60
                })
            } finally {
                if (mutating) metaCache.delete(m.chat)
            }
        } catch (e) {
            console.error(chalk.red(`Error ${(m.text || '').trim().split(/\s+/)[0] || 'command'}: ${e?.message || e}`))
        }
        return
    }
    if (event === 'participants') {
        const { id, participants = [], action } = data
        metaCache.delete(id)
        const chat = getGroupSettings(id)
        const creators = (config.creator || []).map(v => String(v).replace(/[^0-9]/g, ''))
        const toPn = async (user) => {
            let jid = norm(user?.phoneNumber || user?.id || user)
            if (jid.endsWith('@lid')) {
                try {
                    const pn = await conn.signalRepository?.lidMapping?.getPNForLID(jid)
                    if (pn) jid = norm(pn)
                } catch {}
            }
            return jid
        }
        if (action === 'demote' && chat.antiunadmin) {
            await guardUnadmin(conn, data, toPn).catch(e => console.error(chalk.red(`Anti Unadmin error: ${e?.message || e}`)))
        }
        if (action === 'add' || action === 'remove') {
            const metadata = chat.welcome ? await conn.groupMetadata(id).catch(() => null) : null
            const isAdd = action === 'add'
            for (const user of participants) {
                const jid = await toPn(user)
                const number = jid.split('@')[0]
                if (isBlacklisted(jid) && !creators.includes(number)) {
                    if (isAdd) {
                        console.log(chalk.red(`[BLACKLIST] ${number} masuk ${id}, dikeluarkan`))
                        await conn.groupParticipantsUpdate(id, [typeof user === 'string' ? user : user.id || jid], 'remove')
                            .catch(e => console.error(chalk.red(`[BLACKLIST] Gagal kick ${number}:`), e.message))
                    }
                    continue
                }
                if (!metadata) continue
                const subject = metadata.subject || 'Group'
                const member = metadata.participants?.length || 0
                const text = (isAdd
                    ? chat.sWelcome || '*👋 Welcome* @user\n> └ Member ke-@member\n> └ Total Member: @member\n\n```Selamat datang di @subject```'
                    : chat.sBye || `*👋 Goodbye* @user\nTerima kasih sudah menjadi bagian dari @subject\n> └ Sisa Member: @member`)
                    .replace(/@user/g, `@${number}`)
                    .replace(/@subject/g, () => subject)
                    .replace(/@desc/g, () => metadata.desc?.toString() || 'Tidak ada deskripsi grup')
                    .replace(/@member/g, String(member))
                const avatar = (await conn.profilePictureUrl(jid, 'image').catch(() => null)) || 'https://u.pone.rs/iuewjknk.jpg'
                const background = 'https://u.pone.rs/zvvuxlaz.jpg'
                const image = await axios.get(`https://api.siputzx.my.id/api/canvas/${isAdd ? 'welcomev4' : 'goodbyev4'}`, {
                    params: isAdd
                        ? { avatar, background, description: `Welcome to ${subject}!` }
                        : { avatar, background, title: 'goodbye', description: `goodbye to ${subject}!`, border: '#2a2e35', avatarBorder: '#2a2e35', overlayOpacity: 0.3 },
                    responseType: 'arraybuffer',
                    timeout: 30000
                }).then(res => String(res.headers['content-type']).startsWith('image/') ? Buffer.from(res.data) : null).catch(() => null)
                await conn.sendMessage(id, image
                    ? { image, caption: text, mentions: [jid] }
                    : { text, mentions: [jid] }
                ).catch(() => {})
            }
            return
        }
        if ((action === 'promote' || action === 'demote') && chat.detect) {
            for (const user of participants) {
                const jid = await toPn(user)
                const text = (action === 'promote' ? chat.sPromote || '@user sekarang admin' : chat.sDemote || '@user bukan admin lagi')
                    .replace(/@user/g, `@${jid.split('@')[0]}`)
                const msg = generateWAMessageFromContent(id, {
                    extendedTextMessage: proto.Message.ExtendedTextMessage.fromObject({ text, contextInfo: { mentionedJid: [jid] } })
                }, { userJid: conn.user.id })
                await conn.relayMessage(id, msg.message, { messageId: msg.key.id }).catch(() => {})
            }
        }
        return
    }
    if (event === 'groups') {
        for (const group of data || []) {
            if (!group.id) continue
            metaCache.delete(group.id)
            const chat = getGroupSettings(group.id)
            if (!chat.detect) continue
            let text = ''
            if (group.desc) text = (chat.sDesc || '```Description has been changed to```\n@desc').replace('@desc', () => group.desc)
            if (group.subject) text = (chat.sSubject || '```Subject has been changed to```\n@subject').replace('@subject', () => group.subject)
            if (group.icon) text = chat.sIcon || '```Icon has been changed```'
            if (group.revoke) text = (chat.sRevoke || '```Group link has been changed to```\n@revoke').replace('@revoke', () => `https://chat.whatsapp.com/${group.revoke}`)
            if (!text) continue
            await conn.sendMessage(group.id, { text }).catch(() => {})
        }
        return
    }
    if (event === 'revoke') {
        for (const { key, update } of data || []) {
            if (update?.messageStubType !== (proto?.WebMessageInfo?.StubType?.REVOKE ?? 1) || !key?.id) continue
            if (global.confessDelete?.has(key.id)) {
                global.confessDelete.delete(key.id)
                msgCache.delete(key.id)
                continue
            }
            const cached = msgCache.get(key.id)
            if (!cached || cached.key.fromMe) continue
            msgCache.delete(key.id)
            if (!getGroupSettings(cached.chat).delete) continue
            let isi = ''
            try {
                let mm = cached.message || {}
                isi = mm.conversation || mm.extendedTextMessage?.text || mm.imageMessage?.caption || mm.videoMessage?.caption || ''
            } catch {}
            if (String(isi).trim().toLowerCase().startsWith('.confess')) continue
            const sender = norm(cached.sender)
            await conn.sendMessage(cached.chat, {
                text: `Terdeteksi @${sender.split('@')[0]} telah menghapus pesan.\nUntuk mematikan fitur ini ketik *.antidelete off*`,
                mentions: [sender]
            }).catch(() => {})
            await conn.sendMessage(cached.chat, { forward: { key: cached.key, message: cached.message } }).catch(() => {})
        }
    }
}
