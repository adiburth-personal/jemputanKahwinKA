// Otak laman jemputan utama (index.html).
//
// APA MAKSUDNYA (bahasa biasa):
// Fail ni menghidupkan laman jemputan: cover "tekan untuk buka", reveal seksyen
// bila skrol, countdown ke hari majlis, butang muzik <audio> HTML5 (fail sendiri
// laguMajlis.mp3, main bila cover ditekan), buku tetamu (3 ucapan terkini dari
// pangkalan data, baca sahaja), dan butang hubungi (telefon + WhatsApp).
//
// SEMUA bahagian DEFENSIF: kegagalan Firebase/CDN/audio TAK boleh kosongkan
// halaman. Teks tetamu dimasukkan lewat .textContent (selamat XSS).

import { firebaseConfig, konfigurasiBelumSiap } from "./firebaseConfig.js";

// PENANDA "MODUL HIDUP": tanda SEBAIK modul mula dinilai. Skrip jaring keselamatan dalam
// <head> index.html tunggu ~3s; kalau penanda ini masih tiada (modul gagal muat: rangkaian
// putus, ralat sintaks, CSP), ia buang kelas lp-js supaya seksyen .reveal (yang disorok
// HANYA bila lp-js) terpapar statik. Jadi kandungan tak pernah tersekat telus.
try { window.__lpSedia = true; } catch (e) {}

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");

// ====== Utiliti SKROL LEMBUT (dikongsi dock + deep-link cover) ======
// Animasi skrol sendiri guna requestAnimationFrame (bukan scrollIntoView smooth) supaya
// jarak jauh tak "flash gelap" (compositor tak sempat paint). Durasi berskala jarak,
// dihad 800ms. Dikongsi supaya deep-link hash dan dock guna MEKANISME SAMA.
const OFFSET_SKROL = 18;   // jarak dari atas viewport supaya tajuk seksyen tak terlalu rapat
function skrolYSemasa() { return window.scrollY || window.pageYOffset || 0; }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function scrollKe(targetY) {
  const startY = skrolYSemasa();
  const dist = targetY - startY;
  if (Math.abs(dist) < 2) return;
  const dur = Math.min(800, Math.max(280, Math.abs(dist) * 0.5));
  const mula = performance.now();
  function langkah(now) {
    const p = Math.min((now - mula) / dur, 1);
    window.scrollTo(0, Math.round(startY + dist * easeInOutCubic(p)));
    if (p < 1) requestAnimationFrame(langkah);
  }
  requestAnimationFrame(langkah);
}
// Skrol ke elemen sasaran (selector atau node). Reduced-motion: lompat terus. Defensif.
function scrollKeSasaran(sel) {
  try {
    const el = typeof sel === "string" ? document.querySelector(sel) : sel;
    if (!el) return false;
    const targetY = Math.max(0, el.getBoundingClientRect().top + skrolYSemasa() - OFFSET_SKROL);
    if (REDUCED.matches) { window.scrollTo(0, targetY); return true; }
    scrollKe(targetY);
    return true;
  } catch (e) { return false; }
}

// Deep-link hash: rakam #hash SEMASA MUAT (sebelum sebarang navigasi dalaman) supaya
// selepas cover dibuka kita boleh skrol ke seksyen sasaran, bukan paksa ke atas.
const HASH_AWAL = (function () {
  try { return (location.hash && location.hash.length > 1) ? location.hash : ""; }
  catch (e) { return ""; }
})();

// API modul muzik (diisi oleh muzikInit di bawah). Cover memanggilnya SEGERAK dalam
// gesture klik supaya autoplay dibenarkan. null selagi muzikInit belum jalan; klik
// cover berlaku selepas modul habis dinilai, jadi ia sentiasa sedia bila diperlukan.
let muzikApi = null;

// Mod OG (?og=1): susun cover versi landscape 1200x630 untuk jana ogImage.png.
// Tak ganggu paparan biasa (kelas hanya ditambah bila query ada).
try { if (new URLSearchParams(location.search).has("og")) document.documentElement.classList.add("lp-og"); } catch (e) {}

// ====== Konfig nombor hubungi (SAH dari user 15 Ogos, senang tukar di sini) ======
// wa: URL wasap.my TEPAT seperti diberi user (jangan bina semula dari nombor).
const KONTAK = [
  { label: "Bapa Pengantin",  tel: "+601170389498", wa: "http://wasap.my/601170389498" },
  { label: "Abang Pengantin", tel: "+60168380403",  wa: "http://wasap.my/60168380403"  },
  { label: "Adik Pengantin",  tel: "+601174583397", wa: "http://wasap.my/601174583397" },
];

// ====== Sasaran countdown: 30 Ogos 2026, 11:00 pagi waktu mula majlis (waktu Malaysia +08) ======
const MASA_MAJLIS = new Date("2026-08-30T11:00:00+08:00").getTime();

// ====== Sumber muzik: fail audio SENDIRI (same-origin), lihat muzikInit ======
// ./laguMajlis.mp3 di root repo (potongan saat 12-108 sumber asal, fade in 4s +
// fade out 4s: 2.5s asal tak terasa sebab bahagian lagu ini memang bermula lembut,
// 4s dipilih supaya ramp jelas pada telinga dan loop tak menghentak).
// Same-origin dipilih GANTI YouTube kerana iOS Safari sekat audio iframe cross-origin
// (lihat komen penuh di muzikInit). Elemen <audio> dicipta lewat JS di sana.
// ?v= sebab mp3 pun kena cache lama GitHub Pages bila fail diganti (konvensyen head index.html).
const LAGU_SRC = "./laguMajlis.mp3?v=20260815i";

// ---------- Ikon SVG kecil (inline, tiada CDN ikon) ----------
function svgIkon(jenis) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("fill", "none");
  svg.setAttribute("aria-hidden", "true");
  const p = document.createElementNS(ns, "path");
  if (jenis === "telefon") {
    p.setAttribute("d", "M7 4.5c.6 0 1.1.4 1.3 1l.9 2.7c.2.6 0 1.2-.5 1.6l-1.2 1a12 12 0 0 0 4.7 4.7l1-1.2c.4-.5 1-.7 1.6-.5l2.7.9c.6.2 1 .7 1 1.3V19c0 .8-.7 1.5-1.5 1.5A13.5 13.5 0 0 1 5.5 7 1.5 1.5 0 0 1 7 4.5Z");
  } else { // whatsapp (gagang telefon dalam gelembung)
    p.setAttribute("d", "M12 3.6a8.4 8.4 0 0 0-7.1 12.9L4 20.4l4-1a8.4 8.4 0 1 0 4-15.8Zm4.3 11.6c-.2.5-1 .9-1.4 1-.4 0-.8.2-2.6-.6-2.2-1-3.6-3.2-3.7-3.4-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.3.4c-.1.1-.2.3-.1.5.1.2.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.4.1.5-.1l.6-.7c.2-.2.3-.1.5-.1l1.6.8c.2.1.4.2.4.3.1.1.1.6-.1 1Z");
  }
  p.setAttribute("stroke", "currentColor");
  p.setAttribute("stroke-width", "1.5");
  p.setAttribute("stroke-linejoin", "round");
  if (jenis === "whatsapp") { p.setAttribute("fill", "currentColor"); p.setAttribute("stroke", "none"); }
  svg.appendChild(p);
  return svg;
}

