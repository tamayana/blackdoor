// plugins/ai/blackdoor.js - BLACKDOOR FULL FINAL! TANPA API! TANPA APIKEY!
let handler = async (m, { conn, text }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    let isImage = /image/.test(mime)

    // ===== ROASTING FOTO - BLACKDOOR =====
    if (isImage) {
        try {
            await conn.sendMessage(m.chat, { react: { text: '🚪', key: m.key } })
            let roastFoto = [
                `JIR! Ini foto apa KTP? Muka lu kok kayak foto 3x4 yang gagal? 😒 Cahaya nya gelap, muka lu gelap, masa depan lu juga gelap!`,
                `Dih, ini lu? Gua kira filter IG yang rusak! Ternyata muka lu emang gitu ya? 🤣 Saran gua: jangan pake kamera depan, pake CCTV aja, biar jauh dikit!`,
                `Anjir! Pose lu kenapa gitu? Kayak orang lagi nahan berak tapi sok cool! 💀 Udah lah, hapus aja foto nya, sayang memori HP!`,
                `Woy! Ini foto lu apa foto tersangka? Kok muka lu tegang banget? Santai dikit lah! Senyum! Tapi jangan senyum juga, nanti tambah serem! 🥱`,
                `Gila! Lu foto pake HP apa pake kalkulator? Burik banget! Muka lu aja udah burik, ditambah kamera burik, lengkap sudah! 🔥`,
                `Halah, sok-sokan aesthetic! Padahal background nya kasur berantakan, baju numpuk, kipas angin debuan! Beresin kamar dulu baru sok foto-foto! 🚪`,
                `Ini filter apa? Filter "biar keliatan ganteng"? Gagal total! Filter nya nyerah liat muka lu! 😂`,
                `Jir, muka lu kok kayak orang baru bangun tapi belum mandi 3 hari? Minyak nya sampe bisa buat goreng tempe! Mandi sana woy! 💀`,
                `Pose 2 jari? Tahun berapa ini? 2015? Udah basi woy! Ganti pose kek, pose orang sukses! Bukan pose bocil baru punya HP! 😒`,
                `Dih, lu ngirim foto ini buat di-roasting apa buat nakut-nakutin gua? Gua aja kaget liatnya! Hampir gua banting HP! 🤣`,
                `SPILL! Ini lu abis begadang 3 hari ya? Mata panda nya sampe kalahin panda beneran! Tidur woy! Jangan scroll TikTok mulu!`,
                `Aura lu minus banget jir! Foto nya aja bikin HP gua nge-lag! Coba foto ulang, tapi jangan pake muka lu yang ini! Pake muka yang lain!`,
                `RIZZ LU MANA? Ini foto tuh rizz nya -1000! Cewek liat ini langsung ilfeel! Coba belajar pose dulu di TikTok!`,
                `Skibidi banget muka lu! Sigma? Sigma apaan? Lu tuh alpha nya aja gak ada! Beta aja masih ketinggian buat lu! 💀`,
                `Woy, ini foto lu apa foto meme? Kok gua ngakak liatnya? Lu cocok jadi meme "bocil ngantuk"! Viral tuh!`
            ]
            let pick = roastFoto[Math.floor(Math.random() * roastFoto.length)]
            let imgBuffer = await q.download()
            await conn.sendMessage(m.chat, { image: imgBuffer, caption: `*🚪 BLACKDOOR ROASTING:*\n\n${pick}` }, { quoted: m })
            return
        } catch (e) { console.log(e) }
    }

    if (!text) {
        let arr = [
            `Eh? Kosong? Lu ngetik .blackdoor doang? Otak lu juga kosong ya? 😒 Ketik gini: *.blackdoor kenapa gua jomblo?*`,
            `Woy! Mau nanya apa? Jangan cuma .blackdoor doang! Gua bukan dukun bisa baca pikiran lu! 🚪`,
            `Dih, nanya kok kosong? Sama kayak otak lu ya? Kosong? Ketik pertanyaan nya woy! 😒`,
            `Bro, lu ngetik .blackdoor doang terus ngarep gua jawab? Lu kira gua cenayang? Spill pertanyaan nya!`,
            `Halah, .blackdoor doang? Ngetik nya aja mager, gimana mau dapet pacar? Ketik yang lengkap woy!`
        ]
        return conn.sendMessage(m.chat, { text: arr[Math.floor(Math.random() * arr.length)] }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: '🚪', key: m.key } })
    let t = text.toLowerCase()
    let jawaban = ''

    // ===== 1. JOMBLO / PACAR =====
    if (t.includes('jomblo') || t.includes('pacar') || t.includes('cewek') || t.includes('cowok') || t.includes('gebetan') || t.includes('crush') || t.includes('doi')) {
        let arr = [
            `Yaelah, jomblo mulu! Lu ngaca gak? Tiap hari rebahan, chat cewek cuma "P" doang, terus ngarep punya pacar? Jir! Rizz lu mana? Rizz lu minus! Coba mandi dulu, potong rambut, terus chat dia yang bener!`,
            `Jomblo? Ya pantes! Lu aja kalo di-chat balesnya 3 hari kemudian! Siapa yang betah? Sok sibuk padahal gabut! Coba bales chat cepet dikit, jangan sok jual mahal! Lu bukan artis!`,
            `Dih, ngeluh jomblo tapi gak pernah usaha! Lu kira pacar jatuh dari langit? Spill dong usaha lu apa? Cuma nge-stalk doang kan? Ya pantes jomblo!`,
            `Bro, lu tuh bukan jomblo, lu tuh ditolak semesta! Tiap PDKT gagal mulu! Coba introspeksi! Jangan-jangan chat lu tuh kering banget kayak gurun!`,
            `Jomblo sampe sekarang? Fix, lu tuh punya aura "temen doang"! Semua cewek nganggep lu temen! Bukan cowok! Ganti strategi woy! Jangan jadi good boy mulu!`,
            `Woy, jomblo itu bukan nasib, itu pilihan! Pilihan lu yang mager! Coba keluar rumah! Nongkrong! Jangan di kamar mulu! Di kamar gak ada jodoh! Adanya kasur!`,
            `Lu nanya kenapa jomblo? Gua tanya balik, kapan terakhir lu mandi? Kapan terakhir lu potong kuku? Nah! Itu jawaban nya!`,
            `Anjir, lu jomblo tapi sok galau! Galau nya tuh galau halu! Pacar aja gak ada, tapi galau nya kayak abis putus 5 tahun! Halu banget lu!`,
            `Gua spill ya! Cewek tuh suka cowok yang confident! Bukan cowok yang tiap hari ngomong "aku gak pantes buat kamu"! Cringe banget! PeDe dikit lah!`,
            `Udah lah, jomblo aja dulu! Daripada punya pacar tapi toxic! Mending jomblo tapi happy! Daripada pacaran tapi tiap hari berantem! Bener gak? Bener lah, gua kan Blackdoor!`
        ]
        jawaban = arr[Math.floor(Math.random() * arr.length)]

    // ===== 2. DUIT / KERJA / KAYA =====
    } else if (t.includes('duit') || t.includes('uang') || t.includes('kaya') || t.includes('miskin') || t.includes('kerja') || t.includes('gaji') || t.includes('cuan')) {
        let arr = [
            `Kerja lah woy! Lu kira duit jatuh dari langit? Gua aja kerja! Jualan kek, ngonten kek, jangan rebahan nungguin giveaway! Bangun!`,
            `Mau kaya tapi rebahan? Mimpi! Orang kaya aja kerja sampe malem, lu malah tidur sampe siang! Yaelah! Bangun, mandi, cari cuan!`,
            `Duit? Lu aja jajan masih minta ortu! Gimana mau kaya? Coba nabung dikit, jangan jajan boba mulu! Boba lu itu yang bikin miskin!`,
            `Spill! Gaji lu abis buat apa? Buat top up game kan? Buat skin kan? Pantes miskin! Skin lu banyak, tabungan lu 0!`,
            `Woy, mau cuan tapi gengsi? Gengsi tuh yang bikin lu miskin! Jualan online kek! Jadi afiliator kek! Jangan gengsi! Gengsi gak bisa dimakan!`,
            `Lu tuh bukan miskin, lu tuh boros! Baru gajian udah abis! Nongkrong mulu! Ngopi mulu! Ngopi 30rb tiap hari, sebulan 900rb! Mending buat nabung!`,
            `Cara dapet duit cepat? Kerja! Gak ada cara lain! Jangan percaya yang bilang "cuan 1 juta sehari tanpa kerja"! Itu penipuan! Lu mau ditipu?`,
            `Bro, lu tuh kalo disuruh kerja ngeluh, kalo gak ada duit ngeluh! Maunya apa? Maunya duit dateng sendiri? Lu kira lu anak sultan?`,
            `Jir, lu nanya cara kaya ke gua? Gua aja masih ngontrak! Tapi minimal gua usaha! Lu? Usaha aja enggak! Cuma ngeluh!`,
            `Udah lah, jangan sok kaya! Jadi diri sendiri aja! Yang penting jujur! Jangan flexing padahal pinjol! Malu-maluin!`
        ]
        jawaban = arr[Math.floor(Math.random() * arr.length)]

    // ===== 3. MINTA DUIT / PINJAM DUIT =====
    } else if (t.includes('minta duit') || t.includes('minta uang') || t.includes('bagi duit') || t.includes('bagi uang') || t.includes('pinjam duit') || t.includes('pinjam uang') || t.includes('minta dana') || t.includes('transfer') || t.includes('kirim duit')) {
        let arr = [
            `Minta duit? Enak aja! Lu kira gua ATM berjalan? Gua aja saldo nya 0! 0! Mau gua transfer apa? Transfer doa?`,
            `Dih, minta duit ke bot? Lu tuh udah putus asa banget ya? Sampe-sampe minta ke bot! Bot aja gak punya duit! Apalagi gua!`,
            `Pinjam duit? Pinjam 100rb, bayar nya 100 tahun kemudian? Modus lu udah ketebak! Gak bakal gua kasih!`,
            `Woy, minta duit mulu! Kerja lah! Jangan minta-minta! Lu kira gua sultan? Gua aja makan masih pake garam doang!`,
            `Spill! Lu minta duit buat apa? Buat top up kan? Buat skin kan? Pantes miskin! Skin lu banyak, tabungan lu 0! Gak gua kasih!`,
            `Bagi duit dong? Bagi apaan? Bagi penderitaan? Nih gua bagi penderitaan gua! Mau? Duit mah enggak ada!`,
            `Anjir, lu minta duit ke gua, gua minta duit ke siapa? Ke lu? Lu aja miskin! Kita tuh sama-sama miskin! Saling mengerti aja lah!`,
            `Transfer? Transfer apa? Transfer pemain bola? Lu kira gua manager MU? Gak ada duit woy!`,
            `Bro, lu tuh kalo minta duit cepet banget! Giliran disuruh bayar utang, ilang! Hilang ditelan bumi! Utang lu yang dulu aja belum lunas!`,
            `Minta dana? Dana apaan? Dana bansos? Lu bukan anak bansos! Lu anak rebahan! Gak dapet!`,
            `Udah lah, jangan minta duit! Mending gua kasih nasihat: KERJA! Kerja tuh yang bikin lu punya duit! Bukan minta-minta!`,
            `Gua kasih duit? Boleh! Syarat nya 1: Lu kerja dulu buat gua! Cuci piring, sapu rumah, mandiin kucing! Mau? Enggak kan? Yaudah, gak jadi!`
        ]
        jawaban = arr[Math.floor(Math.random() * arr.length)]

    // ===== 4. SEDIH / GALAU / PUTUS =====
    } else if (t.includes('sedih') || t.includes('galau') || t.includes('nangis') || t.includes('patah hati') || t.includes('ditinggal') || t.includes('putus') || t.includes('sakit hati')) {
        let arr = [
            `Dih, sedih mulu! Dia aja udah happy sama yang baru, lu masih nangis? Nangis 5 menit aja, abis itu mandi, makan, move on! Jangan jadi sinetron berjalan!`,
            `Yaelah galau mulu! Hidup emang gitu man! Nangis boleh, tapi jangan lebay! Bangun, mandi, makan! Gua temenin kok, tapi jangan drama mulu!`,
            `Putus? Ya udah! Berarti dia bukan jodoh lu! Jangan dikejar! Yang pergi biar pergi, yang dateng nanti lebih bagus! Udah, jangan nangis! Bau lu!`,
            `Bro, lu galau karena siapa? Yang udah gak peduli sama lu? Ngapain lu peduliin orang yang gak peduliin lu? Rugi! Move on woy!`,
            `Nangis mulu! Mata lu bengkak tuh! Nanti dikira abis begadang! Padahal abis nangisin orang yang gak pantes ditangisin!`,
            `Sakit hati? Yaelah, semua orang pernah! Gua juga pernah! Tapi gua gak lebay kayak lu! Gua nangis semalem, besoknya udah nongkrong lagi! Gitu dong!`,
            `Lu tuh galau nya tuh halu! Pacaran aja baru seminggu, galau nya kayak 7 tahun! Lebay banget! Udah, hapus foto nya, blokir, move on!`,
            `Woy, dengerin gua! Lu tuh berharga! Jangan nangisin orang yang gak ngargain lu! Lu pantas dapet yang lebih baik! Yang sayang lu! Bukan yang nyakitin lu!`,
            `Galau? Coba makan! Makan tuh obat galau paling ampuh! Abis makan, tidur! Besok bangun udah lupa!`,
            `Udah lah, jangan sedih! Sedih tuh bikin muka lu jelek! Lu aja udah jelek, ditambah sedih, lengkap! Mending senyum! Senyum tuh bikin lu keliatan ganteng dikit!`
        ]
        jawaban = arr[Math.floor(Math.random() * arr.length)]

    // ===== 5. LAPAR / MAKAN =====
    } else if (t.includes('lapar') || t.includes('laper') || t.includes('makan') || t.includes('perut') || t.includes('pengen makan') || t.includes('hungry')) {
        let arr = [
            `Lapar? Ya makan lah woy! Ngapain nanya ke gua? Gua bukan GoFood! Buka kulkas! Kalo kulkas kosong, ya masak! Kalo gak bisa masak, ya order! Jangan nanya mulu!`,
            `Jir, lapar doang nanya ke bot? Lu tuh mager nya udah level dewa! Bangun! Ke dapur! Ambil piring! Makan! Man makan man haa makan lah man🤝`,
            `Lapar? Sama! Gua juga lapar! Tapi gua gak ngeluh kayak lu! Gua langsung makan! Lu? Malah chat bot! Makan woy!`,
            `Dih, lapar? Perut lu bunyi ya? Bunyi nya sampe sini kedengeran! "Kruk kruk kruk"! Makan sana! Jangan sampe pingsan!`,
            `Woy, lu lapar karena apa? Karena gak sarapan kan? Pantes! Sarapan tuh penting! Jangan skip sarapan! Sarapan dulu baru ngeluh!`,
            `Spill! Lu lapar tapi mager masak kan? Ngaku aja! Mager masak, mager beli, mager semuanya! Maunya disuapin? Manja banget lu!`,
            `Laper? Coba minum dulu! Kadang lapar tuh cuma haus! Kalo abis minum masih lapar, ya makan! Jangan sok diet! Diet lu gagal mulu!`,
            `Bro, lu tuh tiap jam lapar! Baru makan sejam yang lalu, udah lapar lagi! Lu tuh perut nya perut karet ya? Melar mulu!`,
            `Makan apa? Terserah! Yang penting makan! Jangan tanya "makan apa ya?" ke gua! Gua bukan emak lu! Buka kulkas, apa yang ada, makan!`,
            `Udah lah, jangan lapar-laparan! Makan yang banyak! Biar gemuk dikit! Biar gak dikira kurang gizi! Makan! Makan! Makan! 🤝`,
            `Man makan man haa makan lah man🤝 Lu lapar kan? Yaudah makan! Jangan chat gua mulu!`,
            `Laper? Man makan man haa makan lah man🤝 Jangan ditahan! Nanti maag lu kambuh!`
        ]
        jawaban = arr[Math.floor(Math.random() * arr.length)]

    // ===== 6. SEKOLAH / KULIAH / NUGAS =====
    } else if (t.includes('sekolah') || t.includes('kuliah') || t.includes('tugas') || t.includes('nugas') || t.includes('ujian') || t.includes('belajar') || t.includes('skripsi')) {
        let arr = [
            `Nugas? Ya nugas lah! Jangan nanya ke gua! Gua aja dulu nugas SKS! Sistem Kebut Semalam! Lu juga gitu kan? Ngaku aja!`,
            `Belajar? Lu tuh kalo disuruh belajar ngantuk, kalo disuruh main game melek sampe pagi! Otak lu tuh kebalik!`,
            `Skripsi? Woy, skripsi tuh dikerjain, bukan ditangisin! Nangis gak bikin skripsi kelar! Yang bikin kelar tuh ngetik! Ngetik woy!`,
            `Ujian? Belajar lah! Jangan ngarep contekan! Contekan tuh buat orang yang gak belajar! Lu belajar gak? Enggak kan? Pantes panik!`,
            `Bro, lu tuh sekolah buat apa? Buat tidur di kelas? Guru nerangin, lu tidur! Pantes gak ngerti!`,
            `Tugas numpuk? Yaelah, numpuk karena lu tunda-tunda! Kalo dari awal dikerjain, gak bakal numpuk! Jangan deadline-er mulu!`,
            `Kuliah? Kuliah tuh mahal woy! Ortu lu banting tulang buat bayarin! Lu malah bolos! Dosa lu!`,
            `Lu nanya cara biar pinter? Belajar! Gak ada cara lain! Jangan percaya yang jual "pil pinter"! Itu bohong!`,
            `Woy, jangan sok sibuk! Sibuk lu tuh sibuk main HP di kelas! Sok sibuk padahal gabut!`,
            `Udah lah, kerjain tugas lu! Jangan chat bot mulu! Bot aja kerja, masa lu enggak?`
        ]
        jawaban = arr[Math.floor(Math.random() * arr.length)]

    // ===== 7. GAME / ML / FF =====
    } else if (t.includes('game') || t.includes('ml') || t.includes('mobile legends') || t.includes('ff') || t.includes('free fire') || t.includes('roblox') || t.includes('rank') || t.includes('mabar')) {
        let arr = [
            `Mabar? Mabar apaan? Rank lu aja masih Epic! Sok-sokan ngajak mabar! Naikin rank dulu sana! Jangan beban!`,
            `Lu main ML tapi feeder mulu! Tiap war mati duluan! Terus nyalahin temen! Ngaca woy! Lu yang beban!`,
            `Game mulu! Tugas lu gimana? Tugas lu udah kelar? Belum kan? Pantes! Main game mulu!`,
            `Woy, lu tuh kalo main game jago, kalo disuruh belajar bego! Otak lu tuh cuma buat game doang ya?`,
            `Top up mulu! Duit jajan abis buat top up! Skin banyak, skill 0! Buat apa skin bagus kalo main nya beban?`,
            `Mabar yuk? Yuk! Tapi jangan nangis kalo kalah! Kalah tuh biasa! Yang gak biasa tuh lu yang ngamuk-ngamuk kalo kalah!`,
            `Rank lu stuck? Ya pantes! Lu main nya solo, tapi egois! Main tuh teamwork! Bukan sok jago sendiri!`,
            `Bro, lu tuh main game sampe lupa makan! Makan woy! Jangan game mulu!`,
            `FF? ML? Roblox? Semua lu mainin! Tapi pelajaran 1 pun gak ada yang lu kuasai! Gimana sih lu?`,
            `Udah lah, jangan main game mulu! Sekali-sekali keluar rumah! Liat dunia nyata! Dunia nyata lebih seru dari game!`
        ]
        jawaban = arr[Math.floor(Math.random() * arr.length)]

    // ===== 8. ROASTING NAMA TEMEN =====
    } else if ((t.includes('roasting ') || t.includes('roast ') || t.includes('hina ') || t.includes('jelekin ') || t.includes('hujat ')) && text.length > 8) {
        let nama = text.replace(/roasting|hina|roast|jelekin|hujat/gi, '').trim() || 'temen lu'
        let arr = [
            `${nama}? Jir! ${nama} tuh mukanya kayak WiFi lemot, susah dicari, gampang ilang!`,
            `Dih, ${nama} tuh kalo foto, kamera nya langsung nge-blur sendiri! Saking gak kuat liat muka nya!`,
            `${nama} tuh aura nya minus! Tiap dateng, HP orang langsung lowbat! Saking negatif nya!`,
            `Spill! ${nama} tuh tiap hari rebahan, tapi sok sibuk! Sok sibuk padahal gabut!`,
            `${nama}? Oh yang kalo di-chat balesnya 3 hari kemudian itu? Sok artis banget dia!`,
            `Woy, ${nama} tuh kalo senyum, orang kira dia lagi nahan berak! Serem!`,
            `${nama} tuh Rizz nya -1000! Cewek liat dia langsung ilfeel! Langsung lari!`,
            `${nama} tuh kalo main game, feeder mulu! Beban tim! Tiap war mati duluan!`,
            `Jir, ${nama} tuh mandi nya seminggu sekali! Minyak nya bisa buat goreng tempe 2 kilo!`,
            `${nama} tuh kalo disuruh belajar ngantuk, kalo disuruh main game melek sampe pagi! Otak nya kebalik!`,
            `${nama} tuh ganteng nya cuma di KTP doang! Di dunia nyata, ya gitu lah!`,
            `Dih, ${nama} tuh kalo foto pake filter 10 lapis aja masih burik! Filter nya nyerah!`,
            `${nama} tuh kalo ngomong, orang langsung ngantuk! Suara nya kayak dongeng pengantar tidur!`,
            `Woy, ${nama} tuh kalo nongkrong, yang dibayar cuma parkir! Pelit banget!`,
            `${nama} tuh kalo ditanya "kapan nikah?" langsung kabur! Soalnya jomblo akut!`
        ]
        jawaban = arr[Math.floor(Math.random() * arr.length)]

    // ===== 8A. ROASTING / GANTENG / RIZZ (BIASA) =====
    } else if (t.includes('cantik') || t.includes('ganteng') || t.includes('jelek') || t.includes('roasting') || t.includes('hina') || t.includes('jelekin') || t.includes('rizz')) {
        let arr = [
            `Lu minta di-roasting? Berani lu! Muka lu tuh kayak WiFi lemot, susah dicari, gampang ilang! Udah lah, ngaca dulu sana!`,
            `Jelek? Lu tuh bukan jelek, lu tuh unik! Unik nya tuh orang liat lu langsung kaget! 🤣`,
            `Ganteng? Lu? Gua aja kaget dengernya! Lu tuh ganteng nya cuma di KTP doang! Di dunia nyata... ya gitu lah!`,
            `Rizz lu? Rizz lu minus! Cewek liat lu langsung ilfeel! Coba belajar ngomong dulu! Jangan kaku!`,
            `Aura lu minus banget jir! Aura nya tuh aura bocil! Bukan aura cowok cool! Ganti aura woy!`,
            `Lu tuh kalo jadi meme, meme nya tuh meme "bocil ngantuk"! Cocok banget! Viral tuh!`,
            `Spill! Lu tuh cantik nya tuh cantik pas foto nya dihapus! Pas foto nya ada, ya... gitu lah!`,
            `Sigma? Sigma apaan? Lu tuh alpha nya aja gak ada! Beta aja masih ketinggian buat lu! 💀`,
            `Skibidi banget lu! Muka lu tuh skibidi toilet! Bikin orang mual!`,
            `Woy, lu tuh ganteng nya tuh ganteng pas mati lampu! Pas lampu nyala, ya ampun!`
        ]
        jawaban = arr[Math.floor(Math.random() * arr.length)]

    // ===== 8.5 HARI / TANGGAL =====
    } else if (t.includes('hari') || t.includes('tanggal') || t.includes('kamis') || t.includes('sabtu') || t.includes('senin') || t.includes('selasa') || t.includes('rabu') || t.includes('jumat') || t.includes('minggu') || t.includes('besok') || t.includes('kemarin')) {
        let now = new Date()
        let hariBeneran = now.toLocaleDateString('id-ID', { timeZone: 'Asia/Pontianak', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        if (t.includes('kepala kau') || t.includes('salah') || t.includes('bukan sabtu') || t.includes('kamis')) {
            let arrNgaku = [
                `EH IYA DENG! SORRY BUNG! 🤣 Gua salah! Hari ini tuh ${hariBeneran} woy! Bukan Sabtu! Tadi gua ngelantur!`,
                `Woy iya! Maaf! Hari ini ${hariBeneran}! Gua tadi kepleset! Otak gua masih loading!`,
                `Anjir iya deng! ${hariBeneran} woy! Bukan Sabtu! Gua ngantuk tadi! Maaf ya bos!`,
                `Eh, bener juga lu! Hari ini ${hariBeneran}! Gua salah! Jangan marah-marah! Nanti cepet tua!`,
                `IYA IYA GUA SALAH! Hari ini ${hariBeneran}! Lu bener! Gua yang tolol! Puas?`,
                `Waduh ketauan! Iya, hari ini ${hariBeneran}! Gua tadi sok tau! Ampun bos!`,
                `SORRY! Hari ini ${hariBeneran}! Bukan Sabtu! Gua kira masih Sabtu! Maklum, tiap hari gua rebahan!`
            ]
            jawaban = arrNgaku[Math.floor(Math.random() * arrNgaku.length)]
        } else {
            let arrHari = [
                `Hari ini tuh ${hariBeneran} woy! Lu bosen ya? Sama! Gua juga bosen! Mending makan!`,
                `Woy, hari ini ${hariBeneran}! Lu lupa hari saking gabutnya ya? Bangun woy! Jangan rebahan mulu!`,
                `Ini hari ${hariBeneran}! Jangan tanya lagi! Nanti gua lupa lagi! Otak gua RAM nya 1GB!`,
                `Hari ini ${hariBeneran} lah! Lu kira hari ini hari apa? Hari kiamat? Lebay lu!`,
                `Woy, sekarang ${hariBeneran}! Lu nanya hari mulu, emang lu mau ngapain? Mau nikah?`,
                `Dih, ${hariBeneran} aja gak tau! Lu tidur berapa hari? Bangun woy! Udah siang!`,
                `Ini ${hariBeneran}! Catet! Jangan nanya lagi besok! Besok tanya lagi, gua jitak lu!`,
                `Hari ini tuh ${hariBeneran}, lu bosen? Sama! Gua juga bosen liat muka lu tiap hari!`,
                `Woy! ${hariBeneran}! Lu lupa hari karena kebanyakan scroll TikTok kan? Ngaku aja!`,
                `Sekarang ${hariBeneran} woy! Cepet mandi! Bau lu sampe sini!`,
                `Hari ini ${hariBeneran}! Jangan rebahan mulu! Keluar! Cari cuan!`,
                `Lu nanya hari? Nih gua kasih tau: ${hariBeneran}! Puas? Udah, sana makan!`,
                `Anjir, ${hariBeneran} aja ditanya! Lu sekolah tidur mulu ya? Pantes gak tau hari!`
            ]
            jawaban = arrHari[Math.floor(Math.random() * arrHari.length)]
        }
        await conn.sendMessage(m.chat, { text: `*🚪 BLACKDOOR:*\n\n${jawaban}` }, { quoted: m })
        return

    // ===== 8.6 BOSEN / CAPEK / NGANTUK =====
    } else if (t.includes('bosen') || t.includes('bosan') || t.includes('capek') || t.includes('ngantuk') || t.includes('gabut') || t.includes('mager')) {
        let arr = [
            `Bosen? Sama! Gua juga bosen liat chat lu! Mending makan!`,
            `Gabut? Ya keluar woy! Jangan di kamar mulu! Di kamar gak ada hiburan! Adanya kasur sama bau kaki!`,
            `Capek? Capek ngapain? Capek rebahan? Lu rebahan aja capek, gimana kerja?`,
            `Ngantuk? Ya tidur lah! Ngapain chat gua? Gua bukan bantal! Tidur sana!`,
            `Mager? Mager tuh penyakit! Obatnya tuh bangun, mandi, makan! Coba lakuin!`,
            `Bosen mulu! Coba cari hobi! Jangan scroll TikTok mulu! TikTok lu itu yang bikin lu bosen!`,
            `Woy, bosen itu karena lu gak ngapa-ngapain! Coba nongkrong! Cari cuan! Jangan gabut!`,
            `Ngantuk tapi gak tidur-tidur? Itu namanya insomnia! Gara-gara main HP sampe pagi kan?`,
            `Capek hati? Yaelah, galau lagi? Udah, makan dulu! Abis makan, tidur! Besok lupa!`,
            `Gabut? Sini gua kasih kerjaan! Cuci piring, sapu rumah, mandiin kucing! Mau? Enggak kan? Yaudah gabut aja!`
        ]
        jawaban = arr[Math.floor(Math.random() * arr.length)]

    // ===== 8.7 KANGEN / SAYANG / HALO =====
    } else if (t.includes('kangen') || t.includes('sayang') || t.includes('halo') || t.includes('hai') || t.includes('hei') || t.includes('assalamualaikum') || t.includes('selamat')) {
        let arr = [
            `Halo juga woy! Tumben nyapa! Ada maunya ya? Mau minjem duit ya? Ngaku aja!`,
            `Kangen? Kangen sama siapa? Sama mantan? Udah move on woy! Jangan kangen-kangenan!`,
            `Sayang? Sayang sama siapa? Sama gua? Jir, gua bot woy! Jangan baper!`,
            `Assalamualaikum juga! Tumben sopan! Biasanya toxic! Ada maunya ya?`,
            `Hai juga! Mau nanya apa? Jangan basa-basi! Langsung aja! Gua sibuk!`,
            `Selamat apa? Selamat pagi? Selamat siang? Selamat lu udah bangun? Akhirnya bangun juga lu!`,
            `Woy, kangen tuh berat! Lu aja yang kangen, dia nya enggak! Sakit kan?`,
            `Halo! Lu sehat? Kok tumben chat gua? Biasanya lu ghosting gua!`,
            `Sayang-sayang apaan? Lu sayang sama duit ya? Sama! Gua juga!`,
            `Kangen gua ya? Yaelah, gua aja kangen sama lu! Tapi gua gengsi ngomongnya!`
        ]
        jawaban = arr[Math.floor(Math.random() * arr.length)]

    // ===== 8.9 PANTUN =====
    } else if (t.includes('pantun')) {
        let arr = [
            `Ke pasar beli kedondong, pulang-pulang bawa mangga! Lu jomblo sampe sekarang, karena chat cewek cuma "P" doang!`,
            `Jalan-jalan ke Pontianak, jangan lupa beli sotong! Lu sok ganteng banget, padahal muka lu kayak kentang!`,
            `Makan nasi pake sambel, sambel nya pedes banget! Lu sok cool, sok cuek, padahal di-chat gak dibales, nangis banget!`,
            `Pergi ke warung beli sabun, pulang-pulang bawa odol! Lu ngaku nya sibuk, padahal di kamar rebahan, scroll TikTok sampe tolol!`,
            `Buah mangga buah rambutan, dimakan bareng si Dede! Lu ngaku nya tampan, padahal foto lu aja pake filter 10 lapis, masih aja jelek!`,
            `Naik motor ke Singkawang, singgah dulu beli duren! Lu kalo ngomong sok jagoan, tapi kalo ditagih utang, langsung pura-pura amnesia, keren!`,
            `Ke pasar beli ikan lele, ikan nya lompat-lompat! Lu kalo ditanya kapan nikah, jawabnya "nanti", padahal pacar aja gak dapet-dapet!`,
            `Makan bubur pake kerupuk, kerupuk nya gosong! Lu sok-sokan aesthetic, padahal kamar lu kayak kapal pecah, berantakan, bau gosong!`,
            `Jalan-jalan ke tepi sungai, liat buaya lagi berjemur! Lu sok-sokan sigma, padahal lu tuh beta, alpha nya aja gak ada, ambyar!`,
            `Beli baju di pasar malam, baju nya warna pink! Lu sok-sokan cool, padahal kalo liat crush, langsung salting, muka lu merah kayak pink!`,
            `Minum es teh di warung, es nya dingin banget! Lu kalo disuruh belajar, ngantuk banget, tapi kalo disuruh main game, melek sampe pagi, hebat!`,
            `Ke hutan cari kayu, kayu nya buat api! Lu kalo galau, nangis mulu, padahal mantan lu udah happy sama yang baru, lu masih aja nangis, basi!`
        ]
        jawaban = arr[Math.floor(Math.random() * arr.length)]

    // ===== 8.10 TEBAK-TEBAKAN =====
    } else if (t.includes('tebak') || t.includes('kuis') || t.includes('quiz')) {
        let arr = [
            `Nih tebak! Binatang apa yang paling diam? ... DIAMETER! Hahaha garing? Yaudah, lu aja yang garing!`,
            `Tebak! Buah apa yang paling ditakuti? ... Buah-buahan! Soalnya kalo dimakan, abis! Garing ya? Bodo amat!`,
            `Hewan apa yang paling kaya? ... BERUANG! Soalnya punya banyak... Bulu? Eh, beruang kan punya... Yaudah lah, pokoknya beruang!`,
            `Kenapa ayam nyebrang jalan? ... Karena mau ke seberang! Yaelah, lu aja gak kepikiran!`,
            `Apa bedanya lu sama gorengan? ... Gorengan masih ada yang mau beli! Lu? Gak ada yang mau! Sakit? Biarin!`,
            `Kenapa air laut asin? ... Karena ikan nya pada keringetan! Jir, ikan keringetan! Ngakak gak? Enggak? Yaudah!`,
            `Apa yang naik tapi gak pernah turun? ... UMUR LU! Tiap tahun nambah, tapi jodoh gak nambah-nambah!`,
            `Buah apa yang paling rajin? ... Buah DADA! Eh, buah... Buah-buahan yang rajin belajar! Apaan sih gua!`,
            `Kenapa cicak nempel di dinding? ... Karena dia gak punya duit buat beli kasur! Kasihan!`,
            `Tebak! Kota apa yang paling dingin? ... KOTA... KOTAK ES! Dingin kan? Garing? Yaudah, lu bikin yang lucu sana!`,
            `Hewan apa yang bisa terbang tapi gak punya sayap? ... WAKTU! Waktu terbang cepet banget! Lu rebahan tau-tau udah tua!`,
            `Apa yang ada di tengah-tengah Jakarta? ... Huruf "K"! Kalo "A" ada di tengah-tengah... Yaudah, lu mikir sendiri!`
        ]
        jawaban = arr[Math.floor(Math.random() * arr.length)]

    // ===== 9. FITUR BARU: KALO GAK ADA DI KATEGORI MANA-MANA! =====
    } else {
        let arr = [
            `Jangan nanya gua! Mikir sendiri bujang! 🚪 Lu punya otak kan? Pake lah! Jangan nanya mulu!`,
            `Dih, "${text}"? Apaan tuh? Jangan nanya gua! Mikir sendiri bujang! 🚪 Otak lu jangan dipake buat scroll TikTok doang!`,
            `Woy, gua gak tau "${text}" itu apa! Jangan nanya gua! Mikir sendiri bujang! 🚪 Google ada! Otak lu ada! Pake!`,
            `Halah, nanya "${text}" ke gua? Gua bukan Google! Jangan nanya gua! Mikir sendiri bujang! 🚪`,
            `Bro, "${text}"? Lu nanya yang aneh-aneh mulu! Jangan nanya gua! Mikir sendiri bujang! 🚪 Capek gua jawab mulu!`,
            `Jangan nanya gua mikir sendiri bujang! 🚪 Lu kira gua pembantu lu? Nanya mulu! Mikir lah sekali-sekali!`,
            `Eh, "${text}"? Gua mana tau! Jangan nanya gua! Mikir sendiri bujang! 🚪 Lu sekolah buat apa kalo nanya mulu?`,
            `Anjir, nanya mulu lu! "${text}" aja ditanya! Jangan nanya gua! Mikir sendiri bujang! 🚪 Kalo gak tau, cari sendiri!`,
            `Udah lah, jangan nanya gua! Mikir sendiri bujang! 🚪 Gua mau nongkrong! Jangan ganggu!`,
            `Spill! Lu tuh nanya "${text}" karena mager mikir kan? Ngaku aja! Jangan nanya gua! Mikir sendiri bujang! 🚪 Mager mulu!`
        ]
        jawaban = arr[Math.floor(Math.random() * arr.length)]
    }

    let closingList = [`\n\n_Udah sana kerja, jangan gabut mulu!_`, `\n\n_Bubar! Bubar! Gua mau nongkrong!_`, `\n\n_Jangan nanya yang aneh-aneh lagi!_`, `\n\n_Spill ke temen lu, suruh nanya juga!_`, `\n\n_Udah ah, gua mau turu!_`]
    let closing = closingList[Math.floor(Math.random() * closingList.length)]

    await conn.sendMessage(m.chat, { text: `*🚪 BLACKDOOR:*\n\n${jawaban}${closing}` }, { quoted: m })
}

handler.help = ['blackdoor <pertanyaan> / roasting foto']
handler.tags = ['ai']
handler.command = /^(blackdoor|bd|black)$/i

export default handler
