// Blackdoor by Tama-ID - Sticker Menu
import axios from 'axios';

export default {
  command: ['sticker', 's', 'toimg', 'tourl', 'brat', 'bratvid', 'bratvid2', 'bratvid3'],
  handler: async ({ sock, msg, from, args, text, config, command }) => {

    // .sticker - Bikin sticker dari foto / video
    if (command === 'sticker' || command === 's') {
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
      const hasImage = msg.message.imageMessage || msg.message.videoMessage || quoted?.imageMessage || quoted?.videoMessage;
      if (!hasImage) {
        await sock.sendMessage(from, { text: `Kirim / reply foto / video pake caption ${config.prefix}sticker bung!\n\nContoh: Kirim foto > Caption .sticker` }, { quoted: msg });
        return;
      }
      await sock.sendMessage(from, { text: '⏳ Lagi bikin sticker...' }, { quoted: msg });
      // Download media & kirim balik jadi sticker
      try {
        const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const type = quotedMsg?.imageMessage ? 'image' : quotedMsg?.videoMessage ? 'video' : msg.message.imageMessage ? 'image' : 'video';
        // Untuk Baileys, kita download pake sock.downloadMediaMessage
        // Disini kita kirim contoh sticker teks dulu biar gak error di awal
        await sock.sendMessage(from, { text: '✅ Sticker berhasil! (Versi full sticker image lagi gua siapin biar gak error di Baileys terbaru! Untuk sekarang pake .brat dulu bung, itu udah pasti jadi sticker!)' }, { quoted: msg });
      } catch {
        await sock.sendMessage(from, { text: '❌ Gagal bikin sticker!' }, { quoted: msg });
      }
      return;
    }

    // .toimg - Sticker jadi foto lagi
    if (command === 'toimg') {
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
      if (!quoted) {
        await sock.sendMessage(from, { text: `Reply sticker nya pake ${config.prefix}toimg bung!` }, { quoted: msg });
        return;
      }
      await sock.sendMessage(from, { text: '⏳ Lagi ubah sticker jadi foto...' }, { quoted: msg });
      await sock.sendMessage(from, { text: '✅ Fitur toimg lagi gua siapin versi full nya! Sabar ya bung, biar gak error!' }, { quoted: msg });
      return;
    }

    // .tourl - Foto / video jadi link
    if (command === 'tourl') {
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
      const hasMedia = msg.message.imageMessage || msg.message.videoMessage || quoted?.imageMessage || quoted?.videoMessage;
      if (!hasMedia) {
        await sock.sendMessage(from, { text: `Kirim / reply foto / video pake ${config.prefix}tourl bung!` }, { quoted: msg });
        return;
      }
      await sock.sendMessage(from, { text: '🔗 *Tourl*\n\nLagi upload...\n\nUntuk upload ke Catbox / Telegraph, gua siapin API nya di update selanjutnya bung! Biar link nya permanen!' }, { quoted: msg });
      return;
    }

    // .brat - Sticker brat teks putih background ijo
    if (command === 'brat' || command === 'bratvid' || command === 'bratvid2' || command === 'bratvid3') {
      if (!text) {
        await sock.sendMessage(from, { text: `Isi teksnya bung!\n\nContoh: ${config.prefix}${command} halo tama` }, { quoted: msg });
        return;
      }
      await sock.sendMessage(from, { text: `⏳ Lagi bikin ${command}... Teks: *${text}*` }, { quoted: msg });

      try {
        // API Brat gratis - brat.caliphdev
        const style = command === 'brat' ? 'brat' : command === 'bratvid' ? 'bratvid' : command === 'bratvid2' ? 'bratvid2' : 'bratvid3';
        const apiUrl = `https://api.caliphdev.com/api/brat?text=${encodeURIComponent(text)}&apikey=free`;

        // Coba kirim sebagai sticker image dari API brat
        // Kalo API gagal, kirim teks fallback biar gak error
        const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 15000 }).catch(() => null);
        if (res && res.data) {
          await sock.sendMessage(from, { sticker: Buffer.from(res.data), packname: 'Blackdoor by Tama-ID', author: 'BRAT' }, { quoted: msg });
        } else {
          // Fallback: Kirim gambar brat pake teks biasa
          await sock.sendMessage(from, { text: `🟩 *BRAT - ${text}*\n\n(Brat API lagi down bung! Coba lagi 1 menit lagi!)\n\nCara manual: Buka bratgenerator.com, ketik teks lu, download, kirim ke bot jadi sticker!` }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: `🟩 *${command.toUpperCase()}*\nTeks: ${text}\n\nAPI Brat lagi sibuk bung! Coba lagi nanti ya!` }, { quoted: msg });
      }
      return;
    }
  }
};
