import chalk from 'chalk'

// ─────────── [ BLACKDOOR - UNGU KEHITAMAN ] ─────────── //
const PURPLE = '#8B00FF' // ungu utama Blackdoor
const DARK_PURPLE = '#4B0082' // ungu gelap
const NEON_PURPLE = '#BF00FF' // ungu neon
const BLACK = '#0A0A0A' // hitam pekat

export const color = (text, color) => {
    // kalo gak dikasih warna, default ungu Blackdoor, bukan ijo lagi
    return !color ? chalk.hex(PURPLE)(text) : chalk.keyword(color)(text)
}

export const bgcolor = (text, bgcolor) => {
    // default background hitam + tulisan ungu neon
    return !bgcolor ? chalk.bgHex(BLACK).hex(NEON_PURPLE)(text) : chalk.bgKeyword(bgcolor)(text)
}

export const Lognyong = (text, color) => {
    return !color
        ? chalk.hex(DARK_PURPLE)('[ BLACKDOOR ] ') + chalk.hex(PURPLE)(text)
        : chalk.hex(DARK_PURPLE)('=> ') + chalk.keyword(color)(text)
}

// Alias Blackdoor
export const LogBlackdoor = Lognyong
export const logBlackdoor = Lognyong

// Tambahan khusus Blackdoor - biar log nya sangar
export const logSuccess = (text) => chalk.hex(NEON_PURPLE)('[ ✓ ] ') + chalk.white(text)
export const logError = (text) => chalk.bgHex('#1A0033').hex('#FF00FF')('[ ✗ ] ') + chalk.hex('#FF00FF')(text)
export const logInfo = (text) => chalk.hex(DARK_PURPLE)('[ BLACKDOOR ] ') + chalk.hex(PURPLE)(text)
export const logDoor = (text) => chalk.bgHex(BLACK).hex(NEON_PURPLE)(` 🚪 ${text} `)
