// Blackdoor by Tama-ID - Game / Fun
export default {
  command: ['ceksisaumur', 'jodoh', 'slot', 'cekpsikopat', 'cekgabut', 'cekkhodam'],
  handler: async ({ sock, msg, from, args, text, config, command }) => {
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getPercent = () => Math.floor(Math.random() * 101);

    // .ceksisaumur - Cek sisa umur (fun aja!)
    if (command === 'ceksisaumur') {
      const nama = text || msg.pushName || 'Bung';
      const umur = Math.floor(Math.random() * 60) + 20; // 20-80 tahun
      const sisa = Math.floor(Math.random() * 50) + 10;
      const persen = getPercent();
      const pesan = [
        'Lu bakal panjang umur bung! Banyakin ibadah!',
        'Waduh, kurang-kurangin begadang bung!',
        'Masih lama bung! Santai aja!',
        'Lu harus jaga kesehatan mulai sekarang!',
        'Gacor! Umur lu panjang! Asal jangan kebanyakan micin!'
      ];
      await sock.sendMessage(from, { text: `⏳ *CEK SISA UMUR*\n\n👤 Nama: ${nama}\n🎂 Umur Sekarang: ${umur} tahun\n⏰ Sisa Umur: ${sisa} tahun lagi\n📊 Persen Hidup: ${persen}%\n\n💬 Pesan: ${getRandom(pesan)}\n\n_Ini cuma fun ya bung! Jangan baper! Umur cuma Tuhan yang tau! 🙏_` }, { quoted: msg });
      return;
    }

    // .jodoh - Cek jodoh
    if (command === 'jodoh') {
      if (!text || !text.includes('&') && !text.includes('dan')) {
        await sock.sendMessage(from, { text: `Cara pake: ${config.prefix}jodoh nama1 & nama2\n\nContoh: ${config.prefix}jodoh Tama & Siti` }, { quoted: msg });
        return;
      }
      const [nama1, nama2] = text.split(/&|dan/i).map(s => s.trim());
      const persen = getPercent();
      let status = '';
      let saran = '';
      if (persen >= 90) { status = 'JODOH SEJATI! 🔥🔥🔥'; saran = 'Udah, nikah aja langsung! Jangan kelamaan!'; }
      else if (persen >= 70) { status = 'COCOK BANGET! ❤️'; saran = 'Lanjutin! Udah cocok nih!'; }
      else if (persen >= 50) { status = 'LUMAYAN COCOK! 😊'; saran = 'Perlu usaha dikit lagi! PDKT terus!'; }
      else if (persen >= 30) { status = 'KURANG COCOK! 😅'; saran = 'Coba cari yang lain, masih banyak!'; }
      else { status = 'GAK COCOK! 💔'; saran = 'Udah, move on aja bung! Masih banyak yang lain!'; }

      await sock.sendMessage(from, { text: `💘 *CEK JODOH*\n\n👤 ${nama1 || 'Kamu'} ❤️ ${nama2 || 'Dia'}\n📊 Kecocokan: ${persen}%\n💬 Status: ${status}\n\n💡 Saran: ${saran}\n\n_© Blackdoor by Tama-ID_` }, { quoted: msg });
      return;
    }

    // .slot - Main slot
    if (command === 'slot') {
      const emojis = ['🍒', '🍋', '🍇', '🍉', '⭐', '💎', '🔔', '🍀', '🎰', '👑'];
      const s1 = getRandom(emojis);
      const s2 = getRandom(emojis);
      const s3 = getRandom(emojis);
      let hasil = '';
      let hadiah = '';
      if (s1 === s2 && s2 === s3) {
        hasil = '🎉 JACKPOT! LU MENANG GEDE!';
        hadiah = 'Hadiah: 1000 koin! (Koin bohongan ya bung, jangan nagih ke owner! wkwk)';
      } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        hasil = '😊 Hampir! Dapat 2 yang sama!';
        hadiah = 'Hadiah: 100 koin!';
      } else {
        hasil = '😅 Zonk! Coba lagi!';
        hadiah = 'Hadiah: 0 koin! Coba lagi, siapa tau jackpot!';
      }
      await sock.sendMessage(from, { text: `🎰 *SLOT BLACKDOOR*\n\n┌───┬───┬───┐\n│ ${s1} │ ${s2} │ ${s3} │\n└───┴───┴───┘\n\n${hasil}\n${hadiah}\n\nKetik ${config.prefix}slot lagi buat main lagi!` }, { quoted: msg });
      return;
    }

    // .cekpsikopat - Cek psikopat (fun!)
    if (command === 'cekpsikopat') {
      const nama = text || msg.pushName || 'Bung';
      const persen = getPercent();
      let level = '';
      if (persen >= 80) level = 'BAHAYA! Lu psikopat level dewa! Jangan deket-deket gua! 😱';
      else if (persen >= 60) level = 'Agak psikopat! Suka senyum sendiri ya? 😏';
      else if (persen >= 40) level = 'Normal, tapi kadang suka ngamuk kalo laper! 😅';
      else if (persen >= 20) level = 'Aman! Lu orang baik! 😊';
      else level = 'LU MALAIKAT! Terlalu baik! ❤️';

      await sock.sendMessage(from, { text: `🔪 *CEK PSIKOPAT*\n\n👤 Nama: ${nama}\n📊 Level Psikopat: ${persen}%\n💬 Hasil: ${level}\n\n_Ini cuma fun ya bung! Jangan baper! 😅_` }, { quoted: msg });
      return;
    }

    // .cekgabut - Cek gabut
    if (command === 'cekgabut') {
      const nama = text || msg.pushName || 'Bung';
      const persen = getPercent();
      let level = '';
      let saran = '';
      if (persen >= 80) { level = 'GABUT PARAH!'; saran = 'Udah gabut banget! Mending chat gua aja! Ketik .menu, banyak fitur seru!'; }
      else if (persen >= 60) { level = 'LUMAYAN GABUT!'; saran = 'Coba main .slot atau .cekkhodam biar gak gabut!'; }
      else if (persen >= 40) { level = 'SEDANG!'; saran = 'Masih normal! Lanjutin kerjaan lu!'; }
      else { level = 'SIBUK!'; saran = 'Lu sibuk banget! Istirahat dulu bung!'; }

      await sock.sendMessage(from, { text: `🥱 *CEK GABUT*\n\n👤 Nama: ${nama}\n📊 Level Gabut: ${persen}%\n💬 Status: ${level}\n\n💡 Saran: ${saran}\n\n_© Blackdoor by Tama-ID_` }, { quoted: msg });
      return;
    }

    // .cekkhodam - Cek khodam
    if (command === 'cekkhodam') {
      const nama = text || msg.pushName || 'Bung';
      const khodams = [
        'Macan Putih - Gagah & Berani! 🐯',
        'Naga Hitam - Kuat & Misterius! 🐉',
        'Harimau Sumatera - Lincah! 🐅',
        'Kuntilanak Cantik - Serem tapi setia! 👻',
        'Pocong Loncat - Lucu! 😂',
        'Genderuwo Gede - Ngeri! 👹',
        'Tuyul Kecil - Suka nyuri duit! 💰',
        'Jin Ifrit - Sakti! 🧞',
        'Malaikat Penjaga - Baik banget! 😇',
        'Khodam Kosong - Lu gak punya khodam! Lu terlalu suci! ✨',
        'Singa Barong - Raja Hutan! 🦁',
        'Ular Naga - Licin! 🐍',
        'Elang Jawa - Tajam! 🦅',
        'Kuda Hitam - Cepet! 🐴',
        'Bebek Karet - Kocak! 🦆',
        'Khodam Slot - Suka main slot! 🎰',
        'Khodam Jomlo - Sendirian terus! 💔',
        'Khodam Wibu - Suka anime! 🎌',
        'Khodam Gabut - Gabut mulu! 🥱',
        'Khodam Sombong - Suka pamer! 😎'
      ];
      const khodam = getRandom(khodams);
      const persen = getPercent();
      await sock.sendMessage(from, { text: `👻 *CEK KHODAM*\n\n👤 Nama: ${nama}\n👻 Khodam Lu: ${khodam}\n📊 Kekuatan: ${persen}%\n\n💬 Pesan Khodam: "${getRandom(['Jaga gua baik-baik ya!', 'Jangan tinggalin gua!', 'Lu harus rajin ibadah!', 'Gua lapar, kasih gua makan!', 'Lu ganteng / cantik banget hari ini!', 'Jangan begadang mulu!'])}"\n\n_Ini cuma fun ya bung! Jangan percaya 100%! 😅_` }, { quoted: msg });
      return;
    }
  }
};