// ====== 1. COVER (tekan untuk buka) ======
(function coverInit() {
  const cover = document.getElementById("lpCover");
  if (!cover) return;
  const mono = cover.querySelector(".lp-mono");
  // Kunci skrol semasa cover naik supaya sampul terasa "penuh".
  try { document.documentElement.style.overflow = "hidden"; document.body.style.overflow = "hidden"; } catch (e) {}
  let dibuka = false;      // gesture PERTAMA (tap cover) dah cetus taburan
  let diangkat = false;    // angkat() dah jalan (elak double-fire tap kedua/timer)
  let idAngkat = null;     // id setTimeout angkat 1800ms (boleh dibatal tap kedua)
  // PEMALAR KONGSI durasi fade cover: dibaca dari CSS --lp-dur-angkat supaya SATU
  // sumber kebenaran, cover.remove() sentiasa selari dengan durasi transition CSS
  // (tiada ghost cover kalau durasi diubah di CSS sahaja). Fallback 1100.
  const DUR_ANGKAT = (function () {
    try {
      const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--lp-dur-angkat"));
      return (isNaN(v) || v <= 0) ? 1100 : v;
    } catch (e) { return 1100; }
  })();
  let idSettle = null;     // id setTimeout settle 2000ms (boleh dibatal tap kedua)

  // ===== TRANSISI "GERBANG EMAS" (pilihan muktamad user dari panel 3 mockup) =====
  // Naratif: tinta terangkat dari muka surat -> kamera MELANGKAH MASUK menembusi
  // ambang bingkai emas -> tanah gelap menipis -> tudung larut -> halaman settle
  // 2000ms TEPAT pada slot unmute muzik. Semua fasa dipacu CSS (.is-gerbang, delay
  // per lapisan); JS hanya urus 3 detik: tap (0ms), masuk (420ms), settle (2000ms).

  // Skrol pulih ke sasaran betul + lepaskan halaman untuk dolly masuk. Dipanggil
  // pada 420ms (gerbang mula meluas) ATAU serta-merta pada laluan skip/reduced.
  function lepasHalaman() {
    const adaHash = !!(HASH_AWAL && document.querySelector(HASH_AWAL));
    // Skrol dipulihkan ke atas SERTA-MERTA (instant) SEBELUM dolly bermula supaya
    // tiada gerakan skrol kelihatan bertindih dengan transisi.
    if (!adaHash) { try { window.scrollTo(0, 0); } catch (e) {} }
    // Belt-and-braces deep-link: anchor-scroll asli browser boleh sempat menyimpan
    // skrol tersembunyi DALAM .lp-kad (overflow) sebelum CSS clip terpakai; sifarkan
    // supaya kiraan offsetTop tak tertolak ~1100px.
    try { const kadEl = document.querySelector(".lp-kad"); if (kadEl) kadEl.scrollTop = 0; } catch (e) {}
    // .lp-buka: (1) halaman dolly 1.06 -> 1 (1580ms, settle 2000ms), (2) gate urutan
    // hero dramatik (nama zoom main tepat bila gerbang terbuka), (3) dock/muzik
    // menyusul (delay 600ms dalam CSS).
    try { document.documentElement.classList.add("lp-buka"); } catch (e) {}
    return adaHash;
  }

  // Penutup transisi: buka kunci skrol, deep-link, buang cover. Guard diangkat.
  function settle(pantas) {
    if (diangkat) return;
    diangkat = true;
    if (idAngkat) { try { window.clearTimeout(idAngkat); } catch (e) {} idAngkat = null; }
    if (idSettle) { try { window.clearTimeout(idSettle); } catch (e) {} idSettle = null; }
    const adaHash = lepasHalaman();   // idempotent: kelas/skrol sama kalau dah dipanggil
    try { document.documentElement.style.overflow = ""; document.body.style.overflow = ""; } catch (e) {}
    // DEEP-LINK: kira sasaran dari offsetTop (geometri layout, kebal transform dolly;
    // gBCR masa transisi tercemar transform -> sesat ~45px untuk seksyen jauh).
    if (adaHash) {
      window.setTimeout(function () {
        try {
          const el = document.querySelector(HASH_AWAL);
          if (!el) return;
          let y = 0, n = el;
          while (n) { y += n.offsetTop || 0; n = n.offsetParent; }
          const sasarY = Math.max(0, y - OFFSET_SKROL);
          if (REDUCED.matches) { window.scrollTo(0, sasarY); } else { scrollKe(sasarY); }
        } catch (e) { try { scrollKeSasaran(HASH_AWAL); } catch (e2) {} }
      }, REDUCED.matches ? 0 : 60);
    }
    // is-buka: visibility hidden + pointer-events none (kandungan gerbang dah opacity
    // 0 pada saat ini, jadi tiada fade kelihatan) lalu buang dari DOM. Laluan pantas
    // (skip/reduced): fade keseluruhan cover sendiri yang jadi transisinya.
    cover.classList.add("is-buka");
    window.setTimeout(function () { try { cover.remove(); } catch (e) {} },
      REDUCED.matches ? 0 : (pantas ? 700 : 140));
  }

  // Laluan SKIP (tap kedua semasa gerbang / reduced-motion): terus masuk. is-laju
  // memendekkan fade keseluruhan cover ke 650ms supaya niat "terus masuk" dihormati.
  function angkat() {
    if (diangkat) return;
    try { cover.classList.add("is-laju"); } catch (e) {}
    settle(true);
  }

  function buka() {
    // TAP KEDUA semasa gerbang terbuka: terus masuk (skip). Guard diangkat dalam
    // settle() elak double-fire; timer 420/2000ms dibatal di situ.
    if (dibuka) {
      if (!diangkat) angkat();
      return;
    }
    dibuka = true;
    // Muzik: panggil audio.play() SEGERAK dalam gesture klik cover (klik/Enter/Space
    // semua gesture). play() same-origin dibenarkan browser HANYA semasa gesture, jadi
    // mesti di awal buka() sebelum apa-apa setTimeout, kalau tidak rantai user-activation
    // putus. Guard: kalau modul muzik gagal / play() ditolak, senyap sahaja, cover tetap
    // terbuka. Ini juga jalan pada laluan reduced-motion (mulaAuto sebelum cabang REDUCED).
    // KEKAL: unmute muzik pada 2000ms diurus dalam modul muzik, JANGAN diubah di sini,
    // ia jatuh TEPAT pada settle gerbang (2000ms), muzik menyambut bila pintu terbuka.
    try { if (muzikApi) muzikApi.mulaAuto(); } catch (e) {}
    // Reduced-motion: buka terus tanpa gerbang/tangguh, muzik tetap main.
    if (REDUCED.matches || !mono) { angkat(); return; }
    // GERBANG EMAS. Timeline dari saat tap (fasa penuh dalam komen CSS .is-gerbang):
    //   0ms glint berlian + CTA padam -> 100/200ms tinta A/B terangkat (habis 640ms)
    //   -> 420ms gerbang meluas + halaman mula dolly -> 680ms tanah menipis
    //   -> 780ms tudung larut -> 2000ms settle (unmute muzik) -> ~2140ms cover dibuang.
    try { cover.classList.add("is-gerbang"); } catch (e) {}
    idAngkat = window.setTimeout(lepasHalaman, 420);
    idSettle = window.setTimeout(function () { settle(false); }, 2000);
  }
  cover.addEventListener("click", buka);
  cover.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); buka(); }
  });
})();

