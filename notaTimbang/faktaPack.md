# Fakta Pack , Sulam Purple + Interaktiviti + Nama Penuh (RSVP Khadizah & Anwar)

Projek: `/Users/adizaini/miniProjects/rsvpKhadizahAnwar`

## 1. Palet warna semasa (token CSS)

Semua token di `styles.css:11-62` (blok `:root`), format OKLCH.

| Token | Baris | Nilai | Dipakai di (contoh) |
|---|---|---|---|
| `--color-kraft` | `styles.css:13` | `oklch(80% 0.035 78)` | Latar body (`styles.css:78`) , kertas kraft/tan |
| `--color-kraft-deep` | `styles.css:14` | `oklch(72% 0.045 72)` | Bayang tepi kraft dalam gradient latar (`styles.css:82`) |
| `--color-cream` | `styles.css:15` | `oklch(97% 0.014 88)` | Latar `.kad` (`styles.css:163`), stat (`styles.css:508`), ucapan-kad v0 (`styles.css:404`) |
| `--color-cream-2` | `styles.css:16` | `oklch(94% 0.018 86)` | Input/textarea/select (`styles.css:206`), pilihan label (`styles.css:255`) |
| `--color-maroon` | `styles.css:17` | `oklch(37% 0.11 18)` | Tajuk script (`nama-script`, `styles.css:130`), seksyen-tajuk (`styles.css:175`), butang (`styles.css:300`), stat-nombor (`styles.css:513`) |
| `--color-maroon-soft` | `styles.css:18` | `oklch(46% 0.10 20)` | Eyebrow (`styles.css:121`), ucapan-nama (`styles.css:342`), pautan-halus (`styles.css:545`) |
| `--color-plum` | `styles.css:19` | `oklch(46% 0.075 320)` (ungu botani, HUE SEDIA ADA) | Ornamen `.ornamen--plum` (`styles.css:159`), border kiri `.ucapan-kad` default (`styles.css:325`), ucapan-kad--v2 "plum pudar" (`styles.css:413-417`) |
| `--color-gold` | `styles.css:20` | `oklch(72% 0.085 82)` | ucapan-kad--v3 "emas antik" (`styles.css:419-425`), kilauan kad baru (`styles.css:491`), `.pil-hadir` (`styles.css:528`) |
| `--color-ink` | `styles.css:21` | `oklch(31% 0.02 55)` | Teks utama badan (`styles.css:73`) |
| `--color-ink-soft` | `styles.css:22` | `oklch(46% 0.02 55)` | Teks kedua (sari, label, footer) |
| `--color-line` | `styles.css:23` | `oklch(60% 0.03 60)` | Garis halus, border kad |
| `--color-danger` | `styles.css:24` | `oklch(48% 0.13 25)` | Ralat medan |
| `--color-focus` | `styles.css:25` | `oklch(46% 0.10 20)` | Cincin fokus (sama nilai dgn maroon-soft) |

**4 varian warna kad ucapan** (`styles.css:402-425`, dinding.html sahaja):
- v0 krim/plum: `styles.css:404-406`
- v1 blush (`color-mix(cream 89%, maroon)`): `styles.css:407-411`
- v2 plum pudar (`color-mix(cream 87%, plum)`): `styles.css:413-417`
- v3 emas antik (`color-mix(cream 85%, gold)`): `styles.css:419-425`

**Penting**: sistem tema SUDAH pakai `--color-plum` (ungu botani, hue ~320) sebagai salah satu daripada 4 warna aksen sedia ada. Ini titik masuk semula jadi untuk purple baru, BUKAN token kosong.

## 2. Palet kad jemputan purple rasmi (sumber gambar)

Fail: `/Users/adizaini/Downloads/WhatsApp Image 2026-08-12 at 23.19.41.jpeg` (kad jemputan rasmi Khadizah & Anwar).

Anggaran 7 warna utama (hex, dibaca visual dari imej):
1. **Latar purple gelap desatur** ,approx `#3B2A42` hingga `#2E2038` (ungu tua kelabu, hampir aubergine, bukan purple terang)
2. **Bunga lilac/lavender terang** , approx `#B79FCB` (kelopak bunga besar sudut atas)
3. **Bunga lilac medium/shadow** , approx `#8E76A8` (bayang kelopak, daun ungu)
4. **Aksen emas/rose-gold pudar** , approx `#C9A876` (garisan lengkung arch, bunga kecil bertitik, teks label kecil "BINTI RAZALI"/"BIN SAWAL")
5. **Teks putih/lilac sangat cerah** , approx `#EDE6F0` (nama besar script "Khadizah", "Muhammad Anwar")
6. **Teks lilac cerah sekunder** , approx `#D8CBE0` (perenggan badan, tarikh, label AHAD/ADH HALL KM)
7. **Aksen daun/ranting sage-purple** , approx `#7A8B6F` kehijauan pudar bercampur ungu (ranting kecil hiasan "&")

