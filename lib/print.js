import { WAMessageStubType } from '@adiwajshing/baileys'
import chalk from 'chalk'
import config from '../config.js'

/// ─────────── [ Helper Log - BLACKDOOR ] ────────── ///
const subjectCache = new Map()

const formatBytes = (bytes = 0) => {
  if (!bytes || isNaN(bytes)) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

const getTime = (timestamp) => {
  const sec = typeof timestamp === 'object' && timestamp
    ? Number(timestamp.toNumber?.() ?? timestamp.low ?? 0)
    : Number(timestamp || 0)
  return new Date(sec ? sec * 1000 : Date.now()).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
}

const normJid = (jid) => (typeof jid === 'string' ? jid.replace(/:\d+@/, '@') : '')
const toNumber = (jid) => '+' + String(jid || '').split('@')[0].split(':')[0]

const nameOf = (conn, m, jid) => {
  const id = normJid(jid)
  if (id && id === normJid(m.sender)) return m.pushName || ''
  if ([conn.user?.id, conn.user?.lid].some(v => v && normJid(v) === id)) return conn.user?.name || ''
  return ''
}

const groupSubject = async (conn, jid) => {
  if (subjectCache.has(jid)) return subjectCache.get(jid)
  const meta = await conn.groupMetadata(jid).catch(() => null)
  const subject = meta?.subject || jid
  subjectCache.set(jid, subject)
  return subject
}

/// ─────────── [ Print Log Pesan - BLACKDOOR UNGU HITAM ] ────────── ///
export default async function print(m, conn = { user: {} }) {
  try {
    const name = nameOf(conn, m, m.sender)
    const sender = toNumber(m.sender) + (name ? ` ~ ${name}` : '')

    const chatName = m.isGroup ? await groupSubject(conn, m.chat) : (m.pushName || '')
    const botNumber = toNumber(conn.user?.id || conn.user?.jid)
    const botName = conn.user?.name || 'BLACKDOOR'

    const filesize =
      m.msg?.fileLength?.low ||
      m.msg?.fileLength ||
      m.msg?.vcard?.length ||
      m.msg?.axolotlSenderKeyDistributionMessage?.length ||
      m.text?.length ||
      0

    const time = getTime(m.messageTimestamp)
    const role = m.isCreator ? 'Creator' : m.isOwner ? 'Owner' : m.isPremium ? 'Premium' : 'User'

    const type = m.mtype
      ? m.mtype
          .replace(/message$/i, '')
          .replace('audio', m.msg?.ptt ? '🎙️ PTT' : '🎵 Audio')
          .replace(/^./, v => v.toUpperCase())
      : '-'

    const stub = m.messageStubType ? WAMessageStubType[m.messageStubType] : '-'

    console.log(
      chalk.hex('#8B00FF')('╭───────────── [ BLACKDOOR LOG ] ─────────────'),
      '\n' + chalk.hex('#BF00FF')('│ 🚪 Waktu: ') + chalk.white(time),
      '\n' + chalk.hex('#8B00FF')('│ 💬 Room Chat: ') + chalk.white(`${chatName || m.chat}`),
      '\n' + chalk.hex('#A855F7')('│ 👤 From: ') + chalk.white(sender),
      '\n' + chalk.hex('#7C3AED')('│ 🎴 Type Msg: ') + chalk.white(type),
      '\n' + chalk.hex('#4B0082')('│ 🪄 Event: ') + chalk.white(stub),
      '\n' + chalk.hex('#BF00FF')('│ 🎒 Size: ') + chalk.white(formatBytes(filesize)),
      '\n' + chalk.hex('#8B00FF')('╰────────────────────────────────────────')
    )

    if (typeof m.text === 'string' && m.text) {
      let log = m.text.replace(/\u200e+/g, '')

      const mentioned = m.msg?.contextInfo?.mentionedJid || []
      for (const jid of mentioned) {
        const tag = '@' + jid.split('@')[0]
        log = log.replace(tag, chalk.hex('#BF00FF')('@' + (nameOf(conn, m, jid) || jid.split('@')[0])))
      }

      const isCommand = (config.prefix || ['.']).some(p => m.text.startsWith(p))
      if (m.error) console.log(chalk.hex('#FF00FF')('💥 Error Blackdoor: ' + log))
      else if (isCommand) console.log(chalk.hex('#8B00FF')('⚡ Command: ' + log))
      else console.log(chalk.white('🚪 Chat: ' + log))
    }

    if (/document/i.test(m.mtype)) {
      console.log(chalk.hex('#8B00FF')('📄 Document:'), m.msg?.fileName || m.msg?.displayName || '-')
    } else if (/contact/i.test(m.mtype)) {
      console.log(chalk.hex('#A855F7')('👤 Contact:'), m.msg?.displayName || '-')
    } else if (/audio/i.test(m.mtype)) {
      const duration = m.msg?.seconds || 0
      console.log(
        chalk.hex('#BF00FF')(
          `🎧 Audio Time: ${String(Math.floor(duration / 60)).padStart(2, '0')}:${String(duration % 60).padStart(2, '0')}`
        )
      )
    }

    console.log()
  } catch (e) {
    console.error(chalk.hex('#FF00FF')('💀 Blackdoor Logger Crash:'), e)
  }
}