// ====== 2. REVEAL per-ELEMEN (resipi e-kad rujukan, BERULANG) ======
// APA MAKSUDNYA: setiap blok teks/elemen muncul SENDIRI bila IA masuk viewport (bukan
// seluruh seksyen sekali). Setiap elemen mula tersembunyi (op 0 + turun 100px, dari
// BAWAH sahaja pada semua arah skrol) dan main tween ~1s quad-out bila is-lihat ditanda.
//
// BEZA dari versi lama: (1) diperhati PER-ELEMEN, bukan per-seksyen; (2) mekanisme
// arah-atas (.lp-arah-atas) DIBUANG , elemen sentiasa masuk dari bawah; (3) stagger
// datang semulajadi dari susunan layout, bukan transition-delay panjang.
//
// RESET: bila elemen keluar viewport SEPENUHNYA (atas ATAU bawah, ratio ~0), buang
// is-lihat serta-merta (tiada animasi keluar) -> main semula setiap kali masuk balik.
// HISTERESIS: elemen yang masih separa kelihatan TAK direset (elak flicker di tengah).
//
// HERO: seksyen .lp-hero kekal diperhati sebagai SATU unit supaya urutan dramatiknya
// (nama zoom dll, gated .lp-buka) main sebagai identiti istimewa; ia pun main semula
// bila hero masuk balik viewport. Fallback/reduced: tunjuk semua statik.
(function revealInit() {
  // Elemen per-elemen: anak langsung seksyen (kecuali hiasan/bingkai hero/ol
  // timeline) + setiap item timeline. Padan selector CSS enjin reveal (landing.css 2/2b).
  const elemen = Array.prototype.slice.call(document.querySelectorAll(
    ".lp-sec.reveal > :not(.lp-deko):not(.lp-hero-frame):not(.lp-tl), " +
    ".lp-aturcara.reveal .lp-tl-item"
  ));
  // Hero diperhati sebagai seksyen (is-lihat pada .lp-hero mencetus urutan dramatik).
  const hero = document.querySelector(".lp-hero.reveal");
  const sasaran = elemen.slice();
  if (hero) sasaran.push(hero);
  if (!sasaran.length) return;

  function tunjukSemua() { sasaran.forEach(function (s) { s.classList.add("is-lihat"); }); }
  if (REDUCED.matches || typeof IntersectionObserver === "undefined") { tunjukSemua(); return; }

  try {
    // DUA observer berasingan (fix glitch tepi atas viewport):
    //
    // PUNCA BUG LAMA (satu observer, reset pada ratio ~0): bila elemen keluar di TEPI
    // ATAS semasa skrol turun, is-lihat dibuang -> keadaan sembunyi SNAP translateY(+100px)
    // MENOLAK elemen itu BALIK ke dalam viewport (bottom -0 jadi +100) -> observer sama
    // nampak ia "masuk semula" -> is-lihat ditambah balik ~1 frame kemudian -> animate 1s
    // di tepi atas, berulang-ulang (diukur: sampai 6 kitaran satu elemen, beribu frame
    // kandungan separa-lutsinar tengah animate di zon atas = glitch yang dilaporkan).
    //
    // FIX: pisahkan tanggungjawab supaya snap tak boleh mencetus kemasukan semula.
    //  ioMasuk: root = viewport SEBENAR, tambah is-lihat bila >=5% kelihatan (trigger
    //           masuk sama macam dulu, dua-dua arah skrol, replay + feel rujukan kekal).
    //  ioReset: root DIPERLUAS 140px di ATAS (rootMargin), buang is-lihat HANYA bila
    //           elemen langsung tak bersilang dengan kawasan luas itu, iaitu dah 140px
    //           MELEPASI tepi atas (atau keluar penuh di bawah). 140 > snap 100px, jadi
    //           selepas snap elemen kekal DI LUAR viewport sebenar (bottom <= -40px):
    //           ioMasuk tak terpicu, tiada gelung, dan reset tetap berlaku -> replay
    //           bersih bila ia masuk semula kelak. Histeresis jadi lebih lebar sedikit
    //           di atas sahaja; kemasukan dari bawah tak berubah langsung.
    const ioMasuk = new IntersectionObserver(function (entri) {
      entri.forEach(function (en) {
        if (en.isIntersecting && en.intersectionRatio >= 0.05) {
          en.target.classList.add("is-lihat");
        }
      });
    }, { threshold: [0.05] });
    const ioReset = new IntersectionObserver(function (entri) {
      entri.forEach(function (en) {
        if (!en.isIntersecting) {
          en.target.classList.remove("is-lihat");   // keluar penuh + margin: reset, main semula nanti
        }
      });
    }, { rootMargin: "140px 0px 0px 0px", threshold: [0] });
    sasaran.forEach(function (s) { ioMasuk.observe(s); ioReset.observe(s); });
  } catch (e) { tunjukSemua(); }
})();

