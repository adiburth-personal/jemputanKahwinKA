# RESEARCH PASS , Sampel Pixel Sebenar (bukan anggaran mata)

Sumber: `/Users/adizaini/Downloads/WhatsApp Image 2026-08-12 at 23.19.41.jpeg` (908x1280px, RGB, JPEG)
Kaedah: `python3` + Pillow + numpy, baca pixel array terus, purata beberapa ratus titik tiap kawasan (bukan 1 titik), tukar sRGB->OKLCH ikut formula OKLab (Björn Ottosson) tepat, kontras WCAG ikut formula relative luminance rasmi (disahkan lawan nilai rujukan `#767676`/putih = 4.54:1 dan hitam/putih = 21:1, tepat).
Skrip disimpan: `pixelSample/sampleColors.py`, `pixelSample/refineLilac.py`, `pixelSample/finalCalc.py` (dalam folder scratchpad sama macam fail ini).

---

## 1. Jadual kawasan , hex sebenar (sampel pixel)

| Kawasan | n pixel disampel | RGB purata | Hex sebenar | OKLCH sebenar |
|---|---|---|---|---|
| (a) Latar purple gelap tengah kad | 324 (4 titik x 81px window, std<3, kawasan rata disahkan) | (69, 55, 81) | `#453751` | L36.4% C0.048 H309.0 |
| (b) Kelopak bunga lilac terang | 8395 (flower kanan atas) + 2905 (flower kiri bawah, sah silang) | (194, 151, 178) / (191, 146, 173) | `#C296B2` | L72.3% C0.064 H340.0 (kanan) , L71.0% C0.066 H342.4 (kiri, sah silang) |
| (c) Daun/bunga purple sederhana | 10269 (daun atas kanan + rosette bawah kiri) | (112, 83, 116) | `#705374` | L48.5% C0.061 H322.6 |
| (d) Aksen emas/rose-gold ornamen | 531 (rangka lentera + ranting "&") | (183, 147, 141) | `#B7938D` | L69.4% C0.044 H29.7 |
| (e) Teks putih/cerah (perenggan badan) | 315 | (200, 182, 200) | `#C8B6C8` | L79.6% C0.032 H326.0 |

**Koordinat titik disampel (contoh, dalam pixel imej 908x1280):**
- (a): (650,600), (665,805), (615,495), (500,1005) , kawasan rata tanpa tekstur, std RGB <3 tiap titik.
- (b): (702,55), (805,99), (785,119), (725,163), (799,197), (888,219) dari flower kanan atas; (20-160, 960-1080) dari flower kiri bawah untuk sah silang.
- (c): (610,15), (632,28), (661,38) daun; (100,1160), (170,1180), (220,1197) rosette bawah kiri.
- (d): (143,470), (137,490), (160,491) rangka lentera; (376,646), (579,649), (587,638) ranting emas kiri/kanan "&".
- (e): (404,220), (604,236), (359,241), (594,245), (434,278), (624,291) , perenggan "ASSALAMUALAIKUM...DENGAN PENUH KESYUKURAN".

Semua koordinat disahkan visual (bulatan merah ditanda atas crop, semak ia jatuh atas permukaan betul, bukan garis/edge/teks lain) sebelum dikira.

**Bonus semakan fakta pack**: teks label "BINTI RAZALI" / "BIN SAWAL" yang fakta pack dakwa "aksen emas" (§2 item 4) , disemak pixel terus, ia SEBENARNYA warna sama family dengan (e) teks putih/cerah (pale lilac, bukan emas). Emas/rose-gold sebenar hanya pada garisan ornamen (arch, rangka lentera, ranting, medalion bintang). Dakwaan fakta pack untuk item ini SALAH, dibetulkan di sini.

---

## 2. Banding hex sebenar vs anggaran panel P1

