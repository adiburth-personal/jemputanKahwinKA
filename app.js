// Logik halaman tetamu: borang RSVP sahaja.
//
// APA MAKSUDNYA (bahasa biasa):
// Fail ni "otak" halaman borang. Ia dengar bila tetamu tekan Hantar dan
// simpan jawapan ke pangkalan data (Firestore). Variant jemputanKahwinKA:
// bahagian BACA/paparan ucapan tetamu ditutup sepenuhnya, jadi fail ni hanya
// urus hantar RSVP + ucapan, tiada paparan ucapan orang lain.

import { firebaseConfig, konfigurasiBelumSiap } from "./firebaseConfig.js";

// Rujukan elemen halaman
const notisSetup = document.getElementById("notisSetup");
const borang = document.getElementById("borangRsvp");
const butangHantar = document.getElementById("butangHantar");
const medanPax = document.getElementById("medanPax");
const inputNama = document.getElementById("nama");
const inputPax = document.getElementById("pax");
const inputUcapan = document.getElementById("ucapan");
const ralatNama = document.getElementById("ralatNama");
const ralatStatus = document.getElementById("ralatStatus");
const terimaKasih = document.getElementById("terimaKasih");
const terimaKasihTeks = document.getElementById("terimaKasihTeks");
const radiosStatus = document.querySelectorAll('input[name="status"]');

// Tunjuk/sorok dropdown bilangan ikut pilihan hadir.
function kemasPaparanPax() {
  const dipilih = document.querySelector('input[name="status"]:checked');
  if (dipilih && dipilih.value === "hadir") {
    medanPax.classList.add("tunjuk");
  } else {
    medanPax.classList.remove("tunjuk");
  }
}
radiosStatus.forEach(function (radio) {
  radio.addEventListener("change", function () {
    kemasPaparanPax();
    ralatStatus.classList.remove("tunjuk");
  });
});
inputNama.addEventListener("input", function () {
  inputNama.setAttribute("aria-invalid", "false");
  ralatNama.classList.remove("tunjuk");
});

// ====== Mod setup belum siap ======
// Kalau tetapan Firebase masih placeholder, papar notis mesra dan
// matikan borang. JANGAN cuba sambung (elak error mentah / crash).
if (konfigurasiBelumSiap(firebaseConfig)) {
  notisSetup.classList.add("tunjuk");
  butangHantar.disabled = true;
  butangHantar.textContent = "Borang belum aktif";
} else {
  mulakanFirebase();
}

async function mulakanFirebase() {
  // Import SDK Firebase modular v10 terus dari CDN (tiada build step).
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
  const {
    getFirestore, collection, addDoc, serverTimestamp,
  } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const rujukanRsvp = collection(db, "rsvp");

  // ====== Hantar borang ======
  borang.addEventListener("submit", async function (peristiwa) {
    peristiwa.preventDefault();

    // Sahkan input asas
    const nama = inputNama.value.trim();
    const statusDipilih = document.querySelector('input[name="status"]:checked');
    let adaRalat = false;

    if (!nama) {
      inputNama.setAttribute("aria-invalid", "true");
      ralatNama.classList.add("tunjuk");
      adaRalat = true;
    }
    if (!statusDipilih) {
      ralatStatus.classList.add("tunjuk");
      adaRalat = true;
    }
    if (adaRalat) return;

    const status = statusDipilih.value; // "hadir" | "tidak"
    const pax = status === "hadir" ? Number(inputPax.value) : 0;
    const ucapan = inputUcapan.value.trim().slice(0, 1000);

    // Sekat double submit: matikan butang masa hantar
    butangHantar.disabled = true;
    butangHantar.textContent = "Menghantar...";

    try {
      await addDoc(rujukanRsvp, {
        nama: nama.slice(0, 80),
        status: status,
        pax: pax,
        ucapan: ucapan,
        masa: serverTimestamp(),
      });

      // Berjaya: sorok borang, papar keadaan terima kasih.
      borang.style.display = "none";
      terimaKasihTeks.textContent = status === "hadir"
        ? "Kami tak sabar nak berjumpa awak di majlis nanti. Jumpa 30 Ogos!"
        : "Terima kasih atas ucapan dan doa. Kehadiran awak dalam doa amat bermakna buat kami.";
      terimaKasih.classList.add("tunjuk");
      terimaKasih.scrollIntoView({ behavior: "smooth", block: "center" });
      // Variant jemputanKahwinKA: ucapan tersimpan ke Firestore (dikongsi dengan
      // rsvpKhadizahAnwar) tetapi TIDAK dipaparkan semula kepada tetamu di sini.
    } catch (ralat) {
      // Gagal: hidupkan semula butang supaya boleh cuba lagi.
      console.error("Gagal hantar RSVP:", ralat);
      butangHantar.disabled = false;
      butangHantar.textContent = "Hantar Kehadiran";
      ralatStatus.textContent = "Maaf, ada masalah menghantar. Sila cuba sekali lagi.";
      ralatStatus.classList.add("tunjuk");
    }
  });
}
