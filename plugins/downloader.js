// Blackdoor by Tama-ID - Downloader
import axios from 'axios';

export default {
  command: ['tiktok', 'ig', 'instagram', 'ytmp3', 'yt', 'youtube'],
  handler: async ({ sock, msg, from, args, text, config, command }) => {
    if (!text) {
      const contoh = command === 'tiktok' ? `${config.prefix}tiktok <link tiktok>\nContoh: ${config.prefix}tiktok https://vt.tiktok.com/xxx` : command === 'ig' || command === 'instagram' ? `${config.prefix}ig <link instagram>\nContoh: ${config.prefix}ig https://www.instagram.com/reel/xxx` : `${config.prefix}ytmp3 <judul lagu / link youtube>\nContoh: ${config.prefix}ytmp3 DJ viral tiktok`;
      await sock.sendMessage(from, { text: `Isi link nya bung!\n\n${contoh}` }, { quoted: msg });
      return;
    }

    await sock.sendMessage(from, { text: '⏳ Lagi download... Tunggu bentar ya bung!' }, { quoted: msg });

    // .tiktok - Download TikTok tanpa watermark
    if (command === 'tiktok') {
      try {
        // Pake API gratis tikwm
        const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}`);
        const data = res.data?.data;
        if (!data) throw new Error('Gagal');
        const videoUrl = data.play;
        const caption = `✅ *TikTok Berhasil!*\n\n👤 Author: @${data.author?.unique_id || '-'}\n❤️ Like: ${data.digg_count || '-'}\n💬 Komen: ${data.comment_count || '-'}\n📝 Caption: ${data.title?.slice(0, 100) || '-'}\n\n_© Blackdoor by Tama-ID_`;
        await sock.sendMessage(from, { video: { url: videoUrl }, caption }, { quoted: msg });
        // Kirim juga musiknya kalo ada
        if (data.music) {
          await sock.sendMessage(from, { audio: { url: data.music }, mimetype: 'audio/mp4', fileName: 'tiktok-music.mp3' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: '❌ Gagal download TikTok bung! Coba cek link nya, pastikan link nya public & bukan private!' }, { quoted: msg });
      }
      return;
    }

    // .ig - Download IG Reels / Foto / Video
    if (command === 'ig' || command === 'instagram') {
      try {
        await sock.sendMessage(from, { text: '📸 *Instagram Downloader*\n\nFitur ini butuh API tambahan bung! Untuk sekarang, gua kasih cara manual dulu ya:\n\n1. Buka link IG nya\n2. Copy link nya\n3. Buka web: savefrom.net / igdownloader\n4. Paste disana\n\nNanti kalo bot udah jalan, gua bantu pasang API IG yang premium biar langsung ke download! 🙏' }, { quoted: msg });
      } catch {
        await sock.sendMessage(from, { text: '❌ Gagal download IG!' }, { quoted: msg });
      }
      return;
    }

    // .ytmp3 - Download musik dari YouTube jadi MP3
    if (command === 'ytmp3' || command === 'yt' || command === 'youtube') {
      await sock.sendMessage(from, { text: `🎵 *YouTube to MP3*\n\nLagi cari: *${text}*\n\nCara download MP3 YouTube:\n1. Buka ytmp3.cc / yt1s.com\n2. Paste judul / link YouTube lu\n3. Download MP3 nya\n\nNanti gua pasangin API YouTube biar bisa langsung kirim MP3 ke WA lu bung! Fitur ini lagi gua siapin API nya biar gak kena limit! 🎧\n\nSementara pake web dulu ya bung, biar tetep bisa download!` }, { quoted: msg });
      return;
    }
  }
};
