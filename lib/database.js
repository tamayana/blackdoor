import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import config from '../config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbDir = path.join(__dirname, '../database')
const groupPath = path.join(dbDir, 'group.json')

let groupDB = null

/// ─────────── [ 𝖬𝗎𝖺𝗍 𝖣𝖺𝗍𝖺𝖻𝖺𝗌𝖾 𝖦𝗋𝗎𝗉 - BLACKDOOR ] ────────── ///
function loadGroupDB() {
    if (groupDB) return groupDB
    try {
        groupDB = JSON.parse(fs.readFileSync(groupPath, 'utf8'))
    } catch {
        groupDB = {}
    }
    if (!groupDB || typeof groupDB !== 'object' || Array.isArray(groupDB)) groupDB = {}
    return groupDB
}

/// ─────────── [ 𝖲𝗂𝗆𝗉𝖺𝗇 𝖣𝖺𝗍𝖺𝖻𝖺𝗌𝖾 𝖦𝗋𝗎𝗉 - BLACKDOOR ] ────────── ///
function saveGroupDB() {
    fs.mkdirSync(dbDir, { recursive: true })
    const tmp = `${groupPath}.tmp`
    fs.writeFileSync(tmp, JSON.stringify(groupDB, null, 2))
    fs.renameSync(tmp, groupPath)
}

export const GROUP_DEFAULTS = {
    antilink: false,
    antitagsw: false,
    welcome: false,
    detect: false,
    adminOnly: false,
    delete: false
}

export const getGroupSettings = (jid) => ({ ...GROUP_DEFAULTS, ...(loadGroupDB()[jid] || {}) })

export function setGroupSetting(jid, key, value) {
    const db = loadGroupDB()
    db[jid] = { ...(db[jid] || {}), [key]: value }
    saveGroupDB()
    return db[jid]
}

const settingsPath = path.join(dbDir, 'settings.json')

/// ─────────── [ 𝖬𝗎𝖺𝗍 𝖬𝗈𝖽𝖾 𝖡𝗈𝗍 - BLACKDOOR ] ────────── ///
export function restoreBotMode() {
    try {
        if (!fs.existsSync(settingsPath)) return
        const saved = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
        if (saved.botMode === 'public' || saved.botMode === 'self') config.botMode = saved.botMode
    } catch { /* noop */ }
}

/// ─────────── [ 𝖲𝗂𝗆𝗉𝖺𝗇 𝖬𝗈𝖽𝖾 𝖡𝗈𝗍 - BLACKDOOR ] ────────── ///
export function setBotMode(mode) {
    config.botMode = mode
    try {
        fs.mkdirSync(dbDir, { recursive: true })
        fs.writeFileSync(settingsPath, JSON.stringify({ botMode: mode }, null, 2))
    } catch { /* noop */ }
}

const blacklistPath = path.join(dbDir, 'blacklist.json')
let blacklistDB = null

const numOf = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '')

function loadBlacklist() {
    if (blacklistDB) return blacklistDB
    try {
        blacklistDB = JSON.parse(fs.readFileSync(blacklistPath, 'utf8'))
    } catch {
        blacklistDB = []
    }
    if (!Array.isArray(blacklistDB)) blacklistDB = []
    return blacklistDB
}

function saveBlacklist() {
    fs.mkdirSync(dbDir, { recursive: true })
    const tmp = `${blacklistPath}.tmp`
    fs.writeFileSync(tmp, JSON.stringify(blacklistDB, null, 2))
    fs.renameSync(tmp, blacklistPath)
}

export const getBlacklist = () => [...loadBlacklist()]
export const isBlacklisted = (jid) => loadBlacklist().includes(numOf(jid))

export function addBlacklist(jid) {
    const number = numOf(jid)
    const db = loadBlacklist()
    if (!number || db.includes(number)) return false
    db.push(number)
    saveBlacklist()
    return true
}

export function delBlacklist(jid) {
    const number = numOf(jid)
    const db = loadBlacklist()
    if (!db.includes(number)) return false
    db.splice(db.indexOf(number), 1)
    saveBlacklist()
    return true
}
