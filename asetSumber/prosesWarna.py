# Gelombang "warna hidup + calon plum user" (arahan user 15 Ogos malam):
# 1) warnaAsli: cutout WARNA ASAL diharmonikan (hero + ros aturcara), saturasi
#    dilembutkan <=~0.45 supaya duduk elegant dengan palet lilac, bukan menjerit.
# 2) bersihPlum: fail proc duotone plum pilihan user dari kolaj dibedah bersih,
#    kepingan kertas/label/muka surat DIBUANG (larangan tepi petak), alpha
#    di-key semula dari keamatan dakwat, feather sisi yang terpotong.
from PIL import Image
import numpy as np, pathlib

DIR = pathlib.Path(__file__).parent
OUT = DIR.parent / "aset" / "bunga"
SCRATCH = pathlib.Path("/private/tmp/claude-501/-Users-adizaini-miniProjects-rsvpKhadizahAnwar/8f853588-da4a-441f-9192-e7ddc021d0a0/scratchpad")
PROC = SCRATCH / "bungaPlum" / "proc"

def _despeckle(alpha, pusingan=1):
    # buang bintik terpencil (kertas berbintik plat lama): morphological opening
    # atas saluran alpha sahaja, bunga solid terselamat sebab tebal
    from PIL import ImageFilter
    im = Image.fromarray(alpha.astype(np.uint8))
    for _ in range(pusingan):
        im = im.filter(ImageFilter.MinFilter(3))
    for _ in range(pusingan):
        im = im.filter(ImageFilter.MaxFilter(3))
    return np.asarray(im).astype(np.float32)

def _isiLubang(alpha):
    # isi lubang DALAMAN subjek (highlight sewarna kertas dalam bunga jadi telus ->
    # latar mauve menembusi, nampak tompok). Flood dari sempadan atas mask telus;
    # telus yang TAK tercapai dari sempadan = lubang dalaman, dinaikkan alpha.
    kecil = alpha[::4, ::4] > 60
    H, W = kecil.shape
    luar = np.zeros_like(kecil, dtype=bool)
    stack = [(0, j) for j in range(W) if not kecil[0, j]] + \
            [(H - 1, j) for j in range(W) if not kecil[H - 1, j]] + \
            [(i, 0) for i in range(H) if not kecil[i, 0]] + \
            [(i, W - 1) for i in range(H) if not kecil[i, W - 1]]
    for i, j in stack:
        luar[i, j] = True
    while stack:
        i, j = stack.pop()
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ni, nj = i + di, j + dj
            if 0 <= ni < H and 0 <= nj < W and not kecil[ni, nj] and not luar[ni, nj]:
                luar[ni, nj] = True
                stack.append((ni, nj))
    lubang = (~kecil) & (~luar)
    penuh = np.kron(lubang, np.ones((4, 4), dtype=bool))[:alpha.shape[0], :alpha.shape[1]]
    out = alpha.copy()
    out[penuh] = np.maximum(out[penuh], 235)
    return out

def _feather(img, F=26):
    aa = np.asarray(img).copy()
    al = aa[:, :, 3].astype(np.float32)
    ramp = (np.arange(F) + 1) / (F + 1)
    if al[:, :4].mean() > 25:   al[:, :F]  *= ramp[None, :]
    if al[:, -4:].mean() > 25:  al[:, -F:] *= ramp[::-1][None, :]
    if al[:4, :].mean() > 25:   al[:F, :]  *= ramp[:, None]
    if al[-4:, :].mean() > 25:  al[-F:, :] *= ramp[::-1][:, None]
    aa[:, :, 3] = al.astype(np.uint8)
    return Image.fromarray(aa, "RGBA")

def _simpan(img, outName, outW):
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    img = _feather(img)
    if img.width > outW:
        img = img.resize((outW, int(img.height * outW / img.width)), Image.LANCZOS)
    p = OUT / (outName + ".webp")
    img.save(p, "WEBP", quality=78, method=6)
    print(outName, img.size, f"{p.stat().st_size//1024}KB")
    return img