// ====== 3. COUNTDOWN ======
(function countdownInit() {
  const elHari = document.getElementById("cdHari");
  const elJam = document.getElementById("cdJam");
  const elMinit = document.getElementById("cdMinit");
  const elSaat = document.getElementById("cdSaat");
  const grid = document.getElementById("lpCountdown");
  const selesai = document.getElementById("lpCountdownSelesai");
  if (!elHari || !elJam || !elMinit || !elSaat) return;
  let timer = null;
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  // Pop kecil bila nilai berubah. Restart animation guna toggle kelas: animationend
  // buang kelas (pop 250ms < selang 1s, jadi kelas mesti dah tanggal sebelum tick
  // berikut) -> tiada force-reflow tiap saat. Reduced-motion: langkau terus.
  function pop(el) {
    if (REDUCED.matches) return;
    el.classList.add("is-pop");
  }
  [elHari, elJam, elMinit, elSaat].forEach(function (el) {
    el.addEventListener("animationend", function () { el.classList.remove("is-pop"); });
  });
  // Set nilai HANYA bila berubah + pop pada yang berubah sahaja (Hari/Jam/Minit tak
  // pop tiap saat, cuma bila angka masing-masing bertukar).
  function setNilai(el, teks) {
    if (el.textContent === teks) return;
    el.textContent = teks;
    pop(el);
  }
  function kemas() {
    const baki = MASA_MAJLIS - Date.now();
    if (baki <= 0) {
      if (grid) grid.hidden = true;
      if (selesai) selesai.hidden = false;
      if (timer) window.clearInterval(timer);
      return;
    }
    const saat = Math.floor(baki / 1000);
    const hari = Math.floor(saat / 86400);
    const jam = Math.floor((saat % 86400) / 3600);
    const minit = Math.floor((saat % 3600) / 60);
    const s = saat % 60;
    setNilai(elHari, String(hari));
    setNilai(elJam, pad(jam));
    setNilai(elMinit, pad(minit));
    setNilai(elSaat, pad(s));
  }
  kemas();
  timer = window.setInterval(kemas, 1000);
})();

// ====== 4. HUBUNGI (bina baris dari KONTAK) ======
(function hubungiInit() {
  const bekas = document.getElementById("lpKontak");
  if (!bekas) return;
  KONTAK.forEach(function (k) {
    const baris = document.createElement("div");
    baris.className = "lp-kontak-baris";

    const nama = document.createElement("span");
    nama.className = "lp-kontak-nama";
    nama.textContent = k.label;

    const btns = document.createElement("div");
    btns.className = "lp-kontak-btns";

    const telA = document.createElement("a");
    telA.className = "lp-kontak-btn";
    telA.href = "tel:" + k.tel;
    telA.setAttribute("aria-label", "Telefon " + k.label);
    telA.appendChild(svgIkon("telefon"));

    const waA = document.createElement("a");
    waA.className = "lp-kontak-btn";
    waA.href = k.wa;
    waA.target = "_blank";
    waA.rel = "noopener";
    waA.setAttribute("aria-label", "WhatsApp " + k.label);
    waA.appendChild(svgIkon("whatsapp"));

    btns.append(telA, waA);
    baris.append(nama, btns);
    bekas.appendChild(baris);
  });
})();

// ====== 5. DOCK: pautan dalam-page skrol lembut (rAF, elak flash gelap) ======
(function dockInit() {
  const dock = document.getElementById("lpDock");
  if (!dock) return;

  // Guna utiliti skrol lembut DIKONGSI (scrollKeSasaran di atas): sama mekanisme dengan
  // deep-link cover, elak "flash gelap" jarak jauh (rAF paint tiap frame, dihad 800ms).
  dock.addEventListener("click", function (e) {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href.charAt(0) !== "#") return;          // rsvp.html: navigasi biasa
    if (!document.querySelector(href)) return;
    e.preventDefault();
    scrollKeSasaran(href);
  });
})();

