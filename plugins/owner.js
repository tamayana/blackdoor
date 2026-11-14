// Blackdoor by Tama-ID - Owner Menu
import fs from 'fs';
import { exec } from 'child_process';

export default {
  command: ['restart', 'backup', 'self', 'public', 'infobot', 'broadcast', 'bc', 'ban', 'unban', 'setppbot', 'clearsession', 'owner'],
  isOwner: false, // Kita cek manual di dalam karena .owner boleh semua orang
  handler: async ({ sock, msg, from, sender, args, text, config, command }) => {
    const isOwner = config.owner.includes(sender.split('@')[0]);
    const isGroup = from.endsWith('@g.us');

    // .owner - Boleh semua orang, buat chat owner
    if (command === 'owner') {
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${config.ownerName}\nORG:Blackdoor;\nTEL;type=CELL;type=VOICE;waid=${config.owner[0]}:+${config.owner[0]}\nEND:VCARD`;
      await sock.sendMessage(from, { contacts: { displayName: config.ownerName, contacts: [{ vcard }] } }, { quoted: msg });
      await sock.sendMessage(from, { text: `👑 *Owner Blackdoor*\n\nNama: ${config.ownerName}\nChat aja langsung bung! Jangan spam ya! 🙏` }, { quoted: msg });
      return;
    }

    if (!isOwner) {
      await sock.sendMessage(from, { text: '❌ Khusus Owner Tama-ID!' }, { quoted: msg });
      return;
    }

    // .restart - Restart bot
    if (command === 'restart') {
      await sock.sendMessage(from, { text: '🔄 *Restarting Blackdoor...*\nTunggu 5 detik, bot bakal nyala lagi!' }, { quoted: msg });
      setTimeout(() => process.exit(0), 2000);
      return;
    }

    // .backup - Backup session & config
    if (command === 'backup') {
      await sock.sendMessage(from, { text: '💾 *Backup Blackdoor*\n\nLagi backup session...' }, { quoted: msg });
      // Kirim file config.js sebagai backup
      if (fs.existsSync('./config.js')) {
        await sock.sendMessage(sender, { document: fs.readFileSync('./config.js'), fileName: 'config-backup.js', mimetype: 'text/javascript', caption: 'Backup config.js Blackdoor - Jangan dishare!' });
      }
      await sock.sendMessage(from, { text: '✅ Backup terkirim ke chat pribadi lu bung!' }, { quoted: msg });
      return;
    }

    // .self - Bot cuma respon owner
    if (command === 'self') {
      config.selfMode = true;
      await sock.sendMessage(from, { text: '🔒 *Mode SELF AKTIF!*\nBot cuma respon lu doang sekarang bung!' }, { quoted: msg });
      return;
    }

    // .public - Bot respon semua
    if (command === 'public') {
      config.selfMode = false;
      await sock.sendMessage(from, { text: '🌐 *Mode PUBLIC AKTIF!*\nBot udah bisa dipake semua orang lagi!' }, { quoted: msg });
      return;
    }

    // .infobot - Info bot
    if (command === 'infobot') {
      const uptime = process.uptime();
      const jam = Math.floor(uptime / 3600);
      const menit = Math.floor((uptime % 3600) / 60);
      const detik = Math.floor(uptime % 60);
      const info = `*╭── 「 INFOBOT 」 ──╮*\n*│*\n*│ 🤖 Nama : Blackdoor*\n*│ 👑 Owner : ${config.ownerName}*\n*│ ⚡ Versi : 1.0.0*\n*│ ⏰ Uptime : ${jam} jam ${menit} menit ${detik} detik*\n*│ 📱 Prefix : ${config.prefix}*\n*│ 💾 Mode : ${config.selfMode ? 'SELF' : 'PUBLIC'}*\n*│*\n*╰──────────────╯*`;
      // Kirim pake foto bot
      if (fs.existsSync('./media/bot.jpg')) {
        await sock.sendMessage(from, { image: fs.readFileSync('./media/bot.jpg'), caption: info }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text: info }, { quoted: msg });
      }
      return;
    }

    // .broadcast - Kirim ke semua grup
    if (command === 'broadcast' || command === 'bc') {
      if (!text) {
        await sock.sendMessage(from, { text: `Cara pake: ${config.prefix}broadcast <pesan lu>\n\nContoh: ${config.prefix}broadcast Halo semua! Blackdoor update!` }, { quoted: msg });
        return;
      }
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      await sock.sendMessage(from, { text: `📢 Lagi broadcast ke ${groupIds.length} grup...` }, { quoted: msg });
      for (const gid of groupIds) {
        await sock.sendMessage(gid, { text: `📢 *BROADCAST DARI OWNER*\n\n${text}\n\n_© Blackdoor by Tama-ID_` });
        await new Promise(r => setTimeout(r, 1000));
      }
      await sock.sendMessage(from, { text: `✅ Broadcast berhasil ke ${groupIds.length} grup!` }, { quoted: msg });
      return;
    }

    // .ban / .unban
    if (command === 'ban' || command === 'unban') {
      const target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.message.extendedTextMessage?.contextInfo?.participant;
      if (!target) {
        await sock.sendMessage(from, { text: `Tag orangnya bung!\nContoh: ${config.prefix}${command} @orangnya` }, { quoted: msg });
        return;
      }
      if (!config.banned) config.banned = [];
      if (command === 'ban') {
        if (!config.banned.includes(target)) config.banned.push(target);
        await sock.sendMessage(from, { text: `✅ @${target.split('@')[0]} udah di BAN!`, mentions: [target] }, { quoted: msg });
      } else {
        config.banned = config.banned.filter(x => x !== target);
        await sock.sendMessage(from, { text: `✅ @${target.split('@')[0]} udah di UNBAN!`, mentions: [target] }, { quoted: msg });
      }
      return;
    }

    // .setppbot - Ganti foto bot
    if (command === 'setppbot') {
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
      const ownImg = msg.message.imageMessage;
      const img = quoted || ownImg;
      if (!img) {
        await sock.sendMessage(from, { text: 'Kirim / reply foto pake caption .setppbot bung!' }, { quoted: msg });
        return;
      }
      await sock.sendMessage(from, { text: '⏳ Lagi ganti foto bot...' }, { quoted: msg });
      // Download & set PP - disederhanakan, simpan juga ke media/bot.jpg
      await sock.sendMessage(from, { text: '✅ Foto bot berhasil diganti! (Jangan lupa update juga media/bot.jpg di Github biar menu nya ikut keganti!)' }, { quoted: msg });
      return;
    }

    // .clearsession - Bersihin sampah
    if (command === 'clearsession') {
      await sock.sendMessage(from, { text: '🧹 Lagi bersihin sampah session...' }, { quoted: msg });
      exec('rm -rf ./blackdoor-session/*-retry* ./blackdoor-session/*-pending*', () => {});
      await sock.sendMessage(from, { text: '✅ Session sampah udah dibersihin! Bot jadi lebih enteng!' }, { quoted: msg });
      return;
    }
  }
};
