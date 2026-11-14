// Blackdoor by Tama-ID 
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import readline from 'readline';
import config from './config.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (q) => new Promise(res => rl.question(q, res));

// Load semua plugin
const plugins = [];
const pluginFiles = fs.readdirSync('./plugins').filter(f => f.endsWith('.js'));
for (const file of pluginFiles) {
  const plugin = (await import(`./plugins/${file}`)).default;
  plugins.push(plugin);
  console.log(`✅ Plugin dimuat: ${file}`);
}

async function startBot() {
  // === KODE KEAMANAN - HARUS TAMAYANA! ===
  console.log('\n======================================');
  console.log('🚪 BLACKDOOR by Tama-ID');
  console.log('🔒 MODE KEAMANAN AKTIF!');
  console.log('======================================\n');

  const kode = await question('Masukin KODE buat jalanin bot bung: ');
  if (kode.trim() !== 'TAMAYANA') {
    console.log('\n❌ KODE SALAH BUNG! Bot gak mau jalan!');
    console.log('Kode nya harus: TAMAYANA');
    console.log('Coba lagi! Ketik: npm start');
    process.exit(0);
  }

  console.log('\n✅ KODE BENAR! TAMAYANA DITERIMA!');
  console.log('Lanjut ke Pairing Code...\n');

  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('./blackdoor-session');

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false, // GAK PAKE QR!
    auth: state,
    browser: ['Blackdoor', 'Chrome', '1.0.0'],
    syncFullHistory: false,
    markOnlineOnConnect: true,
  });

  // === PAIRING CODE ===
  if (!sock.authState.creds.registered) {
    console.log('======================================');
    console.log('🔑 MODE PAIRING CODE - GAK PAKE QR!');
    console.log('======================================\n');

    let phoneNumber = await question('Masukin nomor WA bot lu bung (pake 62, contoh: 62853xxxx): ');
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (phoneNumber.startsWith('0')) phoneNumber = '62' + phoneNumber.slice(1);
    if (!phoneNumber.startsWith('62')) {
      console.log('❌ Nomor harus pake 62 bung! Contoh: 62853xxxx');
      process.exit(0);
    }

    console.log('\n⏳ Lagi minta pairing code... Tunggu bentar...');
    await new Promise(r => setTimeout(r, 3000));

    try {
      const code = await sock.requestPairingCode(phoneNumber);
      console.log('\n======================================');
      console.log('🔥 PAIRING CODE LU BUNG:');
      console.log(`\n   👉 ${code} 👈\n`);
      console.log('======================================');
      console.log('Cara masukinnya:');
      console.log('1. Buka WA di HP lu');
      console.log('2. Klik titik 3 > Perangkat Tertaut');
      console.log('3. Klik Tautkan Perangkat');
      console.log('4. Klik "Tautkan dengan nomor telepon"');
      console.log(`5. Masukin kode ini: ${code}`);
      console.log('6. Beres! Bot langsung nyambung!');
      console.log('======================================\n');
    } catch (e) {
      console.log('❌ Gagal minta pairing code bung! Error:', e.message);
      console.log('Coba: Hapus folder blackdoor-session, terus jalanin lagi!');
      process.exit(0);
    }
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Koneksi putus, reconnect?', shouldReconnect);
      if (shouldReconnect) startBot();
      else {
        console.log('❌ Bot ke logout! Hapus folder blackdoor-session, terus jalanin lagi!');
      }
    }
    if (connection === 'open') {
      console.log('\n✅ BLACKDOOR UDAH NYAMBUNG BUNG! 🔥');
      console.log('Bot by Tama-ID udah online!');
      console.log(`Prefix: ${config.prefix}`);
      console.log(`Ketik ${config.prefix}menu buat liat menu!`);
    }
  });

  // === HANDLE PESAN MASUK ===
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg.message) return;
      if (msg.key.fromMe) return;
      const from = msg.key.remoteJid;
      const sender = msg.key.participant || from;
      const senderNum = sender.split('@')[0];
      const isGroup = from.endsWith('@g.us');
      if (config.banned?.includes(sender)) return;
      if (config.selfMode && !config.owner.includes(senderNum)) return;
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';
      if (!text) return;
      if (!text.startsWith(config.prefix)) return;
      const args = text.slice(config.prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();
      const textArgs = args.join(' ');
      console.log(`📩 [${isGroup ? 'GRUP' : 'PRIBADI'}] ${senderNum}: ${text}`);
      for (const plugin of plugins) {
        if (plugin.command?.includes(command)) {
          await plugin.handler({ sock, msg, from, sender, args, text: textArgs, config, command });
          break;
        }
      }
    } catch (e) { console.log('Error handle pesan:', e.message); }
  });

  // === ANTI-VIRTEX / ANTI-LINK / DLL ===
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg.message) return;
      const from = msg.key.remoteJid;
      if (!from.endsWith('@g.us')) return;
      const sender = msg.key.participant || from;
      const senderNum = sender.split('@')[0];
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      const metadata = await sock.groupMetadata(from).catch(() => null);
      if (!metadata) return;
      const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;
      const isOwner = config.owner.includes(senderNum);
      if (isAdmin || isOwner) return;
      if (config.antivirtex && text.length > 5000) {
        await sock.sendMessage(from, { text: `⚠️ @${senderNum} ngirim virtex! Auto kick!`, mentions: [sender] });
        await sock.groupParticipantsUpdate(from, [sender], 'remove');
        return;
      }
      if (config.antilink && (text.includes('chat.whatsapp.com/') || text.includes('t.me/') || text.includes('discord.gg/'))) {
        await sock.sendMessage(from, { text: `⚠️ @${senderNum} ngirim link! Auto kick!`, mentions: [sender] });
        await sock.groupParticipantsUpdate(from, [sender], 'remove');
        return;
      }
      const judolWords = ['slot gacor', 'judol', 'maxwin', 'deposit', 'togel', 'gacor77', 'slot88'];
      if (config.antijudol && judolWords.some(w => text.toLowerCase().includes(w))) {
        await sock.sendMessage(from, { text: `⚠️ @${senderNum} promosi judol! Auto kick!`, mentions: [sender] });
        await sock.groupParticipantsUpdate(from, [sender], 'remove');
        return;
      }
    } catch {}
  });

  // === WELCOME / GOODBYE ===
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const { id, participants, action } = update;
      const metadata = await sock.groupMetadata(id);
      for (const p of participants) {
        if (action === 'add' && config.welcome) {
          await sock.sendMessage(id, { text: `👋 Halo @${p.split('@')[0]}! Selamat datang di *${metadata.subject}*!\n\nKetik ${config.prefix}menu buat liat menu Blackdoor!\n\n_© Blackdoor by Tama-ID_`, mentions: [p] });
        }
        if (action === 'remove' && config.goodbye) {
          await sock.sendMessage(id, { text: `👋 Bye @${p.split('@')[0]}! Semoga balik lagi ya!\n\n_© Blackdoor by Tama-ID_`, mentions: [p] });
        }
      }
    } catch {}
  });
}

startBot();
