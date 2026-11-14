// Blackdoor by Tama-ID - Menu dengan Foto Bot
import fs from 'fs';

export default {
  command: ['menu', 'help', 'allmenu'],
  handler: async ({ sock, msg, from, config, sender }) => {
    const pushName = msg.pushName || 'Bung';
    const ownerNumber = config.owner[0];

    // INI CAPTION NYA BUNG - MUNCUL DI BAWAH FOTO BOT!
    const menuText = `*╭─── 「 BLACKDOOR 」 ───╮*
*│*
*│ 🤖 Nama Bot : Blackdoor*
*│ 👑 Owner : Tama-ID*
*│ 📱 No Owner : wa.me/${ownerNumber}*
*│ ⚡ Versi : 1.0.0*
*│ 🔥 Prefix : ${config.prefix}*
*│ 👋 Halo : ${pushName}*
*│*
*╰──────────────────╯*

*╭── 「 OWNER MENU 」 ──╮*
*│* ▸ ${config.prefix}restart
*│* ▸ ${config.prefix}backup
*│* ▸ ${config.prefix}self
*│* ▸ ${config.prefix}public
*│* ▸ ${config.prefix}infobot
*│* ▸ ${config.prefix}broadcast
*│* ▸ ${config.prefix}ban
*│* ▸ ${config.prefix}unban
*│* ▸ ${config.prefix}setppbot
*│* ▸ ${config.prefix}clearsession
*╰──────────────────╯*

*╭── 「 GROUP MENU 」 ──╮*
*│* ▸ ${config.prefix}kick
*│* ▸ ${config.prefix}add
*│* ▸ ${config.prefix}hidetag
*│* ▸ ${config.prefix}tagall
*│* ▸ ${config.prefix}antivirtex
*│* ▸ ${config.prefix}antilink
*│* ▸ ${config.prefix}antijudol
*│* ▸ ${config.prefix}pinpesan
*│* ▸ ${config.prefix}antidelete
*│* ▸ ${config.prefix}welcome
*│* ▸ ${config.prefix}goodbye
*│* ▸ ${config.prefix}promote
*│* ▸ ${config.prefix}demote
*│* ▸ ${config.prefix}link / ${config.prefix}revoke
*│* ▸ ${config.prefix}setname / ${config.prefix}setdesc
*│* ▸ ${config.prefix}mute / ${config.prefix}unmute
*│* ▸ ${config.prefix}antiluar
*│* ▸ ${config.prefix}antisticker
*│* ▸ ${config.prefix}listadmin
*╰──────────────────╯*

*╭── 「 DOWNLOADER 」 ──╮*
*│* ▸ ${config.prefix}tiktok <link>
*│* ▸ ${config.prefix}ig <link>
*│* ▸ ${config.prefix}ytmp3 <judul/link>
*╰──────────────────╯*

*╭── 「 STICKER 」 ──╮*
*│* ▸ ${config.prefix}sticker
*│* ▸ ${config.prefix}toimg
*│* ▸ ${config.prefix}tourl
*│* ▸ ${config.prefix}brat <teks>
*│* ▸ ${config.prefix}bratvid <teks>
*│* ▸ ${config.prefix}bratvid2 <teks>
*│* ▸ ${config.prefix}bratvid3 <teks>
*╰──────────────────╯*

*╭── 「 AI MENU 」 ──╮*
*│* ▸ ${config.prefix}ai <tanya>
*│* ▸ ${config.prefix}gpt <tanya>
*│* ▸ ${config.prefix}aitama <tanya>
*╰──────────────────╯*

*╭── 「 GAME / FUN 」 ──╮*
*│* ▸ ${config.prefix}ceksisaumur <nama>
*│* ▸ ${config.prefix}jodoh <nama1 & nama2>
*│* ▸ ${config.prefix}slot
*│* ▸ ${config.prefix}cekpsikopat <nama>
*│* ▸ ${config.prefix}cekgabut <nama>
*│* ▸ ${config.prefix}cekkhodam <nama>
*╰──────────────────╯*

*╭── 「 LAINNYA 」 ──╮*
*│* ▸ ${config.prefix}donate - Support bot!
*│* ▸ ${config.prefix}owner - Chat owner!
*╰──────────────────╯*

_© 2026 Blackdoor by Tama-ID_
_Support biar makin gacor! Ketik ${config.prefix}donate ❤️_`;

    // KIRIM FOTO BOT + MENU DI BAWAHNYA!
    try {
      const botPicPath = './media/bot.jpg';
      if (fs.existsSync(botPicPath)) {
        // Kalo foto ada, kirim foto + caption menu dibawahnya!
        await sock.sendMessage(from, {
          image: fs.readFileSync(botPicPath),
          caption: menuText
        }, { quoted: msg });
      } else {
        // Kalo foto belum ada, kirim teks aja dulu + kasih tau!
        await sock.sendMessage(from, {
          text: menuText + `\n\n⚠️ _Foto bot belum ada! Upload foto lu ke folder media/ kasih nama bot.jpg biar menu nya ada foto nya!_`
        }, { quoted: msg });
      }
    } catch (e) {
      await sock.sendMessage(from, { text: menuText }, { quoted: msg });
    }
  }
};