**Gaya visual**: mood mewah/moden Islamic (arch berornamen macam kubah masjid di sudut kiri atas, lampu lentera tergantung, motif bintang), font nama besar = script cursive elegan (mirip Great Vibes yang sedia ada), label sub-nama (BINTI RAZALI, AHAD, ADH HALL KM) = sans-serif huruf besar berspace lebar (letter-spacing tinggi), garis pemisah halus dengan ornamen bunga/hati kecil. Karakter ilustrasi pengantin (baju purple) di sudut kanan bawah, TIDAK relevan untuk website (website tiada ilustrasi manusia).

**Nota keserasian**: hue purple kad (~270-290 dalam ruang OKLCH kasar) lebih GELAP dan lebih SEJUK berbanding `--color-plum` sedia ada (hue 320, lebih ke arah magenta/mauve). Kalau nak "sulam" tanpa tukar base, cadangan logik ialah tambah token baru (contoh `--color-purple-kad` atau ubah suai `--color-plum` punya hue sikit ke arah kad) dan guna sebagai LAPISAN aksen kelima (bukan ganti maroon/kraft/cream).

## 3. Struktur marquee ucapan.html + ucapan.js

- **Fail HTML**: `ucapan.html`, container `#ucapanSenarai` (`ucapan.html:44`) dengan `aria-live="polite"`.
- **Tetapan utama** (`ucapan.js:23-29`):
  - `AMBANG_MARQUEE = 5` , kurang 5 ucapan = mod statik (elak marquee nampak pelik)
  - `MAKS_KAD = 40` , had kad dianimasi untuk prestasi phone
  - `BILANGAN_VARIASI = 4` , 4 warna kad (v0-v3)
  - `BP_DUA_LAJUR = "(min-width: 560px)"` , mesti selari dengan CSS `styles.css:450`
  - `SESAAT_LAJUR_A/B = 7.2 / 8.4` saat per kad , kelajuan berbeza sikit antara 2 lajur untuk rasa organik
  - `DURASI_MIN = 42` saat , elak loop terlalu laju bila kad sikit
- **Threshold statik vs marquee**: logik di `ucapan.js:224-226`, `gerakBoleh = !REDUCED.matches && dipapar.length >= AMBANG_MARQUEE`. Mod marquee cuma aktif kalau (a) bukan reduced-motion DAN (b) >= 5 ucapan.
- **Struktur marquee**: `binaMarquee()` (`ucapan.js:114-173`) , setiap lajur = 1 track dengan 2 salinan kad (`copy1`, `copy2`), animasi `translateY(0 -> -50%)` (`styles.css:466-469`, `@keyframes marqueeNaik`) supaya loop mulus.
- **Pause logic**: hover desktop diuruskan CSS (`styles.css:472-475`); sentuh/touch diuruskan JS `pasangPause()` (`ucapan.js:102-108`) , tambah/buang kelas `.is-pause` pada `touchstart`/`touchend`/`touchcancel`.
- **prefers-reduced-motion**: dicek global di `ucapan.js:31` (`REDUCED = window.matchMedia(...)`), dipakai dalam keputusan mod (`ucapan.js:225`) DAN CSS global override semua animasi/transition ke `0.01ms` (`styles.css:584-586`).
- **Warna kad deterministik**: hash djb2 dari `entri.id` (`ucapan.js:53-58`) tentukan varian v0-v3, BUKAN rawak , penting kalau tambah purple sebagai v4/v5, kena masuk logik `hash(entri.id) % BILANGAN_VARIASI` (`ucapan.js:63`).
- **Kad baru masuk**: kelas `.ucapan-kad--baru` bagi animasi masuk + kilauan emas sekali (`styles.css:478-501`), dibuang lepas 2 saat (`ucapan.js:84`).
- **Keselamatan XSS**: SEMUA teks tetamu (`ucapan`, `nama`) dimasukkan lewat `.textContent`, bukan `.innerHTML` (`ucapan.js:34-37`, `75`, `79`) , WAJIB kekal macam ni untuk sebarang ciri baru.

## 4. Firestore rules , kekangan semasa (untuk ciri "butang sayang")

Fail: `firestore.rules`.

- Collection `/rsvp/{doc}`: `allow read: if true` (`firestore.rules:16`), `allow create` dengan validasi ketat 5 medan sahaja (`nama`, `status`, `pax`, `ucapan`, `masa`) (`firestore.rules:18-35`).
- **`allow update, delete: if false`** (`firestore.rules:37`) , DIKUNCI. Tiada sesiapa (termasuk client sendiri) boleh ubah atau padam dokumen RSVP selepas hantar.
- Semua collection lain ditolak lalai: `match /{document=**} { allow read, write: if false; }` (`firestore.rules:41-43`).