// ====== 6. MUZIK (<audio> HTML5 same-origin, guard penuh, status JUJUR ikut EVENT) ======
// Pulangkan { mulaAuto } supaya coverInit boleh mula muzik dari gesture klik cover.
//
// SEJARAH & KENAPA <audio> SAME-ORIGIN, BUKAN YOUTUBE:
// Versi lama guna iframe YouTube nocookie + handshake postMessage. Di iOS Safari /
// Chrome mobile, "user activation" (kebenaran gesture) TAK menjalar merentas sempadan
// origin ke iframe cross-origin untuk audio bukan-mute, jadi autoplay YouTube kerap
// disekat WALAUPUN iframe dicipta dalam gesture cover. Ia betul-betul GAGAL berbunyi di
// telefon pengantin. Penyelesaian: fail audio SENDIRI (./laguMajlis.mp3) yang same-origin.
// play() dipanggil SEGERAK dalam handler gesture pada elemen <audio> same-origin
// dibenarkan hampir semua browser TERMASUK iOS Safari, kerana tiada sempadan origin yang
// memutus rantai user-activation. Jauh lebih mudah dan boleh dipercayai daripada YouTube.
//
// KEJUJURAN: status butang (is-main + aria-pressed) dipacu EVENT SEBENAR elemen audio
// ('play'/'playing'/'pause'/'error'), BUKAN andaian optimistik. Kalau play() ditolak
// (promise reject) atau fail gagal muat (404/offline), butang kekal/kembali OFF dan
// senyap, page tak rosak. Loop cukup dengan audio.loop=true (fail dah dipotong betul).
muzikApi = (function muzikInit() {
  const btn = document.getElementById("lpMuzik");
  if (!btn) return null;

  // Cipta elemen <audio> lewat JS (tiada dalam markup statik supaya index.html bersih).
  // preload="none" MULA: JANGAN bazir ~3.5MB data untuk tetamu yang mungkin tak buka
  // atau tak mahu bunyi. Selepas page settle, kita naik ke "auto" untuk buffer latar
  // (lihat panaskan di bawah) supaya main serta-merta bila cover ditekan.
  let audio = null;
  let pernahCuba = false;   // pernah cuba main? (elak panaskan reset audio yang dah jalan)
  try {
    audio = document.createElement("audio");
    audio.src = LAGU_SRC;
    audio.loop = true;              // ulang tanpa henti; fail dah dipotong dari titik betul
    audio.preload = "none";         // elak muat turun sebelum tetamu betul-betul buka
    audio.setAttribute("aria-hidden", "true");
    audio.style.display = "none";   // tiada kesan visual; dalam DOM = lebih stabil sebahagian browser
    document.body.appendChild(audio);
  } catch (e) {
    // Elemen audio langsung tak boleh dicipta: butang senyap, page elok.
    return null;
  }

  function tandaMain(on) {
    btn.classList.toggle("is-main", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", on ? "Jeda muzik latar" : "Main muzik latar");
  }

  // Status butang dipacu EVENT SEBENAR elemen audio, bukan andaian:
  //  'play'    = cubaan main diterima (mula), 'playing' = betul-betul berbunyi,
  //  'pause'   = terhenti (butang off), 'error' = fail gagal muat (butang senyap off).
  // Semua defensif: sebarang ralat handler tak boleh rosakkan page.
  try {
    audio.addEventListener("play",    function () { tandaMain(true); });
    audio.addEventListener("playing", function () { tandaMain(true); });
    audio.addEventListener("pause",   function () { tandaMain(false); });
    audio.addEventListener("error",   function () { tandaMain(false); });
  } catch (e) {}

  // Timer unmute (teknik muted-unlock, lihat mulaMuted). Disimpan supaya boleh dibatal
  // kalau user jeda dalam tempoh 2 saat atau play() ditolak.
  let unmuteTimer = null;
  function batalUnmute() {
    if (unmuteTimer) { try { window.clearTimeout(unmuteTimer); } catch (e) {} unmuteTimer = null; }
  }

  // ===== JAMINAN FADE: GainNode WebAudio (lapisan kedua atas fade dalam fail mp3) =====
  // KENAPA: ukuran sebenar tunjuk WebKit boleh MEMBUNYIKAN buffer pra-seek ~200ms pada
  // detik unmute (21-29% kekuatan), dan seek currentTime=0 boleh GAGAL SENYAP di iOS
  // buffer separa, bunyi terus pada posisi ~2s di mana fade fail dah naik. Gain WebAudio
  // BERFUNGSI di iOS (tak macam audio.volume yang disekat), jadi ramp gain 0->1 pada
  // detik unmute MENJAMIN telinga dengar mula dari senyap walau seek buat hal.
  // KUNCI iOS: AudioContext MESTI dicipta+resume DALAM gesture (dibuat dalam mulaMuted).
  // Defensif penuh: kalau mana-mana langkah gagal, gainNod kekal null dan elemen audio
  // berfungsi biasa (fade dalam fail tetap ada), sambungan hanya dibuat bila SEMUA jadi.
  let audioCtx = null, gainNod = null;
  function pasangGain() {
    if (gainNod || !audio) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const punca = ctx.createMediaElementSource(audio);
      const g = ctx.createGain();
      punca.connect(g); g.connect(ctx.destination);
      if (ctx.state === "suspended") { const r = ctx.resume(); if (r && r.catch) r.catch(function () {}); }
      audioCtx = ctx; gainNod = g;                 // simpan HANYA selepas semua berjaya
    } catch (e) { audioCtx = null; gainNod = null; }
  }
  // Ramp kelantangan 0 -> 1 (saat). Laluan utama: GainNode WebAudio. Fallback (browser
  // tanpa WebAudio): ramp audio.volume berjadual, berfungsi di desktop, diabai SENYAP
  // oleh iOS (tak apa: iOS sentiasa ada WebAudio jadi laluan utama yang jaga dia).
  let volTimer = null;
  function rampGain(saat) {
    try {
      if (gainNod && audioCtx) {
        if (audioCtx.state === "suspended") { const r = audioCtx.resume(); if (r && r.catch) r.catch(function () {}); }
        const kini = audioCtx.currentTime;
        gainNod.gain.cancelScheduledValues(kini);
        gainNod.gain.setValueAtTime(saat > 0 ? 0 : 1, kini);
        if (saat > 0) gainNod.gain.linearRampToValueAtTime(1, kini + saat);
        return;
      }
      // Fallback volume: batal ramp lama dulu supaya dua ramp tak berlawan.
      if (volTimer) { window.clearInterval(volTimer); volTimer = null; }
      if (!(saat > 0)) { audio.volume = 1; return; }
      audio.volume = 0;
      const mula = Date.now();
      volTimer = window.setInterval(function () {
        try {
          const nisbah = (Date.now() - mula) / (saat * 1000);
          audio.volume = Math.min(1, nisbah);
          if (nisbah >= 1) { window.clearInterval(volTimer); volTimer = null; }
        } catch (e) { try { window.clearInterval(volTimer); } catch (e2) {} volTimer = null; try { audio.volume = 1; } catch (e3) {} }
      }, 100);
    } catch (e) { try { audio.volume = 1; } catch (e2) {} }
  }

  // Cuba main SEGERAK, TIDAK muted (dipanggil dari tekan butang muzik = user minta bunyi
  // terus). play() pulangkan Promise yang mungkin REJECT (dasar autoplay / fail belum
  // sedia). .catch() defensif: kalau ditolak, event 'pause' belum tentu tercetus, jadi
  // kita betulkan butang OFF sendiri = jujur, dan tekanan butang berikut jadi gesture baru.
  function cubaMain() {
    pernahCuba = true;
    try {
      pasangGain();          // gesture butang = peluang sah cipta/resume AudioContext (iOS)
      rampGain(0.4);         // ramp pendek: elak hentak, dan PASTIKAN gain tak tersekat di 0
      audio.muted = false;
      const p = audio.play();
      if (p && typeof p.catch === "function") {
        p.catch(function () { tandaMain(false); });   // ditolak: butang kekal off (jujur)
      }
    } catch (e) {
      tandaMain(false);
    }
  }

  // MULA muzik guna teknik MUTED-UNLOCK, 2 saat selepas cover ditekan (dipanggil dari
  // gesture cover). KENAPA muted-unlock: iOS/Safari hanya benarkan audio.play() semasa
  // "transient user activation" (kebenaran gesture yang LUPUT sekejap selepas handler).
  // Kalau kita setTimeout(play, 2000) terus, aktivasi dah luput -> play() disekat = punca
  // kegagalan klasik. Jadi kita play() SEGERAK dalam gesture TETAPI audio.muted=true
  // (dibenarkan tanpa bunyi) yang MEMBUKA KUNCI elemen audio. Lepas 2 saat baru
  // currentTime=0 + muted=false supaya lagu berbunyi DARI MULA, 2 saat selepas cover.
  // Butang muzik boleh ON dari mula (audio memang 'playing' walau muted , status jujur).
  function mulaMuted() {
    pernahCuba = true;
    try {
      pasangGain();                       // cipta graf gain DALAM gesture cover (kunci iOS)
      // Pegang gain 0 SEPANJANG fasa muted (elemen muted pun senyap juga): audio yang
      // dipra-render pipeline WebAudio semasa menunggu tak boleh bawa gain lama, ukuran
      // WebKit tunjuk denyutan ~50ms bocor kalau gain dibiar penuh di sini.
      if (gainNod && audioCtx) { try { gainNod.gain.setValueAtTime(0, audioCtx.currentTime); } catch (e) {} }
      audio.muted = true;                 // muted: dibenarkan main dalam gesture, buka kunci
      const p = audio.play();
      if (p && typeof p.catch === "function") {
        // Ditolak: batal jadual unmute, nyahmute (elak senyap tersekat), butang OFF (jujur).
        p.catch(function () { batalUnmute(); try { audio.muted = false; } catch (e) {} tandaMain(false); });
      }
      // Jadual unmute 2s. TURUTAN PENTING (ukuran WebKit buktikan): seek ke 0 dibuat
      // SEMASA MASIH MUTED dan unmute HANYA selepas event 'seeked' (fallback 250ms kalau
      // seek gagal senyap macam iOS buffer separa), supaya buffer pra-seek TAK sempat
      // berbunyi. rampGain(4) menjamin kelantangan tetap mula dari 0 walau seek gagal.
      // Kalau user jeda dalam tempoh 2s ini, btn handler batalkan timer.
      batalUnmute();
      unmuteTimer = window.setTimeout(function () {
        unmuteTimer = null;
        let dibunyikan = false;
        const bunyikan = function () {
          if (dibunyikan) return;
          dibunyikan = true;
          try { audio.removeEventListener("seeked", bunyikan); } catch (e) {}
          rampGain(4);                                   // jaminan: senyap -> penuh 4 saat
          try { audio.muted = false; } catch (e) {}
        };
        try {
          audio.addEventListener("seeked", bunyikan);
          audio.currentTime = 0;                          // seek semasa masih muted (senyap)
        } catch (e) { bunyikan(); }
        window.setTimeout(bunyikan, 250);                 // fallback: seek gagal/lambat
      }, 2000);
    } catch (e) {
      batalUnmute();
      try { audio.muted = false; } catch (e2) {}
      tandaMain(false);
    }
  }

  // Butang: toggle jeda/main, dipacu keadaan SEBENAR audio.paused. Tengah main -> jeda
  // (event 'pause' tanda butang off). Jeda/belum -> cuba main (unmuted) dalam gesture ini.
  btn.addEventListener("click", function () {
    try {
      if (!audio.paused) {                              // main (termasuk tempoh muted 2s) -> jeda
        batalUnmute();                                 // batal unmute supaya tak bunyi selepas jeda
        try { audio.muted = false; } catch (e) {}      // main berikut jadi bunyi biasa
        audio.pause();
        return;
      }
    } catch (e) {}
    cubaMain();                                        // jeda/belum -> cuba main (gesture baru)
  });

  // Dipanggil dari cover (gesture pengguna) SEGERAK, sebelum sebarang setTimeout dalam
  // buka(). Guna muted-unlock: lagu mula 2 saat selepas cover ditekan.
  function mulaAuto() { mulaMuted(); }

  // Naikkan preload ke "auto" SELEPAS page settle supaya audio siap buffer & main
  // serta-merta bila cover ditekan, TANPA merebut jalur kritikal (font/Firebase) masa
  // muat awal. Di iOS preload diabai sehingga gesture, jadi tiada data terbazir di
  // mobile; di desktop ia beri main segera. Guard pernahCuba: kalau tetamu dah tekan
  // cover dulu, JANGAN load() (elak reset/putus audio yang tengah jalan). Ralat diabai.
  function panaskan() {
    try {
      if (!audio || pernahCuba) return;
      // Hormat tetamu data terhad: Save-Data / sambungan 2g = jangan buffer mp3 1.5MB
      // secara senyap; lagu tetap main bila cover ditekan (buffer on demand sahaja).
      const sambungan = navigator.connection;
      if (sambungan && (sambungan.saveData || /2g/.test(String(sambungan.effectiveType || "")))) return;
      if (audio.preload !== "auto") { audio.preload = "auto"; audio.load(); }
    } catch (e) {}
  }
  try {
    if (document.readyState === "complete") window.setTimeout(panaskan, 1200);
    else window.addEventListener("load", function () { window.setTimeout(panaskan, 1200); }, { once: true });
  } catch (e) {}

  return { mulaAuto: mulaAuto };
})();

