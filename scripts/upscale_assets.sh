#!/usr/bin/env bash
# Real-ESRGAN 2x upscale of all VÖLT site assets (frames, images, posters, videos).
# Requires: ~/tools/realesrgan/realesrgan-ncnn-vulkan + ffmpeg + cwebp
#
# Strategy:
#   - 2x via realesrgan-x4plus (photo model) → ncnn downscales 4x→2x internally
#   - Threading 2:4:2 saturates RTX 4060
#   - WebP output at quality 85 to keep file size in check
#   - Videos: extract → upscale → re-encode all-keyframe MP4 (matches scroll-scrub recipe)

set -euo pipefail

BIN=$HOME/tools/realesrgan/realesrgan-ncnn-vulkan
MODELS=$HOME/tools/realesrgan/models
ROOT=/home/wahdan/work/3d_websites/paddel
PUB=$ROOT/public
WORK=$ROOT/.upscale_work

WEBP_Q=85       # WebP quality for stills
CRF=22          # x264 CRF for re-encoded videos
PRESET=slow
# realesrgan-x4plus is BROKEN in this ncnn-vulkan build — produces tile-grid
# kaleidoscope on inputs >~512px and mangles RGBA alpha. realesr-animevideov3
# is native 2x, handles RGBA cleanly, and is ~13x faster.
MODEL=realesr-animevideov3
TILE=256        # explicit tile size — never use -t 0 (auto picks broken value)
THREADS="2:4:2"

LOG=$ROOT/.upscale.log
exec > >(tee -a "$LOG") 2>&1

mkdir -p "$WORK"
echo "==== START $(date) ===="

step() { echo ""; echo "==== $* ===="; }

upscale_dir() {
  # $1 = input dir   $2 = output dir (created)
  local in=$1 out=$2
  mkdir -p "$out"
  "$BIN" -i "$in" -o "$out" -n "$MODEL" -s 2 -t "$TILE" -f webp -j "$THREADS" -m "$MODELS" 2>&1 \
    | grep -E "^[0-9]" | tail -5
}

upscale_one() {
  # $1 = input file   $2 = output file
  local in=$1 out=$2
  mkdir -p "$(dirname "$out")"
  "$BIN" -i "$in" -o "$out" -n "$MODEL" -s 2 -t "$TILE" -f webp -m "$MODELS" 2>&1 \
    | grep -E "done|%" | tail -2
}

# Re-compress all WebP output via PIL at fixed quality (ncnn webp is uncompressed-large).
recompress_webp_dir() {
  local dir=$1
  echo "recompress $dir @ q=$WEBP_Q (PIL)"
  python3 - "$dir" "$WEBP_Q" <<'PY'
import sys, os, glob
from PIL import Image
d, q = sys.argv[1], int(sys.argv[2])
files = sorted(glob.glob(os.path.join(d, "*.webp")))
for f in files:
    im = Image.open(f)
    im.save(f + ".tmp", "WEBP", quality=q, method=6)
    os.replace(f + ".tmp", f)
print(f"  ✓ recompressed {len(files)} files")
PY
}

# ---------------------------------------------------------------
# 1) Turntable WebP frames (148 files, 1280×720 → 2560×1440)
# ---------------------------------------------------------------
step "1/4 turntable frames (148 files)"
TURN_OUT=$WORK/hero_desktop
rm -rf "$TURN_OUT"
upscale_dir "$PUB/hero/desktop" "$TURN_OUT"
recompress_webp_dir "$TURN_OUT"
rm -rf "$PUB/hero/desktop"
mv "$TURN_OUT" "$PUB/hero/desktop"
echo "✓ turntable: $(ls "$PUB/hero/desktop" | wc -l) frames, $(du -sh "$PUB/hero/desktop" | cut -f1)"

# ---------------------------------------------------------------
# 2) Product images (3 files, tiny → ~700×1300)
# ---------------------------------------------------------------
step "2/4 product images (3 files)"
PROD_OUT=$WORK/product
rm -rf "$PROD_OUT"
upscale_dir "$PUB/product" "$PROD_OUT"
recompress_webp_dir "$PROD_OUT"
rm -rf "$PUB/product"
mv "$PROD_OUT" "$PUB/product"
echo "✓ product: $(ls "$PUB/product" | wc -l) files, $(du -sh "$PUB/product" | cut -f1)"

# ---------------------------------------------------------------
# 3) Posters (3 files) — will be regenerated from upscaled videos
#    Skip here; handled per-video in step 4.
# ---------------------------------------------------------------
step "3/4 posters (deferred — regenerated per video in step 4)"

# ---------------------------------------------------------------
# 4) Videos (4 files) — extract → upscale → re-encode all-keyframe
# ---------------------------------------------------------------
upscale_video() {
  local name=$1   # e.g. hero
  local src=$PUB/videos/$name.mp4
  local dst=$src
  local frames_in=$WORK/$name/in
  local frames_out=$WORK/$name/out

  step "video: $name"
  mkdir -p "$frames_in" "$frames_out"

  echo "extract frames from $src ..."
  ffmpeg -y -v error -i "$src" -q:v 1 "$frames_in/f_%04d.png"
  echo "  $(ls "$frames_in" | wc -l) frames extracted"

  echo "upscale 2x ..."
  "$BIN" -i "$frames_in" -o "$frames_out" -n "$MODEL" -s 2 -t "$TILE" -f png -j "$THREADS" -m "$MODELS" 2>&1 \
    | grep -E "^[0-9]" | tail -3

  echo "re-encode all-keyframe MP4 ..."
  local FPS
  FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$src")
  ffmpeg -y -v error \
    -framerate "$FPS" -i "$frames_out/f_%04d.png" \
    -c:v libx264 -crf "$CRF" -preset "$PRESET" \
    -pix_fmt yuv420p \
    -g 1 -keyint_min 1 -sc_threshold 0 \
    -movflags +faststart \
    -an \
    "$dst.new.mp4"
  mv "$dst.new.mp4" "$dst"

  echo "regen poster ..."
  ffmpeg -y -v error -ss 0 -i "$dst" -frames:v 1 -q:v 80 -c:v libwebp "$PUB/posters/$name.webp" 2>/dev/null || true

  local sz=$(du -h "$dst" | cut -f1)
  local psz=$(du -h "$PUB/posters/$name.webp" 2>/dev/null | cut -f1 || echo "n/a")
  echo "✓ $name.mp4 → $sz, poster $psz"

  # cleanup per-video work to save disk
  rm -rf "$WORK/$name"
}

step "4/4 videos (4 files)"
for v in hero charge impact turntable; do
  upscale_video "$v"
done

step "DONE"
du -sh "$PUB" "$ROOT/public.bak"
echo "==== END $(date) ===="
