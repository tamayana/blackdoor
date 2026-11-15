import readline from 'readline'
import fs from 'fs'
import os from 'os'
import { execSync } from 'child_process'
import pino from 'pino'
import chalk from 'chalk'
import axios from 'axios'
import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    jidDecode,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    downloadContentFromMessage
} from '@adiwajshing/baileys'

import { smsg } from './lib/myfunc.js'
import config from './config.js'
import { restoreBotMode } from './lib/database.js'
import handler, { initPlugins } from './handler.js'
import { attachHelpers } from './lib/sock.js'

restoreBotMode()

// === PENYIMPANAN FOTO SEKALI LIAT - BIAR BISA .tourl WALAU UDAH DIBUKA! ===
global.viewOnceCache = global.viewOnceCache || new Map()

const usePairingCode = true
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise(resolve => rl.question(text, resolve))

/// ─────────── [ Palette & Logger ] ────────── ///
const palette = {
    accent: chalk.hex('#A78BFA'),
    text:   chalk.hex('#F3F4F6'),
    label:  chalk.hex('#9CA3AF'),
    muted:  chalk.hex('#6B7280'),
    ok:     chalk.hex('#34D399'),
    warn:   chalk.hex('#FBBF24'),
    err:    chalk.hex('#F87171'),
    info:   chalk.hex('#60A5FA')
}

const cWhite = chalk.white

const makeTag = (label, strong = false, color = palette.accent) =>
    strong ? color.inverse.bold(` ${label} `) : color.bold(`[${label}]`)

const timeStamp = () =>
    palette.muted(new Date().toLocaleTimeString('id-ID', { hour12: false }))

const say = (text = '') =>
    console.log(String(text).split('\n').map(l => l.trim() === '' ? '\u00A0' : l).join('\n'))

const emit = (level, color, message, error) => {
    const out = level === 'ERROR' ? console.error : console.log
    out(`${timeStamp()} ${makeTag(level.padEnd(6, ' '), false, color)} ${cWhite(message)}`)
    if (error) out(`${' '.repeat(8)} ${palette.muted('└▪')} ${palette.muted(error?.message || String(error))}`)
}

const log = {
    info:  (message)        => emit('INFO',  palette.info, message),
    ok:    (message)        => emit('OK',    palette.ok,   message),
    warn:  (message, error) => emit('WARN',  palette.warn, message, error),
    error: (message, error) => emit('ERROR', palette.err,  message, error)
}

/// ─────────── [ Helpers ] ────────── ///
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const formatBytes = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

const formatUptime = (seconds) => {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(' ')
}

const detectVps = async () => {
    try {
        let provider = 'Local', status = 'Unknown'
        try {
            const virt = execSync('systemd-detect-virt', { encoding: 'utf8', timeout: 1500 }).trim()
            if (virt && virt !== 'none') {
                provider = virt.charAt(0).toUpperCase() + virt.slice(1)
                status = 'Legal'
            } else {
                provider = 'Baremetal'
                status = 'Legal'
            }
        } catch {
            try {
                const productName = fs.readFileSync('/sys/class/dmi/id/product_name', 'utf8').trim()
                if (productName) { provider = productName; status = 'Legal' }
            } catch {}
        }
        return { status, provider }
    } catch {
        return { status: 'Unknown', provider: 'Local' }
    }
}

/// ─────────── [ Banner & System Info ] ────────── ///
const showBanner = async () => {
    const totalMem = os.totalmem()
    const usedMem = totalMem - os.freemem()
    
    let vpsInfo = { status: 'Unknown', provider: 'Local' }
    try { vpsInfo = await detectVps() } catch {}

    const vpsLabel = vpsInfo.status === 'Legal' ? palette.ok(vpsInfo.status) 
        : vpsInfo.status === 'Ilegal' ? palette.err(vpsInfo.status) : palette.warn(vpsInfo.status)

    say(palette.accent(`
██████╗ ██╗      █████╗  ██████╗██╗  ██╗██████╗  ██████╗  ██████╗ ██████╗ 
██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔═══██╗██╔═══██╗██╔══██╗
██████╔╝██║     ███████║██║     █████╔╝ ██║  ██║██║   ██║██║   ██║██████╔╝
██╔══██╗██║     ██╔══██║██║     ██╔═██╗ ██║  ██║██║   ██║██║   ██║██╔══██╗
██████╔╝███████╗██║  ██║╚██████╗██║  ██╗██████╔╝╚██████╔╝╚██████╔╝██║  ██║
╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
`))
say(`${palette.muted('›')} ${chalk.bold(palette.text('BLACKDOOR MULTI-DEVICE BOT'))} ${palette.muted('v1.0')} ${palette.muted('by Tama-ID')}\n`)

    const rows = [
        ['Node Version', process.version],
        ['Platform',     `${os.platform()} ${os.arch()}`],
        ['VPS Status',   `${vpsLabel} ${palette.muted(`(${vpsInfo.provider})`)}`],
        ['Host / Panel', os.hostname() || 'unknown'],
        ['Panel RAM',    `${formatBytes(usedMem)} / ${formatBytes(totalMem)}`],
        ['Uptime',       formatUptime(os.uptime())]
    ]

    say(`${makeTag('INFO', true, palette.accent)} ${cWhite.bold('SYSTEM INFORMATION')}`)
    for (const [label, value] of rows) {
        say(`${palette.muted('•')} ${palette.label(label.padEnd(13, ' '))}${palette.muted(':')} ${palette.text(value)}`)
    }
    say('')
}
    
