# Proses SEMUA calon ke duotone plum (resipi sama dengan sprigClematis yang user suka),
# versi numpy (vektorized) sebab ratusan imej; per-piksel loop asal terlalu lambat.
from PIL import Image
import numpy as np, json, os, pathlib

DIR = pathlib.Path(__file__).parent
SP = DIR.parent
PROC = DIR / "proc"
PROC.mkdir(exist_ok=True)

GELAP = np.array([63, 38, 60], dtype=np.float32)
CERAH = np.array([154, 128, 158], dtype=np.float32)

def duotone(srcPath, outName, gain=1.2, floor=0.10, outW=300):
    try:
        im = Image.open(srcPath)
    except Exception:
        return None
    # imej PNG lutsinar: ratakan atas putih dulu supaya anggaran kertas konsisten
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        latar = Image.new("RGBA", im.size, (255, 255, 255, 255))
        im = Image.alpha_composite(latar, im)
    im = im.convert("RGB")
    # had saiz kerja untuk kelajuan
    if max(im.size) > 1100:
        r = 1100 / max(im.size)
        im = im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float32)
    H, W = a.shape[:2]
    if H < 60 or W < 60:
        return None
    # anggar warna kertas dari jalur pinggir (median)
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
    t = alpha[..., None]
    rgb = CERAH + (GELAP - CERAH) * t
    out = np.concatenate([rgb, alpha[..., None] * 255], axis=2).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    bbox = img.getbbox()
    if not bbox:
        return None
    img = img.crop(bbox)
    # metrik untuk auto-cull
    aa = np.asarray(img)[:, :, 3].astype(np.float32) / 255.0
    h2, w2 = aa.shape
    cover = float(aa.mean())
    tepi = [float(aa[:, :4].mean()), float(aa[:, -4:].mean()), float(aa[:4].mean()), float(aa[-4:].mean())]
    sisiKeras = sum(1 for tv in tepi if tv > 0.30)
    if img.width > outW:
        img = img.resize((outW, int(img.height * outW / img.width)), Image.LANCZOS)
    p = PROC / (outName + ".png")
    img.save(p, "PNG", optimize=True)
    return {"fail": p.name, "cover": round(cover, 3), "sisiKeras": sisiKeras,
            "w": img.width, "h": img.height, "nisbah": round(w2 / h2, 2)}

hasil = []

# 1) Calon kurasi sedia ada (set1/2/3)
setDirs = {
    "set1": SP / "bungaCalon" / "set1RedouteChoix",
    "set2": SP / "bungaCalon" / "set2Ensiklopedia",
    "set3": SP / "bungaCalon" / "set3LineArtD9",
}
lesenLama = {}
for s, d in setDirs.items():
    try:
        for e in json.load(open(d / "lesen.json")):
            lesenLama[e["peranan"]] = e
    except Exception:
        pass
    for f in sorted(d.iterdir()):
        if f.suffix.lower() not in (".jpg", ".jpeg", ".png"):
            continue
        nama = f.stem
        m = duotone(f, f"kur_{nama}")
        if m:
            e = lesenLama.get(nama, {})
            m.update({"id": f"kur_{nama}", "nama": nama, "sumber": "kurasi",
                      "lesen": e.get("lesen", "Public domain (kurasi)"),
                      "halaman": e.get("halaman", ""), "asal": e.get("asal", "")})
            hasil.append(m)

# 2) Calon baru langsing
man = json.load(open(DIR / "manifestLangsing.json"))
for i, it in enumerate(man):
    src = DIR / "raw" / f"n{i:03d}.img"
    if not src.exists():
        continue
    m = duotone(src, f"new_{i:03d}")
    if m:
        m.update({"id": f"new_{i:03d}", "nama": it["title"].replace("File:", "")[:60],
                  "sumber": "baru", "lesen": it["lesen"], "halaman": it["halaman"],
                  "asal": it["asal"], "queries": it.get("queries", [])})
        hasil.append(m)

json.dump(hasil, open(DIR / "metrik.json", "w"), indent=1)
lulus = [h for h in hasil if 0.02 <= h["cover"] <= 0.55 and h["sisiKeras"] <= 2]
print("diproses:", len(hasil), "| lulus auto-cull:", len(lulus))
json.dump(lulus, open(DIR / "lulusAuto.json", "w"), indent=1)
