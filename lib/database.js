import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import config from '../config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../database')

const read = (file, def) => {
  try { return JSON.parse(fs.readFileSync(path.join(dbPath, file), 'utf8')) } catch { return def }
}
const write = (file, data) => {
  if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true })
  fs.writeFileSync(path.join(dbPath, file), JSON.stringify(data, null, 2))
}

// Default setting grup - kalo grup baru, pake ini
const defaultGroup = {
  welcome: true,
  detect: true,
  delete: true,
  antitagsw: false,
  antiswgc: false,
  antibot: false,
  antibotKick: false,
  antijudol: true,
  antijudolKick: false,
  antispam: true,
  antispamKick: false,
  antivirtex: true,
  antivirtexKick: false,
  antiunadmin: true,
  adminOnly: false,
  sWelcome: '',
  sBye: '',
  sPromote: '',
  sDemote: '',
  sDesc: '',
  sSubject: '',
  sIcon: '',
  sRevoke: ''
}

export function getGroupSettings(id) {
  const groups = read('group.json', {})
  if (!groups[id]) {
    groups[id] = { ...defaultGroup }
    write('group.json', groups)
  }
  return groups[id]
}

export function updateGroupSettings(id, update) {
  const groups = read('group.json', {})
  groups[id] = { ...defaultGroup, ...(groups[id] || {}), ...update }
  write('group.json', groups)
  return groups[id]
}

export function isBlacklisted(jid) {
  const list = read('blacklist.json', [])
  const num = String(jid).split('@')[0].replace(/[^0-9]/g, '')
  return list.some(v => String(v).split('@')[0].replace(/[^0-9]/g, '') === num)
}

export function isBlacklistedGc(id) {
  const list = read('blacklistgc.json', [])
  return list.includes(id)
}

export function getOwner() {
  return read('owner.json', ['6285393659857@s.whatsapp.net'])
}

export function getPremium() {
  return read('premium.json', [])
}

export function restoreBotMode() {
  try {
    const settings = read('settings.json', {})
    if (settings.botMode) config.botMode = settings.botMode
  } catch {}
}

export function setBotMode(mode) {
  const settings = read('settings.json', {})
  settings.botMode = mode
  config.botMode = mode
  write('settings.json', settings)
}
