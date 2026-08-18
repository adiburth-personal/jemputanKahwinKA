# Pembetulan bunga 15 Ogos malam (pusingan 2, arahan user):
# - pRosBurgundy: ganti jasmine Afrika di Hubungi (pilihan user kur_rosBurgundy)
# - cvBouquetBesar: ganti wisteria bucu kanan-atas cover (pilihan user kur_bouquetBesar)
# KENAPA jana dari ORIGINAL (bukan re-tint fail proc kolaj): proc cuma 300px lebar
# (thumbnail kolaj), paparan sebenar perlu ~2x; resipi duotone SAMA (GELAP/CERAH
# seiras sprigClematis yang user suka) jadi rupa kekal seperti kolaj yang dia pilih.
from PIL import Image
import numpy as np, pathlib

DIR = pathlib.Path(__file__).parent
OUT = DIR.parent / "aset" / "bunga"
SCRATCH = pathlib.Path("/private/tmp/claude-501/-Users-adizaini-miniProjects-rsvpKhadizahAnwar/8f853588-da4a-441f-9192-e7ddc021d0a0/scratchpad")

GELAP = np.array([63, 38, 60], dtype=np.float32)
CERAH = np.array([154, 128, 158], dtype=np.float32)


def _feather(img, F=26):
    aa = np.asarray(img).copy()
    al = aa[:, :, 3].astype(np.float32)
    ramp = (np.arange(F) + 1) / (F + 1)
    if al[:, :4].mean() > 25:
        al[:, :F] *= ramp[None, :]
    if al[:, -4:].mean() > 25:
        al[:, -F:] *= ramp[::-1][None, :]
    if al[:4, :].mean() > 25:
        al[:F, :] *= ramp[:, None]
    if al[-4:, :].mean() > 25:
        al[-F:, :] *= ramp[::-1][:, None]
    aa[:, :, 3] = al.astype(np.uint8)
    return Image.fromarray(aa, "RGBA")


def duotonePlum(srcPath, outName, outW, crop=None, buang=(), gain=1.2, floor=0.10):
    im = Image.open(srcPath).convert("RGB")
    if crop:
        x0, y0, x1, y1 = crop
        im = im.crop((int(im.width * x0), int(im.height * y0),
                      int(im.width * x1), int(im.height * y1)))
    # had kerja 1400px: cukup untuk outW<=640 tanpa lembap
    if max(im.size) > 1400:
        r = 1400 / max(im.size)
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
    # buang label/caption plat (kotak pecahan lebar/tinggi)
    H, W = alpha.shape
    for (x0, y0, x1, y1) in buang:
        alpha[int(H * y0):int(H * y1), int(W * x0):int(W * x1)] = 0.0
    rgb = CERAH + (GELAP - CERAH) * alpha[..., None]
    out = np.concatenate([rgb, alpha[..., None] * 255], axis=2).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    img = _feather(img)
    if img.width > outW:
        img = img.resize((outW, int(img.height * outW / img.width)), Image.LANCZOS)
    p = OUT / (outName + ".webp")
    img.save(p, "WEBP", quality=78, method=6)
    print(outName, img.size, f"{p.stat().st_size // 1024}KB")


if __name__ == "__main__":
    S1 = SCRATCH / "bungaCalon" / "set1RedouteChoix"
    # Rosa gallica flore giganteo (PD): caption italic di kaki plat DIBUANG.
    duotonePlum(S1 / "rosBurgundy.jpg", "pRosBurgundy", outW=460,
                crop=(0.04, 0.02, 0.96, 0.97), buang=((0.0, 0.90, 1.0, 1.0),))
    # Redoute flowers01 (PD): bouquet penuh untuk bucu cover.
    duotonePlum(S1 / "bouquetBesar.jpg", "cvBouquetBesar", outW=560,
                crop=(0.02, 0.01, 0.98, 0.99))