| Kawasan | Anggaran P1 (hex/OKLCH) | Sebenar (hex/OKLCH) | Δ Hue | Δ Lightness | Status |
|---|---|---|---|---|
| (a) Aubergine gelap | `#2E2038` L27.2 C0.047 H310.3 | `#453751` L36.4 C0.048 H309.0 | 1.3° | +9.2% | Hue TEPAT, L sedikit lebih cerah (kemungkinan kawasan "rata" saya bukan sudut paling gelap gradient, bukan hue salah) |
| (b) Lilac terang | `#B79FCB` L73.8 C0.068 H309.4 | `#C296B2` L72.3 C0.064 H340.0-342.4 | **31-33°** | 1.5% | **LARI JAUH** (>15°) , petal sebenar lebih ke arah magenta/orchid, bukan lavender-biru. Disahkan 2 flower berasingan (H340.0 dan H342.4, konsisten) |
| (c) Purple sederhana (daun/rosette) | `#8E76A8` (lilac medium) L60.7 C0.079 H306.1 | `#705374` L48.5 C0.061 H322.6 | 16.5° | -12.2% | Sedikit lari (>15° tapi hampir margin), tapi **padan baik dengan token `--color-plum-laras` yang dah dicadang** (L46 H313 , Δh cuma 9.6°, ΔL 2.5%) , tak perlu token baru |
| (d) Emas/rose-gold | `#C9A876` H77.5 (anggaran fakta pack, label teks , TERBUKTI SALAH sumber) | `#B7938D` H29.7 | **~48-52°** | , | **LARI SANGAT JAUH**. Emas kad sebenar ialah rose-gold/tembaga (H~30), BUKAN emas-mustard macam token `--color-gold` sedia ada (H82). Di luar skop token purple, tapi disenaraikan sebab dakwaan #2 verdict Bahagian 4 |
| (e) Teks cerah (badan) | `#D8CBE0` (lilac sekunder) L85.9 C0.032 H312.8 | `#C8B6C8` L79.6 C0.032 H326.0 | 13.2° | -6.3% | Dalam toleransi (<15°), chroma padan TEPAT (0.032=0.032). Teks sebenar sedikit lebih gelap dari anggaran, tak kritikal (margin kontras kekal besar) |

---

## 3. Token purple final , disahkan / diperbetul

| Token | Cadangan P1 asal | **Keputusan research pass** | Sebab |
|---|---|---|---|
| `--color-aubergine` | `oklch(33% 0.05 314)` `#3F2D47` | **DISAHKAN, tiada perubahan** | Hue sebenar kad (309) dalam 5° dari token (314); L token malah lebih dekat sudut gelap sebenar berbanding sampel rata saya |
| `--color-plum` (laras) | `oklch(46% 0.078 313)` `#674B77` | **DISAHKAN hue/chroma, TAPI kontras teks kraft PATAH** (lihat §4) , guna HANYA untuk border/ornamen/UI, jangan untuk teks biasa | Hue padan baik dengan purple sederhana sebenar (322.6, Δ9.6°) |
| `--color-purple-deep` | `oklch(30% 0.06 312)` `#382443` | **DISAHKAN, tiada perubahan** | Sudah selari keluarga aubergine/bg sebenar (309-314), kontras 12.79:1 atas cream jauh melepasi keperluan |
| `--color-lilac` | `oklch(72% 0.055 308)` `#AE9CC0` | **DIPERBETUL: hue 308 -> 335** , `oklch(72% 0.055 335)` = **`#BB98B2`** | Petal lilac terang sebenar H340-342 (2 sampel bebas, konsisten), 308 lari 32-33°, jauh lepas ambang 15°. 335 ialah kompromi: cukup dekat dengan hue sebenar kad (Δ~6°) tapi tak putus terus dari keluarga hue-313 plum/aubergine/purple-deep (kekal harmoni). Kontras atas aubergine kekal 4.90:1 (asal 4.93:1) , praktikal sama, tiada risiko baru |
| `--color-lilac-wash` | `oklch(90% 0.03 308)` `#E3D9EE` | **DIPERBETUL: hue 308 -> 335** , `oklch(90% 0.03 335)` = **`#EBD7E6`** | Ikut retun `--color-lilac` untuk konsisten (guna hover/wash, tiada isu kontras kritikal, kosmetik sahaja) |

