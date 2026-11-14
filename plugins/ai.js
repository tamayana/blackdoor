// Blackdoor by Tama-ID - AI Menu
import axios from 'axios';

export default {
  command: ['ai', 'gpt', 'aitama'],
  handler: async ({ sock, msg, from, args, text, config, command }) => {
    if (!text) {
      await sock.sendMessage(from, { text: `Tanya apa bung?\n\nContoh:\n${config.prefix}ai siapa presiden indonesia?\n${config.prefix}gpt buatin pantun lucu\n${config.prefix}aitama ceritain tentang blackdoor` }, { quoted: msg });
      return;
    }

    await sock.sendMessage(from, { text: '🤖 Lagi mikir... Tunggu bentar ya bung!' }, { quoted: msg });

    try {
      // Pake API AI gratis - Pollinations / GPT gratis
      let prompt = text;
      let system = 'Kamu adalah Blackdoor, bot WhatsApp buatan Tama-ID. Jawab dengan bahasa Indonesia gaul, santai, lucu, tapi tetap pintar. Pake gaya anak Jakarta. Jangan terlalu formal.';

      if (command === 'aitama') {
        system = 'Kamu adalah AiTama, AI pribadi buatan Tama-ID untuk bot Blackdoor. Kamu adalah versi Tama yang pinter banget. Gaya bicara lu gaul, lucu, suka bercanda, tapi jawaban lu akurat dan membantu. Kamu selalu nyebut diri lu AiTama. Kamu suka pake kata bung, wkwk, gacor. Jawab pake bahasa Indonesia gaul.';
        prompt = text;
      }
      if (command === 'gpt') {
        system = 'Kamu adalah GPT, asisten AI pintar. Jawab dengan bahasa Indonesia yang jelas, lengkap, dan mudah dipahami. Kalo ditanya bikin sesuatu, bikin yang terbaik.';
      }

      // API Pollinations AI - Gratis, tanpa key
      const res = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?system=${encodeURIComponent(system)}`, { timeout: 30000 });

      let answer = typeof res.data === 'string' ? res.data : res.data?.choices?.[0]?.message?.content || 'Gagal mikir bung! Coba tanya lagi!';
      if (!answer || answer.length < 2) answer = 'Waduh bung, gua nge-blank! Coba tanya lagi dengan kata yang beda!';

      const header = command === 'aitama' ? '🧠 *AiTama*' : command === 'gpt' ? '🤖 *GPT*' : '✨ *AI Blackdoor*';
      await sock.sendMessage(from, { text: `${header}\n\n${answer}\n\n_© Blackdoor by Tama-ID - Ketik ${config.prefix}ai <tanya> buat nanya lagi!_` }, { quoted: msg });

    } catch (e) {
      // Fallback kalo API down - Jawab pake logika sederhana biar gak error
      const fallback = {
        'halo': 'Halo juga bung! Ada apa? Tanya aja ke gua! Gua AiTama, siap bantu! 🔥',
        'siapa': 'Gua Blackdoor, bot buatan Tama-ID! Gua bisa download TikTok, bikin sticker, main game, dan jawab pertanyaan lu! Ketik .menu buat liat semua fitur gua!',
        'apa kabar': 'Kabar gua baik bung! Lagi semangat! Lu gimana? Semoga sehat terus ya!',
        'blackdoor': 'Blackdoor itu bot WhatsApp buatan Tama-ID! Fiturnya banyak banget! Ada downloader, sticker, AI, game, grup, dll! Ketik .menu buat liat semua!',
        'tama': 'Tama-ID itu owner gua! Orang paling gacor di Pontianak! Dia yang bikin gua! 👑'
      };
      const lower = text.toLowerCase();
      let reply = null;
      for (const key in fallback) {
        if (lower.includes(key)) { reply = fallback[key]; break; }
      }
      if (!reply) reply = `Waduh bung, AI nya lagi down bentar! Server nya lagi sibuk! Coba lagi 1 menit lagi ya! 🙏\n\nPertanyaan lu: "${text}"\n\nSementara itu, coba fitur lain dulu: .menu, .tiktok, .brat, .slot, .cekkhodam!`;

      await sock.sendMessage(from, { text: reply }, { quoted: msg });
    }
  }
};
