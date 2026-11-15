import axios from 'axios'
import config from '../../config.js'

/// ─────────── [ JOKOWI AI - BLACKDOOR ] ────────── ///
let handler = async (m, { conn, text, usedPrefix, command, RaplyGwe }) => {
    if (!text) return RaplyGwe(`🚪 *BLACKDOOR x PAK JOKOWI*\n\nContoh: *${usedPrefix + command}* Pak, gimana kabar Solo?`)

    await conn.sendMessage(m.chat, { react: { text: '🚪', key: m.key } })

    try {
        const { data } = await axios.get('https://api.kyzzz.xyz/api/ai/jokowi', {
            params: {
                message: text,
                session: m.sender.split('@')[0],
                apikey: 'kyzz211554828'
            },
            timeout: 60000
        })

        let reply = data?.result?.reply

        if (!reply) throw new Error('Respon kosong dari API.')

        await conn.sendMessage(m.chat, {
            text: reply,
            contextInfo: {
                forwardingScore: 9,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.saluranId,
                    newsletterName: config.saluranName,
                    serverMessageId: 127
                }
            }
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: '🚪', key: m.key } })

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        await RaplyGwe(`🚪 *BLACKDOOR x JOKOWI GAGAL*\n\n❌ *Gagal:* ${e.response?.data?.message || e.message}\n\nCoba lagi bung, Pak Jokowi nya lagi istirahat.`)
    }
}

handler.command = /^(jokowi|pakjokowi)$/i
handler.tags = ['ai']
handler.help = ['jokowi <pertanyaan>']

export default handler
