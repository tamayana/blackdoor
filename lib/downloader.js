import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP = path.join(__dirname, '../tmp/scrape')
const REGISTRY = 'https://registry.npmjs.org'

/// ─────────── [ 𝖠𝗆𝖻𝗂𝗅 𝖬𝖾𝗍𝖺𝖽𝖺𝗍𝖺 𝖯𝖺𝗄𝖾𝗍 𝗇𝗉𝗆 - BLACKDOOR ] ────────── ///
export async function getPackage(pkg) {
    const res = await axios.get(`${REGISTRY}/${encodeURIComponent(pkg).replace('%40', '@')}`, { timeout: 30000 })
    const latest = res.data?.['dist-tags']?.latest
    const meta = res.data?.versions?.[latest]
    if (!meta?.dist?.tarball) throw new Error('Tarball paket tidak ditemukan')
    return { name: res.data.name, version: latest, description: res.data.description || '-', tarball: meta.dist.tarball }
}

/// ─────────── [ 𝖣𝗈𝗐𝗇𝗅𝗈𝖺𝖽 𝖳𝖺𝗋𝖻𝖺𝗅𝗅 (.𝗍𝗀𝗓) 𝗄𝖾 𝖡𝗎𝖿𝖿𝖾𝗋 - BLACKDOOR ] ────────── ///
export async function download(url) {
    if (!url) throw new Error('Tarball URL is required')
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 120000, headers: { 'User-Agent': 'Blackdoor/1.0 (Tama-ID)' } })
    return Buffer.from(res.data)
}

/// ─────────── [ 𝖣𝗈𝗐𝗇𝗅𝗈𝖺𝖽 + 𝖤𝗄𝗌𝗍𝗋𝖺𝗄 𝗄𝖾 𝖥𝗈𝗅𝖽𝖾𝗋 - BLACKDOOR ] ────────── ///
export async function extract(url, pkg) {
    const tar = await import('tar')
    const safe = pkg.replace(/[\/@]/g, '_')
    const outDir = path.join(TMP, safe)
    const tgz = path.join(TMP, `${safe}.tgz`)

    await fs.promises.mkdir(TMP, { recursive: true })
    await fs.promises.rm(outDir, { recursive: true, force: true })
    await fs.promises.writeFile(tgz, await download(url))
    await fs.promises.mkdir(outDir, { recursive: true })
    await tar.x({ file: tgz, cwd: outDir, strip: 1 })
    await fs.promises.unlink(tgz).catch(() => {})
    return outDir
}

export default { getPackage, download, extract }
