# Resipi SERI-TRITONE "Petang Keemasan" (verdict timbang 15 Ogos + pindaan devil's
# advocate): dijana dari ORIGINAL berwarna dalam folder ini (BUKAN re-tint fail plum,
# hasil jadi keruh). Peta kepadatan-dakwat -> 3 tona: kawasan dakwat PALING padat =
# bayang plum lembut, badan = ivory, kawasan paling ringan = highlight blush/emas.
# Saturasi terhasil <=35% (semua endpoint memang low-sat). Feather 26px pada sisi
# yang dakwatnya sampai ke sempadan crop (elak "tepi digunting", larangan user).
from PIL import Image
import numpy as np, sys, pathlib

DIR = pathlib.Path(__file__).parent

# Tangga tona (verdict): bayang plum lembut -> ivory -> highlight
PLUM   = np.array([0x7a, 0x5f, 0x82], dtype=np.float32)   # bayang
IVORY  = np.array([0xef, 0xe6, 0xd8], dtype=np.float32)   # badan
BLUSH  = np.array([0xec, 0xd3, 0xcd], dtype=np.float32)   # highlight lembut
EMAS   = np.array([0xec, 0xd9, 0xab], dtype=np.float32)   # highlight alternatif

def seriTritone(srcPath, outName, outW=400, gain=1.2, floor=0.14,
                highlight="blush", gamma=1.0, crop=None):
    im = Image.open(srcPath)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        latar = Image.new("RGBA", im.size, (255, 255, 255, 255))
        im = Image.alpha_composite(latar, im)
    im = im.convert("RGB")
    # crop subjek (peratus lebar/tinggi): buang teks plat, bingkai, rajah botani, akar,
    # supaya TIADA sisa segi empat (larangan user) dan subjek sahaja yang diproses
    if crop:
        x0, y0, x1, y1 = crop
        im = im.crop((int(im.width * x0), int(im.height * y0),
                      int(im.width * x1), int(im.height * y1)))
    if max(im.size) > 1400:
        r = 1400 / max(im.size)
        im = im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float32)
    # anggar kertas dari pinggir (median) -> alpha kepadatan dakwat (macam resipi plum)
    pinggir = np.concatenate([
        a[:3].reshape(-1, 3), a[-3:].reshape(-1, 3),
        a[:, :3].reshape(-1, 3), a[:, -3:].reshape(-1, 3)])
    kertas = np.median(pinggir, axis=0)
    kLum = 0.299 * kertas[0] + 0.587 * kertas[1] + 0.114 * kertas[2]
    lum = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    dLum = np.clip((kLum - lum) / max(40.0, kLum), 0, None)
    dCol = np.abs(a - kertas).sum(axis=2) / 380.0
    alpha = np.clip(np.maximum(dLum, dCol) * gain, 0, 1)
    alpha[alpha < floor] = 0.0
    t = np.clip(alpha ** gamma, 0, 1)
    HI = BLUSH if highlight == "blush" else EMAS
    # Gradient 3-hentian BERTERUSAN bias ivory (pembetulan v3 selepas semakan mata:
    # v1 terlalu gelap, v2 zon keras memposterkan detail watercolor. Berterusan =
    # detail engraving/watercolor kekal macam resipi plum terbukti; hentian 0.55
    # meletakkan majoriti badan bunga dalam julat highlight->ivory yang CERAH,
    # plum hanya menyelinap masuk pada dakwat paling padat = bayang, bukan badan).
    rgb = np.empty(a.shape, dtype=np.float32)
    m1 = t < 0.55
    tt = (t / 0.55)[..., None]
    rgb[m1] = (HI + (IVORY - HI) * tt)[m1]
    tt2 = ((t - 0.55) / 0.45)[..., None]
    rgb[~m1] = (IVORY + (PLUM - IVORY) * tt2)[~m1]
    out = np.concatenate([rgb, alpha[..., None] * 255], axis=2).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    # feather 26px pada sisi yang dakwat sampai sempadan (teknik fix "sprig digunting")
    aa = np.asarray(img).copy()
    al = aa[:, :, 3].astype(np.float32)
    F = 26
    ramp = (np.arange(F) + 1) / (F + 1)
    if al[:, :4].mean() > 25:   al[:, :F]  *= ramp[None, :]
    if al[:, -4:].mean() > 25:  al[:, -F:] *= ramp[::-1][None, :]
    if al[:4, :].mean() > 25:   al[:F, :]  *= ramp[:, None]
    if al[-4:, :].mean() > 25:  al[-F:, :] *= ramp[::-1][:, None]
    aa[:, :, 3] = al.astype(np.uint8)
    img = Image.fromarray(aa, "RGBA")
    if img.width > outW:
        img = img.resize((outW, int(img.height * outW / img.width)), Image.LANCZOS)
    p = DIR.parent / "aset" / "bunga" / (outName + ".webp")
    img.save(p, "WEBP", quality=82, method=6)
    print(outName, img.size, f"{p.stat().st_size//1024}KB")

if __name__ == "__main__":
    # peta anchor verdict (spesies BARU dari kolaj, pemilihan ikut BENTUK, resipi seragam).
    # v3: anemonePutihCurtis (engraving hatch penuh) & hydrangeaPink (plat rajah + daun
    # dakwat padat) DITOLAK selepas semakan mata (jadi blok/petak), ganti plat
    # watercolor bersih: daisyPutih (gema daisy putih kad Canva) & rosBlushPucat.
    # crop per-plat: buang teks/bingkai/rajah/akar (nilai ditentukan semakan mata bergrid)
    seriTritone(DIR / "daisyPutih.jpg",     "seriDaisy",   outW=380,
                highlight="emas", crop=(0.05, 0.02, 0.95, 0.92))
    seriTritone(DIR / "dahliaBlush.jpg",    "seriDahlia",  outW=360,
                highlight="blush", crop=(0.10, 0.03, 0.90, 0.88))
    seriTritone(DIR / "rosKuning.jpg",      "seriRosKuning", outW=360,
                highlight="emas", crop=(0.05, 0.02, 0.95, 0.92))
    seriTritone(DIR / "rosBlushPucat.jpg",  "seriRosBlush", outW=360,
                highlight="blush", crop=(0.05, 0.02, 0.95, 0.92))
    seriTritone(DIR / "bouquetAnemone.jpg", "seriBouquetHero", outW=480,
                highlight="emas", crop=(0.12, 0.02, 0.95, 0.85))
