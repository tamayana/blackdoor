// Blackdoor by Tama-ID - Mesin Utama
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load semua plugin dari folder plugins/
async function loadPlugins() {
  const plugins = new Map();
  const pluginDir = path.join(__dirname, 'plugins');
  if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir, { recursive: true });
  const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const mod = await import(`./plugins/${file}?update=${Date.now()}`);
      if (mod.default) {
        // mod.default = { command: ['menu', ...], handler: fn }
        for (const cmd of mod.default.command) {
          plugins.set(cmd.toLowerCase(), mod.default.handler);
        }
        console.log(`[Blackdoor] Plugin loaded: ${file} -> ${mod.default.command.join(', ')}`);
      }
    } catch (e) {
      console.log(`[Blackdoor] Gagal load ${file}:`, e.message);
    }
  }
  return plugins;
}

async function startBot() {
  const plugins = await loadPlugins();
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false, // Kita pake Pairing Code, bukan QR
    auth: state,
    browser: ['Blackdoor by Tama-ID', 'Chrome', '1.0.0']
  });

  // PAIRING CODE - Kalo belum login, minta pairing code
  if (!sock.authState.creds.registered) {
    console.log('\n[Blackdoor] Belum login, minta Pairing Code...');
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(config.pairingNumber);
        console.log(`\n========================================`);
        console.log(`  PAIRING CODE LU BUNG: ${code}`);
        console.log(`  Buka WA > Perangkat Tertaut > Tautkan > Masukin kode ini!`);
        console.log(`========================================\n`);
      } catch (e) {
        console.log('Gagal minta pairing code:', e.message);
      }
    }, 3000);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('[Blackdoor] Koneksi putus, reconnect...', shouldReconnect);
      if (shouldReconnect) startBot();
      else console.log('[Blackdoor] Logout! Hapus folder session & login ulang!');
    } else if (connection === 'open') {
      console.log(`\n✅ [Blackdoor] by Tama-ID BERHASIL JALAN!`);
      console.log(`   Owner: ${config.ownerName} (${config.owner[0]})`);
      console.log(`   Prefix: ${config.prefix}`);
      console.log(`   Ketik ${config.prefix}menu di WA lu!\n`);
    }
  });

  // WELCOME & GOODBYE - Pas ada yang masuk / keluar grup
  sock.ev.on('group-participants.update', async (anu) => {
    try {
      const metadata = await sock.groupMetadata(anu.id);
      for (const num of anu.participants) {
        const pp = await sock.profilePictureUrl(num, 'image').catch(() => 'https://i.ibb.co/5r2fL0Y/no-profile.jpg');
        if (anu.action === 'add' && config.welcome) {
          await sock.sendMessage(anu.id, { text: `👋 *WELCOME!*\n\nHalo @${num.split('@')[0]} selamat datang di *${metadata.subject}*!\n\nJangan lupa baca deskripsi grup ya!\nKetik ${config.prefix}menu buat liat fitur bot!`, mentions: [num] });
        }
        if (anu.action === 'remove' && config.goodbye) {
          await sock.sendMessage(anu.id, { text: `👋 *GOODBYE!*\n\n@${num.split('@')[0]} telah keluar dari grup *${metadata.subject}*!\nSemoga betah diluar sana ya!`, mentions: [num] });
        }
      }
    } catch (e) {}
  });

  // ANTI DELETE - Kalo ada yang hapus pesan, bot kirim lagi!
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.message) return;

      // Cek antidelete
      if (msg.message.protocolMessage?.type === 0 && config.antidelete) {
        const deletedKey = msg.message.protocolMessage.key;
        console.log('[Blackdoor] Ada pesan dihapus:', deletedKey);
        // Nanti kita kirim ulang disini - versi full di plugins/antidelete.js
      }

      const from = msg.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const sender = msg.key.participant || msg.key.remoteJid;
      const body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';
      if (!body.startsWith(config.prefix)) return;

      const args = body.slice(config.prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();
      const text = args.join(' ');

      const handler = plugins.get(command);
      if (!handler) return;

      const context = { sock, msg, from, sender, isGroup, args, text, config, command, body };

      // Cek Owner
      const isOwner = config.owner.includes(sender.split('@')[0]);
      if (handler.isOwner && !isOwner) {
        await sock.sendMessage(from, { text: '❌ Khusus Owner Tama-ID!' }, { quoted: msg });
        return;
      }

      await handler(context);
    } catch (e) {
      console.log('[Blackdoor] Error:', e.message);
    }
  });
}

startBot();
