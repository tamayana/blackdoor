// Blackdoor by Tama-ID - Config
export const config = {
  owner: ['6285393659857'], // Nomor lu 085393659857
  ownerName: 'Tama-ID',
  botName: 'Blackdoor',
  prefix: '.',
  pairingNumber: '6285393659857', // Nomor buat pairing code
  sessionName: 'blackdoor-session',
    // Media - Foto bot & QRIS donate
  media: {
    botPic: './media/bot.jpg', // Foto profil bot lu, taro di folder media, nama nya bot.jpg
    qris: './media/qris.jpg', // Foto QRIS lu, taro di folder media, nama nya qris.jpg
    donateText: `*💰 DONATE BUAT BLACKDOOR!*\n\nMakasih udah mau support bot ini bung! 🙏\nDonasi lu bikin gua makin semangat update bot!\n\n*QRIS:* Scan foto di bawah!\n*DANA / GOPAY / OVO:* Tanya owner aja!\n\nBerapapun nominalnya, gua sangat bersyukur! ❤️`
  }
  // Setting Group
  welcome: true, // Auto welcome pas ada yang masuk
  goodbye: true, // Auto goodbye pas ada yang keluar
  antidelete: false, // Default mati, nyalain pake .antidelete on
  antilink: false,
  antivirtex: false,
  antijudol: false,
  antisticker: false,
  antiluar: false
}

export const mess = {
  owner: '❌ Khusus Owner Tama-ID!',
  admin: '❌ Khusus Admin Grup!',
  botAdmin: '❌ Bot harus jadi Admin dulu!',
  group: '❌ Khusus di Grup!',
  private: '❌ Khusus di Private Chat!',
  wait: '⏳ Tunggu bentar...'
}