**Implikasi untuk "butang sayang" pada ucapan**: rules semasa TIADA laluan untuk sebarang bentuk reaction/like pada dokumen `/rsvp` sedia ada, dan `update` memang sengaja ditolak (bukan oversight , ia keputusan keselamatan sedia ada, lihat komen `firestore.rules:5-9`). Jangan cadangkan buka `allow update` pada `/rsvp` walaupun terhad ke satu medan (`sayangCount`), sebab itu buka pintu race condition + abuse tanpa auth.

**Penyelesaian serasi** (disahkan logik daripada corak sedia ada, BUKAN kod ditulis lagi): collection BAHARU create-only, contoh `/sayang/{doc}` dengan medan `{ ucapanId, masa }`, `allow create: if true` (validasi keys + saiz macam pattern `/rsvp`), `allow read: if true` (untuk kira jumlah client-side), `allow update, delete: if false`. Client kira jumlah sayang per ucapan lewat `onSnapshot` pada query `where("ucapanId", "==", ...)` atau muat semua dan kira `.length` client-side (sama pattern macam `ucapan.js:270-279` baca `/rsvp`). Ini ikut prinsip sedia ada 100% (create+read sahaja, tiada update), tak perlu ubah rules `/rsvp` langsung.

## 5. Nama & fakta majlis , kad purple vs index.html semasa

**Kad purple (sumber rasmi)**:
- Pengantin perempuan: **Khadizah Binti Razali**
- Pengantin lelaki: **Muhammad Anwar Bin Sawal**
- Tarikh: **30.08.2026**, hari **Ahad**
- Lokasi: **ADH Hall KM**

**index.html semasa**:
- Tajuk `<title>`: "Khadizah & Anwar , RSVP" (`index.html:6`)
- `nama-script` (header besar): "Khadizah & Anwar" (`index.html:25`) , TIADA nama penuh/bin/binti
- `nama-serif` (sub-tajuk): "Khadizah<br />& Muhammad Anwar" (`index.html:26`) , ada "Muhammad Anwar" penuh tapi TIADA "Binti Razali" / "Bin Sawal" untuk kedua-dua, dan nama perempuan cuma "Khadizah" (bukan "Khadizah Binti Razali")
- Tarikh: "Ahad, 30 Ogos 2026" + "17 Rabiulawal 1448H" (`index.html:43`) , SEPADAN dengan kad
- Masa: "12:00 tengah hari hingga 6:00 petang" (`index.html:44`) , TIADA di kad (kad tak nyatakan masa spesifik)
- Lokasi: **TIADA nama tempat** (ADH Hall KM) langsung dalam index.html semasa , jurang paling ketara
- Footer: "Khadizah & Anwar · 30 Ogos 2026" (`index.html:116`)

**Jurang jelas untuk "nama penuh"**: (a) tambah "Binti Razali" / "Bin Sawal" pada nama-serif atau header, (b) tambah nama lokasi "ADH Hall KM" yang kini terus tiada dalam index.html.

(ucapan.html turut guna nama ringkas sahaja di `ucapan.html:25` dan footer `ucapan.html:53` , pattern sama, boleh diselaraskan sekali.)

## 6. Kekangan terkunci (mesti dihormati apa jua cadangan design)

1. **GitHub Pages statik** , tiada server/backend sendiri, semua logik client-side (JS modul terus di browser).
2. **Vanilla JS sahaja** , tiada framework/build step (lihat import CDN terus di `ucapan.js:259-262`).
3. **Mobile-first** , majoriti tetamu buka dari WhatsApp di phone; semua saiz asas untuk telefon (`styles.css:7`).
4. **Prestasi phone + bateri** , animasi wajib guna `transform`/`opacity` sahaja (GPU-friendly), had `MAKS_KAD = 40` sedia ada (`ucapan.js:24`), elak gelung JS berat (`ucapan.js:11-12`).
5. **Hormat `prefers-reduced-motion`** , wajib ikut pattern sedia ada (`styles.css:584-586`, `ucapan.js:31,225`) untuk sebarang animasi/interaktiviti baru.
6. **Escape XSS wajib** , semua input tetamu lewat `.textContent`, tak sekali-kali `.innerHTML` (`ucapan.js:34-37`).
7. **Nama fail** , camelCase, tanpa dash (ikut fail sedia ada: `firebaseConfig.js`, `ucapan.js`, `app.js`).
8. **Bahasa UI** , Bahasa Melayu santun/formal majlis (tone sedia ada: "Sila sahaja...", "Sudi sudikanlah...").
9. **JANGAN sentuh fungsi `pengantin.html`** , papan kiraan rahsia pengantin, di luar skop keputusan ini.
10. **JANGAN ubah `firebaseConfig.js`** , config Firebase kekal, sebarang collection/rules baru guna `db` sedia ada.
11. **Base warna KEKAL** , kraft + krim + maroon + emas tak ditukar/ganti; purple masuk sebagai LAPISAN/AKSEN tambahan (contoh: extend guna `--color-plum` sedia ada atau tambah token baru selari dengannya), bukan rombak palet.
