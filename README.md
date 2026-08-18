# jemputanKahwinKA (variant tanpa baca ucapan)

Ini VARIANT bagi projek `rsvpKhadizahAnwar`. Semua sama macam laman utama KECUALI bahagian **BACA ucapan tetamu ditutup sepenuhnya**: tiada halaman dinding ucapan (`ucapan.html`) dan tiada feed ucapan di laman jemputan. Tetamu masih boleh **hantar** ucapan + RSVP macam biasa.

Database Firebase Firestore **dikongsi** dengan `rsvpKhadizahAnwar` (projek `rsvpkhadizahanwar`, `firebaseConfig.js` sama, tidak diubah). Jadi ucapan yang dihantar dari laman ini muncul di dinding ucapan laman utama, cuma tak dipapar semula di sini.

Mini website jemputan kahwin untuk majlis Khadizah & Anwar, Ahad 30 Ogos 2026 (17 Rabiulawal 1448H), 12:00 tengah hari hingga 6:00 petang. Tiga halaman: laman jemputan utama gaya e-kad (`index.html`, pintu masuk yang disebar), borang pengesahan kehadiran + ucapan (`rsvp.html`), dan papan ringkasan rahsia pengantin (`pengantin.html`). Dilink dari kad jemputan rasmi di Canva lewat butang yang menuju ke root URL (laman jemputan).

Stack: static HTML + CSS + JS tulen (tiada build step, tiada npm), Firebase Firestore lewat CDN modular SDK v10. Direka mobile first sebab 90% tetamu buka dari WhatsApp guna telefon. Dihost di GitHub Pages path bukan root, jadi semua asset guna path relatif.

## Fail

| Fail | Fungsi |
|------|--------|
| `index.html` | Laman jemputan utama (e-kad): kad bentuk telefon, cover, dock navigasi, countdown, buku tetamu (CTA sahaja), hubungi, lokasi. Feed baca ucapan DIBUANG |
| `landing.css` | Stail khas laman jemputan (`index.html`) |
| `landing.js` | Otak laman jemputan (cover, dock, countdown, muzik). Fungsi feed buku tetamu DIBUANG |
| `rsvp.html` | Halaman borang RSVP: header pengantin + borang kehadiran + ucapan |
| `app.js` | Otak halaman borang (hantar RSVP + ucapan) |
| `pengantin.html` | Halaman rahsia pengantin: ringkasan + senarai penuh (kekal seadanya) |
| `pengantin.js` | Otak halaman pengantin |
| `styles.css` | Stail kongsi halaman borang/pengantin (tema kraft + maroon) |
| `firebaseConfig.js` | Tetapan sambungan Firebase (isi nilai sebenar di sini) |
| `firestore.rules` | Peraturan keselamatan pangkalan data |
| `ogImage.png` | Imej preview Open Graph 1200x630 (WhatsApp/media sosial), dijana dari cover mod `?og=1` |

## Langkah setup

### 1. Isi `firebaseConfig.js`

Buka Firebase Console, cipta projek (atau guna sedia ada), tambah satu web app. Salin nilai config, tampal ganti setiap `"GANTI_NANTI"` dalam `firebaseConfig.js`:

```js
export const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "namaProjek.firebaseapp.com",
  projectId: "namaProjek",
  storageBucket: "namaProjek.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123",
};
```

Selagi nilai masih `"GANTI_NANTI"`, laman papar notis mesra "Setup belum lengkap" dan borang dimatikan, tak crash.

### 2. Deploy Firestore rules

Buka Firestore Database dalam Firebase Console, pergi tab **Rules**, salin isi `firestore.rules`, tampal, tekan **Publish**.

Atau lewat Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

Rules ni benarkan sesiapa create + read RSVP, tolak update + delete, dan tolak semua collection lain. Ada validasi: nama 1 hingga 80 aksara, status hanya hadir/tidak, pax 0 hingga 10, ucapan maks 1000 aksara.

### 3. Deploy laman ke GitHub Pages

Push repo ke GitHub, aktifkan Pages (Settings, Pages, sumber branch `main`). Laman akan hidup di path bukan root, contoh:

- Laman jemputan utama: `https://adiburth-personal.github.io/jemputanKahwinKA/` (atau `.../index.html`)
- Halaman borang RSVP: `https://adiburth-personal.github.io/jemputanKahwinKA/rsvp.html`
- Halaman pengantin: `https://adiburth-personal.github.io/jemputanKahwinKA/pengantin.html?kunci=khadizahAnwar3008x7qz`

## Kunci pengantin

Halaman `pengantin.html` dikunci. Tanpa kunci betul ia papar "Halaman peribadi" dan tak sentuh data.

**Kunci: `khadizahAnwar3008x7qz`**

Pautan penuh pengantin:

```
pengantin.html?kunci=khadizahAnwar3008x7qz
```

Untuk tukar kunci, edit pemalar `KUNCI_PENGANTIN` dalam `pengantin.js`.

> Nota jujur: kunci ni halangan ringan (menyorok pautan), bukan keselamatan sebenar. Firestore rules benarkan sesiapa BACA data RSVP secara teknikal. Untuk majlis peribadi kecil ni memadai. Kalau nak lebih ketat, tambah Firebase Auth pada halaman pengantin di masa depan.

## Skema data

Collection `rsvp`, setiap dokumen:

```
{
  nama:    string (1..80),
  status:  "hadir" | "tidak",
  pax:     number (0..10, 0 kalau tidak hadir),
  ucapan:  string (0..1000),
  masa:    serverTimestamp
}
```

Variant ini TIDAK memaparkan mana-mana ucapan kepada tetamu (bahagian baca ditutup). Ucapan yang dihantar tetap tersimpan ke Firestore yang sama seperti `rsvpKhadizahAnwar`, dan boleh dibaca dari laman utama itu.
