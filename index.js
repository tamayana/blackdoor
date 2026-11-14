// Blackdoor by TAMAYANA - Pairing Code Version
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
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
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('./blackdoor-session');

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false, // GAK PAKE QR LAGI BUNG!
    auth: state,
    browser: ['Blackdoor', 'Chrome', '1.0.0'],
    syncFullHistory: false,
    markOnlineOnConnect: true,
  });

  // === PAIRING CODE - KHUSUS TAMAYANA ===
  if (!sock.authState.creds.registered) {
    console.log('\n======================================');
    console.log('🚪 BLACKDOOR by TAMAYANA');
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
    // Kasih jeda biar koneksi stabil dulu
    await new Promise(r => setTimeout(r, 3000));

    try {
      const code = await sock.requestPairingCode(phoneNumber);
      console.log('\n======================================');
      console.log('🔥 PAIRING CODE LU BUNG:');
      console.log(`\n   👉 ${code} 👈\n`);
      console.log('======================================');
      console.log('Cara masukinnya:');
      console.log('1. Buka WA di HP lu');
      console.log('2. Klik titik 3 > Perangkat Tertaut / Linked Devices');
      console.log('3. Klik Tautkan Perangkat / Link a Device');
      console.log('4. Klik "Tautkan dengan nomor telepon" / "Link with phone number"');
      console.log(`5. Masukin kode ini: ${code}`);
      console.log('6. Beres! Bot langsung nyambung!');
      console.log('======================================\n');
    } catch (e) {
      console.log('❌ Gagal minta pairing code bung! Error:', e.message);
      console.log('Coba: 1. Hapus folder blackdoor-session, 2. Jalanin lagi npm start');
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
        console.log('Hapus folder: rm -rf blackdoor-session');
      }
    }
    if (connection === 'open') {
      console.log('\n✅ BLACKDOOR UDAH NYAMBUNG BUNG! 🔥');
      console.log('Bot by TAMAYANA udah online!');
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

      // Cek banned
      if (config.banned?.includes(sender)) return;

      // Cek self mode - cuma owner yang bisa
      if (config.selfMode && !config.owner.includes(senderNum)) return;

      // Ambil teks pesan
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';
      if (!text) return;

      // Cek prefix
      if (!text.startsWith(config.prefix)) return;
      const args = text.slice(config.prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();
      const textArgs = args.join(' ');

      console.log(`📩 [${isGroup ? 'GRUP' : 'PRIBADI'}] ${senderNum}: ${text}`);

      // Cari plugin yang punya command ini
      for (const plugin of plugins) {
        if (plugin.command?.includes(command)) {
          await plugin.handler({ sock, msg, from, sender, args, text: textArgs, config, command });
          break;
        }
      }
    } catch (e) {
      console.log('Error handle pesan:', e.message);
    }
  });

  // === ANTI-VIRTEX / ANTI-LINK / WELCOME DLL - OTOMATIS ===
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
      if (isAdmin || isOwner) return; // Admin / owner bebas!

      // Anti Virtex - Kalo teks panjang banget / aneh
      if (config.antivirtex && text.length > 5000) {
        await sock.sendMessage(from, { text: `⚠️ @${senderNum} ngirim virtex! Auto kick!`, mentions: [sender] });
        await sock.groupParticipantsUpdate(from, [sender], 'remove');
        return;
      }
      // Anti Link - Kalo kirim link grup / judol
      if (config.antilink && (text.includes('chat.whatsapp.com/') || text.includes('t.me/') || text.includes('discord.gg/'))) {
        await sock.sendMessage(from, { text: `⚠️ @${senderNum} ngirim link! Auto kick!`, mentions: [sender] });
        await sock.groupParticipantsUpdate(from, [sender], 'remove');
        return;
      }
      // Anti Judol - Kata-kata judi
      const judolWords = ['slot gacor', 'judol', 'maxwin', 'deposit', 'togel', 'gacor77', 'slot88'];
      if (config.antijudol && judolWords.some(w => text.toLowerCase().includes(w))) {
        await sock.sendMessage(from, { text: `⚠️ @${senderNum} promosi judol! Auto kick!`, mentions: [sender] });
        await sock.groupParticipantsUpdate(from, [sender], 'remove');
        return;
      }
    } catch {}
  });

  // === WELCOME / GOODBYE OTOMATIS ===
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const { id, participants, action } = update;
      const metadata = await sock.groupMetadata(id);
      for (const p of participants) {
        if (action === 'add' && config.welcome) {
          await sock.sendMessage(id, { text: `👋 Halo @${p.split('@')[0]}! Selamat datang di *${metadata.subject}*!\n\nKetik ${config.prefix}menu buat liat menu Blackdoor!\n\n_© Blackdoor by TAMAYANA_`, mentions: [p] });
        }
        if (action === 'remove' && config.goodbye) {
          await sock.sendMessage(id, { text: `👋 Bye @${p.split('@')[0]}! Semoga balik lagi ya!\n\n_© Blackdoor by TAMAYANA_`, mentions: [p] });
        }
      }
    } catch {}
  });
}

startBot();
