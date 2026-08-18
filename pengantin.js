// Logik halaman rahsia pengantin: ringkasan + senarai penuh RSVP.
//
// APA MAKSUDNYA (bahasa biasa):
// Halaman ni untuk pengantin sahaja. Ia dikunci dengan satu "kata laluan"
// yang diletak dalam pautan (?kunci=...). Tanpa kunci betul, halaman tak
// tunjuk apa apa dan tak sentuh pangkalan data. Dengan kunci betul, ia
// tunjuk jumlah hadir, jumlah orang, siapa tak hadir, dan semua ucapan.

import { firebaseConfig, konfigurasiBelumSiap } from "./firebaseConfig.js";

// Kunci akses pengantin (gabungan nama + tarikh + 4 aksara rawak).
// Rujuk README.md untuk pautan penuh. Tukar nilai ni untuk tukar kunci.
const KUNCI_PENGANTIN = "khadizahAnwar3008x7qz";

const notisSetup = document.getElementById("notisSetup");
const tiadaAkses = document.getElementById("tiadaAkses");
const papan = document.getElementById("papan");

// Semak kunci dari URL (?kunci=...)
const parameter = new URLSearchParams(window.location.search);
const kunciDiberi = parameter.get("kunci");

if (kunciDiberi !== KUNCI_PENGANTIN) {
  // Kunci salah / tiada: papar halaman sopan, JANGAN fetch data.
  tiadaAkses.style.display = "block";
} else if (konfigurasiBelumSiap(firebaseConfig)) {
  // Kunci betul tapi Firebase belum siap: notis mesra.
  notisSetup.classList.add("tunjuk");
  papan.style.display = "block";
} else {
  papan.style.display = "block";
  mulakanPapan();
}

// Selamatkan teks tetamu (elak XSS bila papar dalam HTML).
function selamatkanTeks(teks) {
  const div = document.createElement("div");
  div.textContent = teks == null ? "" : String(teks);
  return div.innerHTML;
}

async function mulakanPapan() {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
  const {
    getFirestore, collection, onSnapshot, query, orderBy,
  } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const rujukanRsvp = collection(db, "rsvp");

  const statEntriHadir = document.getElementById("statEntriHadir");
  const statPax = document.getElementById("statPax");
  const statTidak = document.getElementById("statTidak");
  const jadualBadan = document.getElementById("jadualBadan");
  const senaraiKosong = document.getElementById("senaraiKosong");
  const ucapanSenarai = document.getElementById("ucapanSenarai");
  const ucapanKosong = document.getElementById("ucapanKosong");

  const soalan = query(rujukanRsvp, orderBy("masa", "desc"));
  onSnapshot(soalan, function (petikan) {
    let entriHadir = 0;
    let jumlahPax = 0;
    let jumlahTidak = 0;
    const barisJadual = [];
    const kadUcapan = [];

    petikan.forEach(function (dok) {
      const data = dok.data();
      const status = data.status === "hadir" ? "hadir" : "tidak";
      const pax = Number(data.pax) || 0;
      const nama = data.nama || "Tetamu";
      const ucapan = (data.ucapan || "").trim();

      if (status === "hadir") {
        entriHadir += 1;
        jumlahPax += pax;
      } else {
        jumlahTidak += 1;
      }

      const pil = status === "hadir"
        ? '<span class="pil pil-hadir">Hadir</span>'
        : '<span class="pil pil-tidak">Tidak</span>';
      barisJadual.push(
        "<tr>" +
          "<td>" + selamatkanTeks(nama) + "</td>" +
          "<td>" + pil + "</td>" +
          "<td>" + (status === "hadir" ? pax : "—") + "</td>" +
        "</tr>"
      );

      if (ucapan) {
        kadUcapan.push(
          '<article class="ucapan-kad">' +
            '<p class="ucapan-teks">' + selamatkanTeks(ucapan) + "</p>" +
            '<p class="ucapan-nama">' + selamatkanTeks(nama) + "</p>" +
          "</article>"
        );
      }
    });

    statEntriHadir.textContent = entriHadir;
    statPax.textContent = jumlahPax;
    statTidak.textContent = jumlahTidak;

    if (barisJadual.length === 0) {
      jadualBadan.innerHTML = "";
      senaraiKosong.style.display = "block";
    } else {
      senaraiKosong.style.display = "none";
      jadualBadan.innerHTML = barisJadual.join("");
    }

    if (kadUcapan.length === 0) {
      ucapanSenarai.innerHTML = "";
      ucapanKosong.style.display = "block";
    } else {
      ucapanKosong.style.display = "none";
      ucapanSenarai.innerHTML = kadUcapan.join("");
    }
  }, function (ralat) {
    console.error("Gagal baca data pengantin:", ralat);
    senaraiKosong.textContent = "Maaf, data tidak dapat dimuatkan buat masa ini.";
    senaraiKosong.style.display = "block";
  });
}