// ====== 7. BUKU TETAMU ======
// VARIANT jemputanKahwinKA: bahagian BACA ucapan ditutup sepenuhnya. Feed auto-scroll
// (query Firestore untuk PAPARKAN ucapan tetamu) dibuang; seksyen Buku Tetamu di
// index.html kini hanya CTA "Berikan Ucapan" (menuju rsvp.html). Hantar ucapan + RSVP
// kekal berfungsi melalui borang rsvp.html + app.js.

// ====== 8. PARALLAX LEMBUT (hiasan .lp-deko dalam kad bergerak sikit ikut skrol) ======
// Satu listener scroll passive + throttle rAF: baca scrollY SEKALI per frame, tulis
// var --lp-par (translateY, digabung dgn rotate CSS elemen). TIADA baca layout dalam
// loop (tiada getBoundingClientRect). Mati penuh bila reduced-motion.
(function parallaxInit() {
  if (REDUCED.matches) return;
  const dekos = Array.prototype.slice.call(document.querySelectorAll(".lp-kad .lp-deko"));
  if (!dekos.length) return;
  const MAKS = 14;   // anjakan maksimum (px), sejajar arahan
  // Faktor kecil BERBEZA ikut elemen (0.03..0.065) supaya ada kedalaman halus.
  dekos.forEach(function (el, i) { el._par = 0.03 + (i % 5) * 0.009; });
  let menunggu = false;
  function frame() {
    menunggu = false;
    const y = window.scrollY || window.pageYOffset || 0;
    for (let i = 0; i < dekos.length; i++) {
      const el = dekos[i];
      let off = y * el._par;
      if (off > MAKS) off = MAKS;
      else if (off < -MAKS) off = -MAKS;
      el.style.setProperty("--lp-par", off.toFixed(1) + "px");
    }
  }
  window.addEventListener("scroll", function () {
    if (!menunggu) { menunggu = true; requestAnimationFrame(frame); }
  }, { passive: true });
  frame();
})();