def warnaAsli(srcPath, outName, outW=480, gain=1.25, floor=0.13,
              satMax=0.45, tintIvory=0.05, crop=None):
    # cutout warna asal: alpha dari kepadatan dakwat (kertas dianggar dari pinggir,
    # teknik terbukti prosesSeri), RGB dikekalkan tapi saturasi dilembutkan supaya
    # harmoni dengan lilac (kompres lembut, bukan potong keras)
    im = Image.open(srcPath).convert("RGB")
    if crop:
        x0, y0, x1, y1 = crop
        im = im.crop((int(im.width * x0), int(im.height * y0),
                      int(im.width * x1), int(im.height * y1)))
    if max(im.size) > 1600:
        r = 1600 / max(im.size)
        im = im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float32)
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
    alpha = _isiLubang(alpha * 255) / 255.0
    # harmoni warna: kompres saturasi lembut ke siling satMax + tint ivory nipis
    mx = a.max(axis=2); mn = a.min(axis=2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    skala = np.where(sat > satMax, satMax / np.maximum(sat, 1e-6), 1.0)
    skala = 1.0 - (1.0 - skala) * 0.85          # kompres lembut, bukan potong keras
    l3 = lum[..., None]
    rgb = l3 + (a - l3) * skala[..., None]
    IVORY = np.array([0xef, 0xe6, 0xd8], dtype=np.float32)
    rgb = rgb * (1 - tintIvory) + IVORY * tintIvory
    out = np.concatenate([np.clip(rgb, 0, 255), alpha[..., None] * 255], axis=2).astype(np.uint8)
    return _simpan(Image.fromarray(out, "RGBA"), outName, outW)

def bersihPlum(procName, outName, outW=420, crop=None, buang=(),
               thrHi=None, kuat=1.0, speckle=0):
    # fail proc = duotone plum sedia jadi (rupa yang user nampak & pilih di kolaj).
    # Kerja di sini: BUANG sisa kertas/label (kotak `buang` dalam pecahan lebar/tinggi),
    # dan key semula alpha ikut keamatan dakwat supaya tompok kertas pucat lesap.
    im = Image.open(PROC / (procName + ".png")).convert("RGBA")
    if crop:
        x0, y0, x1, y1 = crop
        im = im.crop((int(im.width * x0), int(im.height * y0),
                      int(im.width * x1), int(im.height * y1)))
    a = np.asarray(im).astype(np.float32)
    lum = a[..., :3] @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    # kertas dalam duotone = plum paling pucat; anggar dari piksel beralpha
    ada = a[..., 3] > 10
    if ada.any():
        pucat = np.percentile(lum[ada], 97)
    else:
        pucat = 230.0
    if thrHi is None:
        thrHi = pucat - 6
    thrLo = thrHi - 55
    k = np.clip((thrHi - lum) / max(thrHi - thrLo, 1), 0, 1) ** kuat
    alpha = np.minimum(a[..., 3] / 255.0, k)
    alpha[alpha < 0.10] = 0.0
    for (x0, y0, x1, y1) in buang:
        H, W = alpha.shape
        alpha[int(H * y0):int(H * y1), int(W * x0):int(W * x1)] = 0.0
    if speckle:
        alpha = _despeckle(alpha * 255, speckle) / 255.0
    out = a.copy()
    out[..., 3] = alpha * 255
    return _simpan(Image.fromarray(out.astype(np.uint8), "RGBA"), outName, outW)

if __name__ == "__main__":
    # == WARNA ASAL (hero + aturcara), pembetulan v2: caption dibuang, lubang diisi ==
    warnaAsli(DIR / "bouquetAnemone.jpg", "warnaBouquetHero", outW=640,
              crop=(0.06, 0.02, 0.94, 0.845))
    warnaAsli(SCRATCH / "bungaCalon/set1RedouteChoix/bouquetBesar.jpg",
              "warnaBouquetB", outW=640, crop=(0.01, 0.0, 1.0, 0.99))
    warnaAsli(SCRATCH / "bungaCalon/set1RedouteChoix/rosBurgundy.jpg",
              "warnaRosAtur", outW=440, crop=(0.05, 0.02, 0.96, 0.84))
    # == CALON PLUM PILIHAN USER (v2: kertas degil + label dibedah habis) ==
    bersihPlum("new_018", "cvWisteria", outW=640,
               buang=((0.0, 0.0, 0.55, 0.16), (0.50, 0.0, 1.0, 0.14)))
    bersihPlum("new_105", "cvFuchsia", outW=640, crop=(0.06, 0.02, 0.80, 0.99),
               thrHi=138, speckle=2, buang=((0.28, 0.58, 1.0, 0.68),))
    bersihPlum("new_082", "pJasmineMet", outW=460, crop=(0.10, 0.13, 0.90, 0.60),
               kuat=0.55, speckle=1)
    bersihPlum("kur_babysBreathIlust", "pBabysIlust", outW=420,
               crop=(0.16, 0.015, 0.80, 0.915), thrHi=120, speckle=1,
               buang=((0.0, 0.42, 0.30, 0.65),))
    bersihPlum("new_077", "pJasmine", outW=420, buang=((0.0, 0.90, 1.0, 1.0),))
    bersihPlum("kur_rosKuning", "pRosKuning", outW=460, buang=((0.0, 0.92, 1.0, 1.0),))
    bersihPlum("new_080", "pJasmineAfr", outW=420)
    bersihPlum("kur_clematisUngu", "pClematisU", outW=420)
