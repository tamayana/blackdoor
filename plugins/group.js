// Blackdoor by Tama-ID - Group Menu
export default {
  command: ['kick', 'add', 'hidetag', 'tagall', 'antivirtex', 'antilink', 'antijudol', 'pinpesan', 'antidelete', 'welcome', 'goodbye', 'promote', 'demote', 'link', 'revoke', 'setname', 'setdesc', 'mute', 'unmute', 'antiluar', 'antisticker', 'listadmin'],
  handler: async ({ sock, msg, from, sender, args, text, config, command }) => {
    const isGroup = from.endsWith('@g.us');
    if (!isGroup) {
      await sock.sendMessage(from, { text: '❌ Fitur ini khusus di Grup!' }, { quoted: msg });
      return;
    }

    const metadata = await sock.groupMetadata(from);
    const participants = metadata.participants;
    const isAdmin = participants.find(p => p.id === sender)?.admin;
    const isBotAdmin = participants.find(p => p.id === sock.user.id)?.admin;
    const isOwner = config.owner.includes(sender.split('@')[0]);

    const getTarget = () => {
      const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const quoted = msg.message.extendedTextMessage?.contextInfo?.participant;
      if (mentioned) return mentioned;
      if (quoted) return quoted;
      if (args[0]) {
        let num = args[0].replace(/[^0-9]/g, '');
        if (num.startsWith('0')) num = '62' + num.slice(1);
        return num + '@s.whatsapp.net';
      }
      return null;
    };

    // Fitur yang butuh admin - kecuali on/off setting yang boleh owner juga
    const needAdmin = ['kick','add','promote','demote','setname','setdesc','mute','unmute','revoke','pinpesan','hidetag','tagall'];
    if (needAdmin.includes(command) && !isAdmin && !isOwner) {
      await sock.sendMessage(from, { text: '❌ Khusus Admin Grup!' }, { quoted: msg });
      return;
    }
    const needBotAdmin = ['kick','add','promote','demote','setname','setdesc','mute','unmute','revoke','pinpesan'];
    if (needBotAdmin.includes(command) && !isBotAdmin) {
      await sock.sendMessage(from, { text: '❌ Bot harus jadi Admin dulu bung! Jadikan bot admin dulu!' }, { quoted: msg });
      return;
    }

    // .kick - Tendang orang
    if (command === 'kick') {
      const target = getTarget();
      if (!target) return sock.sendMessage(from, { text: `Tag orangnya!\nContoh: ${config.prefix}kick @orangnya` }, { quoted: msg });
      if (target === sock.user.id) return sock.sendMessage(from, { text: 'Gak bisa kick diri sendiri lah bung! 😅' }, { quoted: msg });
      await sock.groupParticipantsUpdate(from, [target], 'remove');
      await sock.sendMessage(from, { text: `✅ @${target.split('@')[0]} udah di kick! Bye bye! 👋`, mentions: [target] }, { quoted: msg });
      return;
    }

    // .add - Tambah orang
    if (command === 'add') {
      if (!args[0]) return sock.sendMessage(from, { text: `Contoh: ${config.prefix}add 0853xxxx` }, { quoted: msg });
      const target = getTarget();
      await sock.groupParticipantsUpdate(from, [target], 'add');
      await sock.sendMessage(from, { text: `✅ @${target.split('@')[0]} udah ditambahin!`, mentions: [target] }, { quoted: msg });
      return;
    }

    // .promote / .demote
    if (command === 'promote' || command === 'demote') {
      const target = getTarget();
      if (!target) return sock.sendMessage(from, { text: `Tag orangnya! ${config.prefix}${command} @orangnya` }, { quoted: msg });
      await sock.groupParticipantsUpdate(from, [target], command === 'promote' ? 'promote' : 'demote');
      await sock.sendMessage(from, { text: `✅ @${target.split('@')[0]} berhasil di ${command === 'promote' ? 'jadiin Admin! 👑' : 'turunin dari Admin!'}`, mentions: [target] }, { quoted: msg });
      return;
    }

    // .hidetag - Tag semua tapi sembunyi
    if (command === 'hidetag') {
      if (!text && !msg.message.extendedTextMessage) return sock.sendMessage(from, { text: 'Isi pesannya bung! .hidetag halo semua' }, { quoted: msg });
      const all = participants.map(p => p.id);
      await sock.sendMessage(from, { text: text || 'Hidetag by Blackdoor', mentions: all });
      return;
    }

    // .tagall - Tag semua terang-terangan
    if (command === 'tagall') {
      let teks = `📢 *TAG ALL - ${metadata.subject}*\n\n`;
      participants.forEach((p, i) => { teks += `${i+1}. @${p.id.split('@')[0]}\n`; });
      teks += `\nTotal: ${participants.length} member\nPesan: ${text || '-'}`;
      await sock.sendMessage(from, { text: teks, mentions: participants.map(p => p.id) }, { quoted: msg });
      return;
    }

    // .pinpesan - Pin pesan (reply pesan + ketik .pinpesan)
    if (command === 'pinpesan') {
      await sock.sendMessage(from, { text: '📌 Pesan udah di pin! (Fitur pin WA - reply pesan yang mau di pin, terus ketik .pinpesan)\n\nNote: WA sekarang pin nya manual, tapi bot udah catet!' }, { quoted: msg });
      return;
    }

    // .link - Ambil link grup
    if (command === 'link') {
      const code = await sock.groupInviteCode(from);
      await sock.sendMessage(from, { text: `🔗 *Link Grup ${metadata.subject}*\n\nhttps://chat.whatsapp.com/${code}` }, { quoted: msg });
      return;
    }

    // .revoke - Reset link grup
    if (command === 'revoke') {
      const code = await sock.groupRevokeInvite(from);
      await sock.sendMessage(from, { text: `✅ Link lama udah di reset!\nLink baru: https://chat.whatsapp.com/${code}` }, { quoted: msg });
      return;
    }

    // .setname / .setdesc
    if (command === 'setname') {
      if (!text) return sock.sendMessage(from, { text: 'Isi nama barunya! .setname Nama Baru' }, { quoted: msg });
      await sock.groupUpdateSubject(from, text);
      await sock.sendMessage(from, { text: `✅ Nama grup diganti jadi: *${text}*` }, { quoted: msg });
      return;
    }
    if (command === 'setdesc') {
      if (!text) return sock.sendMessage(from, { text: 'Isi deskripsi barunya! .setdesc Deskripsi Baru' }, { quoted: msg });
      await sock.groupUpdateDescription(from, text);
      await sock.sendMessage(from, { text: `✅ Deskripsi grup berhasil diganti!` }, { quoted: msg });
      return;
    }

    // .mute / .unmute - Kunci grup
    if (command === 'mute') {
      await sock.groupSettingUpdate(from, 'announcement');
      await sock.sendMessage(from, { text: '🔒 Grup di kunci! Cuma admin yang bisa chat!' }, { quoted: msg });
      return;
    }
    if (command === 'unmute') {
      await sock.groupSettingUpdate(from, 'not_announcement');
      await sock.sendMessage(from, { text: '🔓 Grup dibuka! Semua bisa chat lagi!' }, { quoted: msg });
      return;
    }

    // .listadmin
    if (command === 'listadmin') {
      const admins = participants.filter(p => p.admin);
      let teks = `👑 *LIST ADMIN - ${metadata.subject}*\n\n`;
      admins.forEach((p, i) => { teks += `${i+1}. @${p.id.split('@')[0]} - ${p.admin === 'superadmin' ? 'Owner Grup' : 'Admin'}\n`; });
      await sock.sendMessage(from, { text: teks, mentions: admins.map(p => p.id) }, { quoted: msg });
      return;
    }

    // === FITUR ON / OFF - .antivirtex on / off ===
    const toggleFeatures = ['antivirtex','antilink','antijudol','antidelete','welcome','goodbye','antiluar','antisticker'];
    if (toggleFeatures.includes(command)) {
      if (!isAdmin && !isOwner) return sock.sendMessage(from, { text: '❌ Khusus Admin!' }, { quoted: msg });
      const mode = args[0]?.toLowerCase();
      if (mode !== 'on' && mode !== 'off') {
        await sock.sendMessage(from, { text: `Cara pake: ${config.prefix}${command} on / off\n\nStatus sekarang: ${config[command] ? 'ON ✅' : 'OFF ❌'}\n\n${command === 'antivirtex' ? 'Anti virtex = Auto kick yang kirim virtex / teks panjang aneh!' : ''}${command === 'antilink' ? 'Anti link = Auto kick yang kirim link grup lain / link judi!' : ''}${command === 'antijudol' ? 'Anti judol = Auto kick yang promosi judi online!' : ''}${command === 'antidelete' ? 'Anti delete = Kalo ada yang hapus pesan, bot kirim lagi!' : ''}${command === 'welcome' ? 'Welcome = Bot sambut yang baru masuk!' : ''}${command === 'goodbye' ? 'Goodbye = Bot ucapin selamat tinggal yang keluar!' : ''}${command === 'antiluar' ? 'Anti luar = Auto kick nomor luar (bukan +62)!' : ''}${command === 'antisticker' ? 'Anti sticker = Auto kick yang spam sticker!' : ''}` }, { quoted: msg });
        return;
      }
      config[command] = mode === 'on';
      await sock.sendMessage(from, { text: `✅ *${command}* berhasil di ${mode === 'on' ? 'NYALAIN! 🔥' : 'MATIIN!'}*` }, { quoted: msg });
      return;
    }
  }
};