// ====== Penyelaras SEJARAH modal (butang Back tutup modal, bukan keluar laman) ======
// Bila mana-mana modal (RSVP/Hadiah) dibuka, kita pushState SATU entri sejarah. Tekan
// Back (popstate) menutup modal yang terbuka dan MASIH kekal di index.html. Tutup lewat
// X/overlay/Esc/postMessage pula memanggil history.back() untuk MENGGUGURKAN entri itu,
// supaya buka-tutup berulang TIDAK menimbun entri (satu entri hidup pada satu masa).
// Defensif sepenuhnya (semua akses history dibalut try/catch).
// FOCUS TRAP lewat inert: aria-modal sahaja TIDAK menghalang Tab dari lari ke latar
// (diukur 4-6 tekanan Tab bocor keluar modal). inert pada latar = fokus + klik + AT
// semuanya terkunci dalam modal; pulih bila tutup. Defensif: elemen tiada -> senyap.
function latarInert(on) {
  ["lpKad", "lpDock", "lpMuzik"].forEach(function (id) {
    try {
      const el = document.getElementById(id);
      if (!el) return;
      if (on) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    } catch (e) {}
  });
}

// KITAR TAB dalam modal: inert dah menghalang fokus sampai ke kawalan latar, tapi
// selepas elemen terakhir modal, Tab masih singgah di <body>/chrome pelayar sebelum
// pusing balik (perangai standard inert). Handler ini melengkapkan inert: Tab pada
// hujung terus melompat ke hujung bertentangan, fokus tak pernah keluar dari kandungan
// modal. Defensif penuh: querySelectorAll gagal / tiada elemen -> biarkan default.
function pasangKitarTab(modal) {
  // Senarai elemen fokus sebenar dalam modal (tak termasuk sentinel di bawah).
  function senaraiFokus() {
    const semua = modal.querySelectorAll(
      'button, a[href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])'
    );
    return Array.prototype.filter.call(semua, function (el) {
      return !el.disabled && !el.hasAttribute("data-lp-sentinel") && el.getClientRects().length > 0;
    });
  }
  // Handler keydown: kes fokus berada dalam dokumen induk.
  modal.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    try {
      const boleh = senaraiFokus();
      if (!boleh.length) return;
      const pertama = boleh[0];
      const akhir = boleh[boleh.length - 1];
      const aktif = document.activeElement;
      if (e.shiftKey && (aktif === pertama || !modal.contains(aktif))) {
        e.preventDefault(); akhir.focus();
      } else if (!e.shiftKey && (aktif === akhir || !modal.contains(aktif))) {
        e.preventDefault(); pertama.focus();
      }
    } catch (err) {}
  });
  // SENTINEL fokus di hujung modal: bila fokus berada DALAM iframe (borang RSVP),
  // keydown tak sampai ke dokumen induk, jadi handler atas tak nampak Tab yang keluar
  // dari iframe. Sentinel = elemen fokus halimunan di awal/akhir modal; Tab yang
  // melepasi hujung mendarat padanya dan terus dipusing ke hujung bertentangan.
  try {
    function buatSentinel(keAkhir) {
      const s = document.createElement("div");
      s.tabIndex = 0;
      s.setAttribute("data-lp-sentinel", "");
      s.setAttribute("aria-hidden", "true");
      s.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none";
      s.addEventListener("focus", function () {
        try {
          const boleh = senaraiFokus();
          if (!boleh.length) return;
          (keAkhir ? boleh[boleh.length - 1] : boleh[0]).focus();
        } catch (err) {}
      });
      return s;
    }
    modal.insertBefore(buatSentinel(true), modal.firstChild);  // Shift+Tab melepasi awal -> ke akhir
    modal.appendChild(buatSentinel(false));                    // Tab melepasi akhir -> ke awal
  } catch (err) {}
}

const modalHistory = (function () {
  let tutupAktif = null;   // fungsi tutup(true) modal yang sedang terbuka (dipanggil bila Back)
  let adaEntri = false;    // sudah pushState entri milik kita?
  function bukaSelesai(tutupFn) {
    tutupAktif = tutupFn;
    if (!adaEntri) {
      try { history.pushState({ lpModal: 1 }, ""); adaEntri = true; } catch (e) {}
    }
  }
  function tutupSelesai() {
    // Ditutup lewat X/overlay/Esc/postMessage (BUKAN dari popstate): gugurkan entri kita.
    tutupAktif = null;
    if (adaEntri) { adaEntri = false; try { history.back(); } catch (e) {} }
  }
  window.addEventListener("popstate", function () {
    // Back ditekan: browser sudah gugurkan entri kita. Kalau ada modal terbuka, TUTUP ia
    // sahaja (jangan history.back lagi -> elak keluar laman / gugur berganda).
    if (tutupAktif) {
      adaEntri = false;
      const f = tutupAktif;
      tutupAktif = null;
      try { f(); } catch (e) {}   // f = tutup(true): fromPop, jadi takkan panggil tutupSelesai
    }
  });
  return { bukaSelesai: bukaSelesai, tutupSelesai: tutupSelesai };
})();