**Nota harmoni**: hue 335 sebenarnya LEBIH dekat dengan maroon base (H18) berbanding 308 lama (jarak bulatan 43° vs 70°) , tetap jelas berbeza keluarga (bukan bercampur), masih dalam band chroma rendah (C0.055, sama macam asal), jadi kekangan "harmoni dengan kraft/base" kekal terjaga.

**Token GEMAS/rose-gold (`--color-gold` sedia ada) , DI LUAR skop purple, tapi direkod sebagai penemuan**: rangka ornamen kad (lentera, ranting, medalion) hue sebenar ~H30 (rose-gold/tembaga), token sedia ada `--color-gold` H82 (kuning-zaitun). Jurang ~50°, jauh lebih besar dari andaian "cukup dekat" P1/verdict. TIADA cadangan token baru dibuat di sini (di luar skop tugasan ini), tapi panel WAJIB tahu dakwaan #2 (Bahagian 4 verdict.md) SALAH dan perlu disemak semula kalau nak guna emas kad tepat.

---

## 4. Jadual kontras (dikira ikut formula WCAG sebenar, bukan anggar)

Formula disahkan: kontras(hitam,putih)=21.000 tepat; kontras(`#767676`,putih)=4.542 (padan nilai rujukan piawai WCAG). Semua token OKLCH ditukar terus ke sRGB (Björn Ottosson OKLab, sama formula CSS Color 4).

| Pasangan | Hex (dikira dari OKLCH tepat) | Nisbah dikira semula | Lulus >=4.5 (teks)? | Lulus >=3.0 (UI/besar)? |
|---|---|---|---|---|
| `purple-deep` / cream | `#382443` / `#F9F5EB` | **12.79:1** | Ya | Ya |
| `purple-deep` / kraft | `#382443` / `#CABBA5` | **7.45:1** | Ya | Ya |
| `purple-deep` / lilac-wash (baru) | `#382443` / `#EBD7E6` | 9.9:1 (anggaran, sama band dgn asal 10.26) | Ya | Ya |
| **`plum-laras` / kraft** | `#674B77` / `#CABBA5` | **3.946:1** | **TIDAK** | Ya (>3.0) |
| `plum-laras` / cream | `#674B77` / `#F9F5EB` | **6.78:1** | Ya | Ya |
| `maroon` / cream (baseline sedia ada) | `#6E2029` / `#F9F5EB` | 10.11:1 | Ya | Ya |
| `plum` lama / cream (baseline sedia ada) | `#6B4A72` / `#F9F5EB` | 6.78:1 | Ya | Ya |
| `ink` / cream (baseline sedia ada) | `#392E27` / `#F9F5EB` | 12.13:1 | Ya | Ya |
| `lilac` (335, baru) / aubergine | `#BB98B2` / `#3F2D47` | 4.90:1 | Ya | Ya |
| `gold` token / aubergine | `#BFA065` / `#3F2D47` | 5.00:1 | Ya | Ya |
| `putih-lilac` #EDE6F0 (hex v4) / aubergine | , / `#3F2D47` | 10.20:1 | Ya | Ya |
| `lilac-sekunder` #D8CBE0 (hex v4) / aubergine | , / `#3F2D47` | 8.04:1 | Ya | Ya |

**Kraft hex tepat** (dari token sebenar `styles.css:13`, `oklch(80% 0.035 78)`) = `#CABBA5`. Ini bukan anggaran, dikira terus dari nilai OKLCH sebenar dalam kod.

---

## 5. MARGIN PALING NIPIS , plum-laras atas kraft

**Dakwaan P1 (P1.md baris 59)**: "plum (laras) accent / kraft: **4.51:1** Lulus (cukup untuk teks biasa atas body)"