/// ─────────── [ Connection ] ────────── ///
const store = { bind: () => {} }
let pluginsLoaded = false

async function connectToWhatsApp() {
    await showBanner()
    const { state, saveCreds } = await useMultiFileAuthState('./session')
    
    let version
    try {
        ({ version } = await fetchLatestBaileysVersion())
    } catch {
        log.warn('Gagal mengambil versi WhatsApp, memakai versi bawaan library.')
    }
    
    const sock = makeWASocket({
        ...(version ? { version } : {}),
        printQRInTerminal: !usePairingCode,
        browser: ['Blackdoor', 'Chrome', '1.0.0'],
        logger: pino({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        }
    })

    sock.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {}
            return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid
        }
        return jid
    }

    attachHelpers(sock)
    sock.ev.on('creds.update', saveCreds)
    store.bind(sock.ev)

    if (!sock.authState.creds.registered && !sock.authState.creds.me && usePairingCode) {
        say(`\n  ${makeTag('INPUT', true, palette.accent)} ${cWhite('Masukkan nomor WhatsApp:')}`)
        const phoneNumber = await question(`  ${palette.accent('└╼ Nomor : ')}`)
        
        await new Promise(r => setTimeout(r, 3000))
        const code = await sock.requestPairingCode(phoneNumber.trim().replace(/[^0-9]/g, ''), 'TAMAYANA')

        say(`\n\n${makeTag('PAIR', true, palette.ok)} ${cWhite('Pairing Code')} ${palette.muted('›')} ${palette.warn.bold(code)}`)
        say(`${palette.muted('Buka WhatsApp > Perangkat Tertaut > Tautkan dengan nomor telepon.')}\n`)
        rl.close()
    }

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return
        for (const mek of messages) {
            try {
                if (!mek?.message || mek.key.remoteJid === 'status@broadcast') continue
                if (mek.key.fromMe && mek.key.id?.startsWith('BAE5') && mek.key.id.length === 16) continue

                // === SIMPEN FOTO SEKALI LIAT PAS BARU DATENG! ===
                try {
                    let msgContent = mek.message || {}
                    let inner = msgContent.viewOnceMessageV2?.message || msgContent.viewOnceMessage?.message || msgContent.ephemeralMessage?.message?.viewOnceMessageV2?.message || msgContent.ephemeralMessage?.message?.viewOnceMessage?.message || null
                    if (inner) {
                        let type = Object.keys(inner)[0]
                        let content = inner[type]
                        if (content?.mediaKey) {
                            let mediaType = type.includes('image') ? 'image' : type.includes('video') ? 'video' : 'image'
                            let stream = await downloadContentFromMessage(content, mediaType)
                            let chunks = []
                            for await (let c of stream) chunks.push(c)
                            let buf = Buffer.concat(chunks)
                            global.viewOnceCache.set(mek.key.id, {
                                buffer: buf,
                                mimetype: content.mimetype || (mediaType === 'image' ? 'image/jpeg' : 'video/mp4')
                            })
                            console.log(`✅ ViewOnce tersimpan: ${mek.key.id} | ${buf.length} bytes`)
                            setTimeout(() => global.viewOnceCache.delete(mek.key.id), 60 * 60 * 1000)
                        }
                    }
                } catch (e) { console.log('Gagal simpan viewOnce:', e.message) }

                const m = smsg(sock, mek, store)
                if (m) await handler(sock, 'message', m)
            } catch (e) {
                log.error('Gagal memproses pesan', e)
            }
        }
    })

    sock.ev.on('group-participants.update', (update) => handler(sock, 'participants', update).catch(e => log.error('Group Participant Error', e)))
    sock.ev.on('groups.update', (updates) => handler(sock, 'groups', updates).catch(e => log.error('Group Update Error', e)))

    sock.ev.on('messages.update', (updates) => handler(sock, 'revoke', updates).catch(e => log.error('Anti Delete Error', e)))

    sock.public = config.botMode === 'public'

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
        if (connection === 'connecting') return

        if (connection === 'open') {
            let total = 0
            if (!pluginsLoaded) {
                total = await initPlugins()
                pluginsLoaded = true
            }

            console.clear()
            await showBanner()

            say(`\n${makeTag('BOT', true, palette.ok)} ${cWhite.bold('BLACKDOOR ONLINE')}`)
            say(`${palette.muted('└▪')} ${palette.label('User  ')}${palette.muted(':')} ${palette.text(sock.user?.id || '-')}`)
            say(`${palette.muted('└▪')} ${palette.label('Mode  ')}${palette.muted(':')} ${palette.info(config.botMode.toUpperCase())}`)
            say('')
            return
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode

            if (statusCode === DisconnectReason.loggedOut) {
                log.warn('Sesi logout terdeteksi, menghapus session & pairing ulang...')
                fs.rmSync('./session', { recursive: true, force: true })
                return connectToWhatsApp()
            }

            log.warn(`Koneksi terputus (code: ${statusCode || 'unknown'}), menyambung ulang...`)
            setTimeout(connectToWhatsApp, 1000)
        }
    })
}

connectToWhatsApp()
