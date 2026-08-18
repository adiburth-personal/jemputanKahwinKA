# VERDICT , Hakim Panel (mode PILIH 1)

Projek: `/Users/adizaini/miniProjects/rsvpKhadizahAnwar`
Fan-in: 3/3 (P1 warna, P2 interaksi, P3 pengalaman). Judge context bersih.

---

## BAHAGIAN 1 , Banding panel (sepakat, bercanggah, selesai)

### Isyarat KUAT (3/3 sepakat, terima terus)
1. **Purple masuk sebagai AKSEN sahaja**, base kraft/krim/maroon/emas kekal DOMINAN. Tiada latar body bertukar ungu. (P1 §4, P2 keseluruhan, P3 §3)
2. **Chroma rendah wajib** , aubergine desatur, hue ~308-316, chroma OKLCH <=0.08. Tiada purple neon. (P1 §2, P3 §3-5)
3. **Emas/rose-gold ialah jambatan sebenar** antara kad dan web, dan `--color-gold` sedia ada sudah sepadan emas kad (#C9A876). Tiada token emas baru. (P1 §2 nota, P3 §1)
4. **Butang "Sayang" create-only** ialah teras interaksi , collection baru `/sayang` (bukan buka `allow update` pada `/rsvp`). (P2 ciri 1, P3 §2, fakta pack §4)
5. **Nama penuh + nama tempat wajib** , jurang maklumat sebenar, bukan hiasan. Font boleh baca, bukan cursive sahaja. (P3 keutamaan #1, fakta pack §5)
6. **Slop tulen DIBUANG**: tiada confetti/hujan kelopak/sparkle berterusan, tiada spotlight rawak berkala, tiada bunyi/autoplay. (P2 buang #6, P3 §3 STOP)
7. **Semua ciri baru**: `.textContent` (XSS), transform/opacity (bateri), hormat `prefers-reduced-motion`, sasaran >=44px, jangan sentuh `/rsvp`/`firebaseConfig.js`/`pengantin.html`. (3/3)

### Percanggahan (2) dan penyelesaian

**Percanggahan (a): luas guna purple.**
P3 = hero SAHAJA (plus mungkin 1 varian kad); amaran keras "jangan sebar". P1 = peta lebih luas (retune plum auto merentas ornamen + kad v2 di 3 fail, hairline lilac, monogram purple-deep, varian kad v4 aubergine).

**Selesai: AMBIL token P1 (rigor, WCAG dikira), TADBIR letak dengan disiplin P3.**
Logik: peta "luas" P1 sebenarnya masih semua tier <=5% berat visual, dan retune `--color-plum` ialah satu titik ubah yang mengalir pasif. Ketakutan sebenar P3 ialah BERAT VISUAL + rasa "dua tema", bukan bilangan token. Jadi:
- Purple **ditumpukan di hero** (zon "kenal 1 saat" P3), bukan disebar rata.
- Di tempat lain purple hanya muncul di mana ia SUDAH wujud (plum diretune mengalir ke ornamen + kad v2), zero elemen ungu baru dilukis merata.
- **Kad v4 aubergine gelap** diterima (P1 DAN P3 sokong sebagai satu momen "rasa kad rasmi"), tapi 1-dalam-5 sahaja, bukan dominan.
- TOLAK penambahan serentak monogram purple-deep + hairline lilac + segala di setiap sudut. Hero dapat SATU gubahan ungu tumpu (eyebrow/ornamen + satu hairline lilac + emas dinaikkan), bukan tiga benda ungu berselerak.

**Percanggahan (b): bilangan interaktiviti.**
P3 = kurat ke 1, maks 2. P2 = bina 4, buang yang slop. User MINTA 4 jenis (sayang, efek visual, sentuhan, kejutan) dan nak rasa lebih hidup/wow.

**Selesai: BINA 4 ciri P2 (mereka petakan TEPAT ke 4 ask user), di bawah tadbir restraint P3.**
Logik yang meleraikan: P2 punya "4" bukan 4 efek ambient rawak, ia pemetaan berdisiplin ke 4 kategori user, dan setiap satu ialah *earned motion* (terikat peristiwa sebenar):
- Sayang button = ask (a) sayang
- Heart-burst masa tekan = ask (b) efek visual
- Tap kad , overlay fokus = ask (c) sentuhan (DAN laluan aksesibiliti orang tua ke butang sayang besar pegun)
- Kaunter jujur "N ucapan, M sayang" = ask (d) kejutan (0 gerak, hampir 0 kos)

Bila diringkas jadi "permukaan interaksi sebenar": sayang+burst = 1 unit (burst ialah maklum balas butang), overlay = 1 unit (merangkap enabler aksesibiliti), kaunter = paparan statik (bukan gerak), tambah 1 micro-motion hero muat sekali. Jadi kiraan gerak AMBIEN sebenar = ~1 (hero load), tepat dalam had P3. Amaran P3 (busy, "banyak benda menari") sudah dijaga sebab P2 sendiri bunuh slop tulen (#6). Menghadkan ke 1-2 akan UNDER-deliver lawan ask eksplisit user dan berisiko "terasa tak berubah" , tepat apa yang user tak mahu.
**Syarat tadbir P3 dikuatkuasa pada EKSEKUSI**: count per-kad mesti bisik (tiada nombor bila 0, taip kecil), maks 2-3 aksen kelihatan serentak, heart-burst kecil (4-6 hati, 800ms, gated).

---

## BAHAGIAN 2 , PAKEJ DESIGN MUKTAMAD

### (a) Token warna purple final + di mana dipakai

Ambil set P1 (nilai OKLCH disahkan render sRGB + kontras dikira). Tambah dalam blok `:root` `styles.css` selari `--color-plum`.

| Token | OKLCH | Hex approx | Peranan |
|---|---|---|---|
| `--color-plum` (LARAS dari H320) | `oklch(46% 0.078 313)` | ~#6B4A73 | Aksen mid: border kad, ornamen `.ornamen--plum`, kad ucapan v2 (auto ikut) |
| `--color-purple-deep` | `oklch(30% 0.06 312)` | #382443 | Teks/heading ungu gelap atas latar cerah (aksen hero kecil) |
| `--color-lilac` | `oklch(72% 0.055 308)` | #AE9CC0 | Hiasan cerah: hairline hero, garis pemisah, teks/border atas kad gelap |
| `--color-lilac-wash` | `oklch(90% 0.03 308)` | #E3D9EE | Wash sangat cerah: hover (opsyen) |
| `--color-aubergine` | `oklch(33% 0.05 314)` | #3F2D47 | Latar varian kad GELAP v4 (padan latar kad rasmi) |

`--color-gold` KEKAL (sudah sepadan emas kad, tiada token emas baru).

**index.html** (zon tumpuan purple , "kenal 1 saat"):
- Hero: `.ornamen--plum` (auto kad-tepat lepas retune). SATU hairline `--color-lilac` sebagai gema motif arch kad. Aksen ungu KECIL di puncak (eyebrow atau titik bunga guna `--color-purple-deep`, kontras 12.85:1 atas cream). Peranan ornamen EMAS dinaikkan sikit (jambatan rose-gold).
- KEKAL: body kraft, kad cream, `nama-script`/`nama-serif`/butang = maroon, `.pil-hadir`/kilauan = gold, stat = maroon.

**ucapan.html**:
- Kad v2 "plum pudar" , auto kad-tepat lepas retune, tiada kod baru.
- TAMBAH kad **v4 aubergine gelap** (bg `--color-aubergine` + teks putih-lilac #EDE6F0 + aksen gold), kontras 10:1. Perlu `BILANGAN_VARIASI = 4 -> 5` + hash `hash(entri.id) % 5` (`ucapan.js:63`). 1-dalam-5, bukan dominan.
- Butang sayang: border/aksen guna `--color-plum` (P2 §1f).
- KEKAL: header maroon, kilauan `.ucapan-kad--baru` = gold.

**pengantin.html**: TIADA purple ditambah (kekangan #9). Warisi `--color-plum` diretune secara pasif; sahkan tiada elemen bergantung rupa plum lama.

### (b) Ciri interaktif final (ambil dari P2, lensa menang untuk interaksi)

**1. Butang Sayang + count** (spec P2 §1a-1f)
- Collection baru `/sayang/{doc}` = `{ ucapanId, masa }`, `allow read: if true`, `allow create` validasi `hasOnly(['ucapanId','masa'])` + `ucapanId is string` 1-64 aksara + `masa == request.time`, `allow update, delete: if false`. Letak SEBELUM catch-all. `/rsvp` tak disentuh.
- `onSnapshot(collection(db,'sayang'))` , tally ke `Map` keyed `ucapanId`. `lukisSayang()` lukis count ke SEMUA `.ucapan-kad` (selamat copy1/copy2), dipanggil di HUJUNG `render()`.
- Butang dalam `binaKad`: `<button.sayang-btn>` (♥ + span count), `textContent` sahaja, min 44px, `aria-pressed`, `aria-label` jujur.
- Klik = event delegation atas `#ucapanSenarai`. Optimistik + rollback bila `addDoc` gagal (jujur). Import `addDoc, serverTimestamp`.
- Anti-spam localStorage `sayangDitekan.v1` (nota jujur: boleh dipintas, OK untuk majlis, JANGAN over-engineer auth).

**2. Tap kad , overlay fokus baca** (P2 ciri 2) , ask (c) sentuhan
- `#fokusOverlay` fixed inset:0 (LUAR `#ucapanSenarai`, diff-engine tak sentuh) + `#fokusKad` besar pegun, `role="dialog" aria-modal="true"`, butang tutup `×` >=44px, fokus dipindah masa buka.
- Buka: isi teks lewat `textContent`, `body{overflow:hidden}`, `overscroll-behavior:contain`, marquee `is-pause` (jimat bateri). Tutup: tap latar / `×` / `Escape`.
- Ada butang Sayang BESAR pegun , laluan utama orang tua.

**3. Kaunter jujur "N ucapan, M sayang"** (P2 ciri 3) , ask (d) kejutan
- `lukisKaunter()` dari dua listener, nombor 100% sebenar. Degrade: 0 sayang , "N ucapan" sahaja; 0 ucapan , blok tersembunyi. Sifar gerak.

**4. Heart-burst masa tekan** (P2 ciri 4) , ask (b) efek visual
- 4-6 hati kecil naik+pudar ~800ms, CSS transform sahaja, node auto-buang, **gated `if (REDUCED.matches) return`**. Butang `position:relative`.

**+ Micro-motion hero** (P3 #4): fade-in/gubahan lembut SEKALI masa load, transform/opacity, fallback statik reduced-motion. Momen "wow 3 saat pertama".

**KEKAL**: kilauan emas `.ucapan-kad--baru` (`styles.css:483-501`) , earned motion sedia ada, jangan ubah.

### (c) Perubahan nama penuh / tempat
- **index.html**: tambah "Khadizah Binti Razali" & "Muhammad Anwar Bin Sawal" dalam font BOLEH BACA (serif/sans, bukan Great Vibes sahaja). Header script "Khadizah & Anwar" boleh kekal sebagai flourish, tapi nama penuh mesti hadir dalam font legible.
- **index.html**: tambah nama tempat **"ADH Hall KM"** (kini terus TIADA , jurang paling ketara).
- Selaras `ucapan.html:25` (header) + footer `ucapan.html:53` + footer `index.html:116`.
- Tarikh kekal (sudah sepadan: Ahad 30 Ogos 2026 / 17 Rabiulawal 1448H). Masa web (12tgh-6ptg) kekal , detail tambahan, bukan percanggahan.

### (d) Senarai semak penerimaan final (gabung P3 §5 + tambahan)
1. Ujian kenal 1 saat: hero sebelah kad , "majlis sama" via purple + rose-gold di puncak hero.
2. Dominasi base: kraft/krim/maroon/gold dominan; purple <=15-20% berat, aksen sahaja.
3. Satu keluarga hue baru: aubergine desatur H~313, chroma <=0.08; tiada neon.
4. Kelengkapan nama: nama penuh dalam font boleh baca + "ADH Hall KM" hadir (index + ucapan diselaras).
5. Kebolehbacaan: badan/label >=16px mobile; setiap teks/latar >=4.5:1; purple-untuk-teks hanya gelap-atas-terang.
6. Restraint interaktif: semua ciri EARNED (terikat peristiwa), tiada confetti/hujan kelopak/bunyi/autoplay, tiada apa apa berdenyut/bersinar berterusan. (4 sentuhan dibenarkan sebab setiap satu earned + petakan ke ask user, bukan ambient.)
7. Prestasi + gerakan sopan: semua transform/opacity, hormat reduced-motion (fallback statik), dalam bajet marquee/`MAKS_KAD`.
8. Ciri baru selamat: create-only collection + `.textContent` (tiada `.innerHTML`), aria-label + keadaan kelihatan + sasaran >=44px.
9. Butang jelas: CTA maroon pejal, label Melayu santun, sasaran besar; status RSVP tak disampaikan warna sahaja.
10. Ujian "masih majlis kahwin sopan": mak cik 60 tahun baca semua maklumat, tekan RSVP tanpa keliru, tak rasa gimik.
11. (TAMBAH) Integriti count: count dari Map pusat + `lukisSayang()` di HUJUNG `render()`, JANGAN per-node , elak desync copy1/copy2 + kad baru di-prepend.
12. (TAMBAH) Keselamatan scroll overlay: `body{overflow:hidden}` + `overscroll-behavior:contain`; marquee pause masa overlay buka.

### (e) TIDAK dibuat (eksplisit + kenapa)
- **Hujan kelopak / confetti / sparkle berterusan** , penanda slop #1, beban bateri, bersaing bacaan. (P2 buang #6, P3 STOP)
- **Spotlight rawak berkala** , perlu timer gerak TANPA sebab, langgar earned/honest motion. (P2 buang #6)
- **Bunyi / autoplay** , (P3 STOP).
- **Latar body purple / tema web gelap** , bunuh identiti base panas, langgar kekangan #11. (P3 STOP)
- **Buka `allow update` pada `/rsvp`** untuk `sayangCount` , race condition + abuse, keputusan keselamatan sengaja. Guna `/sayang` create-only. (fakta pack §4)
- **Token emas baru** , `--color-gold` sedia ada sepadan #C9A876. (P1 §2)
- **Purple pada CTA / tajuk / body** , buat rasa "dua tema", maroon pegang struktur. (P1 §4, P3)
- **Easter egg / kejutan gimik** , risiko slop tertinggi; kaunter jujur layan ask "kejutan" dengan lebih elegan. (P3 #5 skip)
- **Besarkan kad di tempat masa tap** , rosak tinggi track marquee + diff-engine; guna overlay. (P2 ciri 2)
- **Purple dalam pengantin.html** , kekangan #9, luar skop.

---

## BAHAGIAN 3 , Serangan adversarial atas pakej sendiri

**Kelemahan 1: "Gamifikasi doa".** Butang sayang + count pada sehingga ~80 kad boleh buat dinding ucapan rasa macam media sosial (kira "like" atas doa), yang MURAHKAN majlis , tepat amaran P3 "setiap interaktiviti tambahan menurunkan kelas majlis".
Ubah keputusan? Tidak reverse, TAPI tambah pengawal: count per-kad mesti bisik (tiada nombor bila 0, taip sangat kecil), dan kaunter AGREGAT di kepala dinding ialah versi paling bermaruah. Cadang: bila review data sebenar, timbang de-emphasize count per-kad kalau nampak macam scoreboard. Butang sayang KEKAL, count per-kad tunduk review.

**Kelemahan 2: Semua kontras dikira dari hex ANGGARAN visual** (bukan sampel pixel), P1 akui andaian #1. Semua nombor WCAG P1 mewarisi ketidakpastian ini. Yang paling nipis: `plum-laras / kraft = 4.51:1` (hanya lepas 4.5 sikit) dan `lilac / aubergine = 4.96:1`.
Ubah keputusan? Tidak (purple muted atas cream memang tinggi kontras, toleransi ±5° P1), TAPI wajib sampel pixel sebenar sebelum kunci token , lihat Bahagian 4.

**Kelemahan 3: Kad v4 aubergine GELAP dalam dinding web TERANG.** Satu kad gelap antara kad cerah boleh terbaca macam "kad rosak/error", bukan "premium". Dan kilauan emas `.ucapan-kad--baru` direka untuk latar CERAH , atas aubergine mungkin nampak pelik.
Ubah keputusan? Ini elemen paling berisiko. KEKAL (disokong P1+P3, kontras 10:1 selamat) TAPI tandakan sebagai benda PERTAMA disemak mata pada data sebenar, dan sedia dibuang kalau terbaca rosak. Frekuensi 1-dalam-5, bukan dominan.

---

## BAHAGIAN 4 , Dakwaan perlu disahkan sebelum implement

1. **Kontras + hue P1 dari hex anggaran visual, bukan sampel pixel** (P1 andaian #1). Sampel pixel sebenar dari `/Users/adizaini/Downloads/WhatsApp Image 2026-08-12 at 23.19.41.jpeg` untuk sahkan keluarga H~313 dan khususnya margin paling nipis `plum-laras/kraft 4.51:1` sebelum kunci token.
2. **Emas kad = `--color-gold` "cukup dekat"** (H77.5 vs 82, P1 andaian #3) , sahkan dengan sampel pixel; kalau jauh, mungkin perlu laras gold sikit.
3. **Kad v4 aubergine x kilauan emas `.ucapan-kad--baru`** (direka untuk latar cerah) , sahkan tidak nampak rosak atas latar gelap.
4. **`BILANGAN_VARIASI 4 -> 5` mengagih semula SEMUA warna kad sedia ada** (`hash % 5` beza dari `hash % 4`) , bukan bug, tapi sahkan diterima yang ucapan sedia ada tukar varian warna.