**Dikira semula, DUA cara, DUA-DUA sepakat**:
1. Dari hex anggaran P1 sendiri (`#6B4A73` / kraft `#CABBA5`) = **3.914:1**
2. Dari OKLCH token TEPAT (`oklch(46% 0.078 313)` / `oklch(80% 0.035 78)`) = **3.946:1**

Kedua-dua cara memberi nombor SAMA kawasan (~3.9-3.95), JAUH dari dakwaan 4.51:1 P1. Ini bukan margin nipis yang "cukup lepas", ini **kesilapan kira** dalam P1 (bukan salah baca hex kad, salah kira nisbah kontras itu sendiri).

### VERDICT: **GAGAL** untuk kegunaan teks biasa (keperluan >=4.5:1)
Angka sebenar: **3.95:1** (bukan 4.51:1).

### TAPI: **LULUS** untuk kegunaan UI/border/ornamen (keperluan >=3.0:1)
3.95 > 3.0, selamat untuk border kad, `.ornamen--plum`, aksen bukan-teks.

**Kesan praktikal**: Semak pelan penggunaan akhir (verdict.md Bahagian 2a) , `--color-plum` (plum-laras) HANYA dipakai untuk `.ornamen--plum` (hiasan), border kad, aksen butang (bukan teks label). TIADA tempat dalam pelan yang letak plum-laras sebagai warna TEKS terus atas latar kraft. Jadi verdict GAGAL ini **tidak pecahkan implementasi yang dirancang**, tapi rasional/rationale P1 ("cukup untuk teks biasa atas body") mesti dibetulkan dalam dokumen supaya tiada sesiapa guna token ini sebagai teks-atas-kraft pada masa depan.

**Kalau perlu plum sebagai teks-atas-kraft pada bila-bila masa**: guna versi gelap `oklch(42% 0.078 313)` = `#5C406B`, kontras **4.686:1** atas kraft (Lulus), 8.05:1 atas cream. Hue/chroma sama, cuma L diturunkan 46%->42%.

---

## 6. Ringkasan verdict

| # | Perkara | Verdict |
|---|---|---|
| 1 | Hue keluarga purple kad (aubergine/plum/purple-deep, H309-314) | **LULUS** , token P1 sudah tepat, tiada perubahan |
| 2 | Token `--color-lilac` / `--color-lilac-wash` (H308) | **DIPERBETUL** ke H335 , petal sebenar 32-33° lebih magenta dari anggaran |
| 3 | Token `--color-plum-laras` guna sebagai border/ornamen | **LULUS** (3.95:1 >= 3.0:1) |
| 4 | **Margin nipis: `plum-laras` / kraft sebagai TEKS** | **GAGAL** (3.95:1 < 4.5:1, bukan 4.51:1 macam didakwa) , hadkan ke border/ornamen sahaja, atau guna varian gelap `#5C406B` kalau perlu teks |
| 5 | Dakwaan gold kad "cukup dekat" `--color-gold` (di luar skop tapi disemak) | **GAGAL** , gold kad sebenar rose-gold H30, token sedia ada H82, jurang ~50°. Tiada cadangan ganti dibuat (luar skop), sekadar rekod untuk kesedaran panel |

---

## 7. Fail skrip (audit)
- `pixelSample/sampleColors.py` , sampel 5 kawasan + tukar OKLCH + WCAG asas
- `pixelSample/refineLilac.py` , sah silang hue lilac di 2 flower berasingan + bucket by lightness
- `pixelSample/finalCalc.py` , kira semula SEMUA token (base + proposed) dari OKLCH tepat ke hex + jadual kontras penuh + cari L plum-laras yang lulus 4.5 atas kraft
- `pixelSample/sampled.json` , output mentah sampel (RGB/hex/OKLCH/koordinat)
- `pixelSample/mark_*.png` , crop bertanda bulatan merah untuk sahkan koordinat titik jatuh atas permukaan betul (sah visual sebelum kira)

Semua di folder: `/private/tmp/claude-501/-Users-adizaini-Projects-agenticOs/7088a7e2-fe65-4cbc-b157-0a0ae1e246fc/scratchpad/pixelSample/`
