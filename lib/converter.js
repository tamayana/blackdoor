import fs from 'fs'
import crypto from 'crypto'
import webp from 'node-webpmux'
import path from 'path'
import { spawn, spawnSync } from 'child_process'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const tmpDir = path.join(__dirname, '../tmp')

/// ─────────── [ 𝖢𝖺𝗋𝗂 𝖡𝗂𝗇𝖺𝗋𝗒 𝖿𝖿𝗆𝗉𝖾𝗀 - BLACKDOOR ] ────────── ///
let ffmpegBin = null
export function getFfmpegPath() {
    if (ffmpegBin) return ffmpegBin

    const system = spawnSync('ffmpeg', ['-version'])
    if (!system.error && system.status === 0) return (ffmpegBin = 'ffmpeg')

    try {
        const installer = require('@ffmpeg-installer/ffmpeg')
        if (installer?.path && fs.existsSync(installer.path)) return (ffmpegBin = installer.path)
    } catch { /* noop */ }

    return (ffmpegBin = 'ffmpeg')
}

export function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
    return new Promise(async (resolve, reject) => {
        const id = `blackdoor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        const tmp = path.join(tmpDir, `${id}.${ext || 'bin'}`)
        const out = `${tmp}.${ext2}`
        const clean = () => Promise.all([tmp, out].map(f => fs.promises.unlink(f).catch(() => {})))

        try {
            fs.mkdirSync(tmpDir, { recursive: true })
            await fs.promises.writeFile(tmp, buffer)

            let stderr = ''
            const proc = spawn(getFfmpegPath(), ['-y', '-i', tmp, ...args, out])
            proc.stderr.on('data', d => { stderr = (stderr + d).slice(-2000) })
            proc.on('error', async (e) => { await clean(); reject(e) })
            proc.on('close', async (code) => {
                try {
                    if (code !== 0) throw new Error(`ffmpeg exit ${code}: ${stderr.split('\n').slice(-4).join(' ').trim()}`)
                    const data = await fs.promises.readFile(out)
                    await clean()
                    resolve(data)
                } catch (e) {
                    await clean()
                    reject(e)
                }
            })
        } catch (e) {
            await clean()
            reject(e)
        }
    })
}

export function toAudio(buffer, ext) {
    return ffmpeg(buffer, ['-vn', '-ac', '2', '-b:a', '128k', '-ar', '44100', '-f', 'mp3'], ext, 'mp3')
}

export function toPTT(buffer, ext) {
    return ffmpeg(buffer, ['-vn', '-c:a', 'libopus', '-b:a', '64k', '-vbr', 'on', '-ar', '48000', '-ac', '1', '-f', 'ogg'], ext, 'ogg')
}

export function toVideo(buffer, ext) {
    return ffmpeg(buffer, ['-c:v', 'libx264', '-c:a', 'aac', '-ab', '128k', '-ar', '44100', '-crf', '32', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'], ext, 'mp4')
}

/// ─────────── [ 𝖳𝗎𝗅𝗂𝗌 𝖬𝖾𝗍𝖺𝖽𝖺𝗍𝖺 𝖲𝗍𝗂𝗄𝖾𝗋 - BLACKDOOR ] ────────── ///
export async function addExif(webpBuffer, { packname = 'Blackdoor', author = 'Tama-ID', emojis = ['🚪'], extra = {} } = {}) {
    const img = new webp.Image()
    const json = {
        'sticker-pack-id': crypto.randomBytes(16).toString('hex'),
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        'android-app-store-link': 'https://play.google.com/store/apps/details?id=com.whatsapp',
        'ios-app-store-link': 'https://apps.apple.com/app/whatsapp-messenger/id310633997',
        emojis,
        ...extra
    }
    const exifAttr = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
    const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8')
    const exif = Buffer.concat([exifAttr, jsonBuff])
    exif.writeUIntLE(jsonBuff.length, 14, 4)

    await img.load(webpBuffer)
    img.exif = exif
    return await img.save(null)
}

const SCALE = 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1'

/// ─────────── [ 𝖦𝖺𝗆𝖻𝖺𝗋 → 𝖶𝖾𝖻𝖯 𝖲𝗍𝗂𝗄𝖾𝗋 - BLACKDOOR ] ────────── ///
export const imageToWebp = (buffer, ext = 'jpg') =>
    ffmpeg(buffer, ['-vf', SCALE, '-vcodec', 'libwebp', '-lossless', '0', '-q:v', '70', '-compression_level', '6'], ext, 'webp')

/// ─────────── [ 𝖵𝗂𝖽𝖾𝗈 / 𝖦𝖨𝖥 → 𝖠𝗇𝗂𝗆𝖺𝗍𝖾𝖽 𝖶𝖾𝖻𝖯 - BLACKDOOR (𝗆𝖺𝗄𝗌 𝟨 𝖽𝖾𝗍𝗂𝗄) ] ────────── ///
export const videoToWebp = (buffer, ext = 'mp4') =>
    ffmpeg(buffer, ['-t', '6', '-vf', `fps=15,${SCALE}`, '-an', '-vcodec', 'libwebp', '-lossless', '0', '-q:v', '55', '-compression_level', '6', '-loop', '0', '-preset', 'default', '-vsync', '0'], ext, 'webp')

export const isWebp = (b) => b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP'

const extFromMime = (mime = '') => {
    const m = mime.split(';')[0].split('/')[1] || ''
    return { jpeg: 'jpg', quicktime: 'mov', 'x-matroska': 'mkv' }[m] || m || 'bin'
}

/// ─────────── [ 𝖲𝗍𝗂𝗄𝖾𝗋 - BLACKDOOR (𝖺𝗎𝗍𝗈 𝖽𝖾𝗍𝖾𝗄𝗌𝗂 𝗀𝖺𝗆𝖻𝖺𝗋 / 𝗏𝗂𝖽𝖾𝗈 / 𝗐𝖾𝖻𝗉) ] ────────── ///
export async function createSticker(buffer, { mime = '', packname = 'Blackdoor', author = 'Tama-ID' } = {}) {
    let webpBuffer
    if (isWebp(buffer)) webpBuffer = buffer
    else if (/video|gif/i.test(mime)) webpBuffer = await videoToWebp(buffer, extFromMime(mime))
    else webpBuffer = await imageToWebp(buffer, extFromMime(mime))

    try {
        return await addExif(webpBuffer, { packname, author })
    } catch {
        return webpBuffer
    }
}