// ====== 9. MODAL RSVP (borang rsvp.html dalam pop up, tak keluar page) ======
// Butang menuju rsvp.html (CTA RSVP, dock RSVP, "Berikan Ucapan") dipintas: buka
// borang dalam modal iframe (rsvp.html?embed=1) ATAS landing. PROGRESSIVE ENHANCEMENT:
// href asal kekal dalam HTML, jadi kalau modul ni gagal, klik = navigasi biasa.
(function modalInit() {
  const modal = document.getElementById("lpModal");
  const badan = document.getElementById("lpModalBadan");
  const btnTutup = document.getElementById("lpModalTutup");
  if (!modal || !badan) return;
  let iframe = null;
  let pencetus = null;     // butang yang buka modal (fokus balik bila tutup)
  let sedangBuka = false;

  function kunciSkrol(on) {
    // Kunci skrol badan masa modal buka (pulih bila tutup), sama gaya cover.
    try {
      document.documentElement.style.overflow = on ? "hidden" : "";
      document.body.style.overflow = on ? "hidden" : "";
    } catch (e) {}
  }
  function buka(dari) {
    if (sedangBuka) return;
    sedangBuka = true;
    pencetus = dari || null;
    // iframe LAZY: cipta sekali pada buka pertama, kekal untuk buka semula pantas.
    if (!iframe) {
      try {
        iframe = document.createElement("iframe");
        iframe.setAttribute("title", "Borang RSVP kehadiran");
        iframe.setAttribute("src", "./rsvp.html?embed=1");   // guna semula borang + Firebase sedia ada
        badan.appendChild(iframe);
      } catch (e) { iframe = null; }
    }
    modal.hidden = false;
    kunciSkrol(true);
    latarInert(true);   // trap fokus: latar inert, Tab berputar dalam modal sahaja
    // Tambah is-buka pada frame seterusnya supaya transition (fade + naik) main,
    // bukan lompat. Reduced-motion: CSS matikan transition -> muncul terus.
    requestAnimationFrame(function () { modal.classList.add("is-buka"); });
    // Daftar entri sejarah: Back akan tutup modal ini (tutup(true) = tanpa history.back lagi).
    modalHistory.bukaSelesai(function () { tutup(true); });
    // Fokus dipindah ke modal (butang tutup).
    try { btnTutup.focus(); } catch (e) {}
  }
  function tutup(fromPop) {
    if (!sedangBuka) return;
    sedangBuka = false;
    modal.classList.remove("is-buka");
    kunciSkrol(false);
    latarInert(false);
    // Sorok sepenuhnya selepas transition (elak modal invisible masih tangkap klik).
    if (REDUCED.matches) { modal.hidden = true; }
    else { window.setTimeout(function () { if (!sedangBuka) modal.hidden = true; }, 260); }
    // Gugurkan entri sejarah HANYA bila tutup bukan dari popstate (Back sudah gugurkan sendiri).
    if (!fromPop) modalHistory.tutupSelesai();
    // Fokus balik ke butang pencetus.
    try { if (pencetus) pencetus.focus(); } catch (e) {}
    pencetus = null;
  }

  // Pintas klik pautan rsvp.html sahaja (bukan index.html). Hormat klik
  // ubahsuai (ctrl/cmd/shift/alt/butang tengah) supaya "buka tab baru" tetap jalan.
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (!/(^|\/)rsvp\.html(\?|#|$)/.test(href)) return;
    e.preventDefault();
    buka(a);
  });

  if (btnTutup) btnTutup.addEventListener("click", function () { tutup(); });
  pasangKitarTab(modal);   // Tab memusing kemas dalam modal (pelengkap inert)
  // Klik overlay (luar kad) = tutup.
  modal.addEventListener("click", function (e) {
    if (e.target && e.target.hasAttribute && e.target.hasAttribute("data-lp-tutup")) tutup();
  });
  // Esc = tutup. Ini tangkap Esc bila fokus di CHROME modal (butang tutup/overlay). Bila
  // fokus di DALAM borang iframe, keydown tak sampai ke dokumen induk -> lihat jambatan
  // postMessage di bawah.
  document.addEventListener("keydown", function (e) {
    if (sedangBuka && (e.key === "Escape" || e.key === "Esc")) { e.preventDefault(); tutup(); }
  });
  // JAMBATAN ESC DARI IFRAME: rsvp.html (mod embed) hantar postMessage "lp-rsvp-esc" bila
  // Esc ditekan semasa fokus di dalam borang. Kita sahkan origin sama + sumber = iframe kita
  // sendiri sebelum bertindak (elak mesej luar). Defensif try/catch.
  window.addEventListener("message", function (e) {
    try {
      if (e.origin !== location.origin) return;
      if (!iframe || e.source !== iframe.contentWindow) return;
      if (e.data === "lp-rsvp-esc") tutup();
    } catch (err) {}
  });
})();

// ====== 10. MODAL SALAM KAUT (butang dock "Hadiah" -> QR DuitNow) ======
// Guna semula shell .lp-modal* (tiada duplikasi CSS). Logik buka/tutup BERASINGAN
// daripada modal RSVP supaya modal sedia ada tak tersentuh (kandungan Hadiah statik,
// bukan iframe). Sama corak: scroll lock, fokus ke butang tutup, Esc/overlay/X tutup,
// fokus balik ke pencetus. Defensif: elemen tiada -> senyap.
(function modalHadiahInit() {
  const modal = document.getElementById("lpModalHadiah");
  // DUA pencetus kongsi modal SAMA (tiada duplikasi markup): butang dock "Hadiah" +
  // butang CTA dalam seksyen Salam Kaut yang mengalir dalam halaman. Kedua-dua <button>
  // (bukan <a>) supaya dockInit/modalInit abaikan.
  const pencetusEls = Array.prototype.slice.call(
    document.querySelectorAll("#lpDockHadiah, #lpSalamKautCta")
  );
  const btnTutup = document.getElementById("lpModalHadiahTutup");
  if (!modal || !pencetusEls.length) return;
  let sedangBuka = false;
  let pencetus = null;

  function kunciSkrol(on) {
    try {
      document.documentElement.style.overflow = on ? "hidden" : "";
      document.body.style.overflow = on ? "hidden" : "";
    } catch (e) {}
  }
  function buka(dari) {
    if (sedangBuka) return;
    sedangBuka = true;
    // Simpan butang yang membuka supaya fokus PULANG betul bila modal ditutup.
    pencetus = dari || pencetusEls[0];
    modal.hidden = false;
    kunciSkrol(true);
    latarInert(true);   // trap fokus: latar inert, Tab berputar dalam modal sahaja
    // Tambah is-buka frame seterusnya supaya fade + naik main (reduced-motion: CSS
    // matikan transition -> muncul terus).
    requestAnimationFrame(function () { modal.classList.add("is-buka"); });
    // Daftar entri sejarah: Back tutup modal ini (tutup(true) = tanpa history.back lagi).
    modalHistory.bukaSelesai(function () { tutup(true); });
    try { if (btnTutup) btnTutup.focus(); } catch (e) {}
  }
  function tutup(fromPop) {
    if (!sedangBuka) return;
    sedangBuka = false;
    modal.classList.remove("is-buka");
    kunciSkrol(false);
    latarInert(false);  // WAJIB sebelum focus(): pencetus Salam Kaut duduk DALAM lpKad yang inert
    if (REDUCED.matches) { modal.hidden = true; }
    else { window.setTimeout(function () { if (!sedangBuka) modal.hidden = true; }, 260); }
    if (!fromPop) modalHistory.tutupSelesai();
    try { if (pencetus) pencetus.focus(); } catch (e) {}
    pencetus = null;
  }

  pencetusEls.forEach(function (el) {
    el.addEventListener("click", function () { buka(el); });
  });
  if (btnTutup) btnTutup.addEventListener("click", function () { tutup(); });
  pasangKitarTab(modal);   // Tab memusing kemas dalam modal (pelengkap inert)
  // Klik overlay (luar kad) = tutup.
  modal.addEventListener("click", function (e) {
    if (e.target && e.target.hasAttribute && e.target.hasAttribute("data-lp-tutup")) tutup();
  });
  // Esc = tutup (guard sedangBuka: hanya modal yang terbuka bertindak balas).
  document.addEventListener("keydown", function (e) {
    if (sedangBuka && (e.key === "Escape" || e.key === "Esc")) { e.preventDefault(); tutup(); }
  });
})();
