#!/bin/bash
set -e
set -o pipefail

BASE="/home/wahdan/work/3d_websites/paddel"
cd "$BASE"

mkdir -p videos/clean frames/raw frames/transparent public/hero/desktop logs

LOG="$BASE/logs/vid2_pipeline.log"
echo "=== Pipeline started at $(date) ===" > "$LOG"

# STEP 1: strip audio from vid2.mp4
echo "[1/4] Stripping audio..." | tee -a "$LOG"
ffmpeg -y -i videos/vid2.mp4 -c:v copy -an videos/clean/vid2.mp4 2>>"$LOG"
echo "  → videos/clean/vid2.mp4" | tee -a "$LOG"

# STEP 2: extract 148 frames at 1280px (18.5fps × 8s)
echo "[2/4] Extracting 148 PNG frames at 1280px..." | tee -a "$LOG"
rm -f frames/raw/frame_*.png
ffmpeg -y -i videos/clean/vid2.mp4 \
  -vf "fps=18.5,scale=1280:-2:flags=lanczos" \
  -q:v 1 \
  frames/raw/frame_%04d.png 2>>"$LOG"
RAW_COUNT=$(ls frames/raw/frame_*.png 2>/dev/null | wc -l)
echo "  → frames/raw/ ($RAW_COUNT PNGs)" | tee -a "$LOG"

# STEP 3: bulk background removal with rembg
echo "[3/4] Removing backgrounds with rembg (isnet-general-use)..." | tee -a "$LOG"
rm -f frames/transparent/frame_*.png
rembg p -m isnet-general-use frames/raw frames/transparent 2>>"$LOG"
TRANS_COUNT=$(ls frames/transparent/frame_*.png 2>/dev/null | wc -l)
echo "  → frames/transparent/ ($TRANS_COUNT transparent PNGs)" | tee -a "$LOG"

# STEP 4: convert transparent PNGs to WebP with alpha
echo "[4/4] Converting to WebP with alpha preservation..." | tee -a "$LOG"
rm -f public/hero/desktop/frame_*.webp
COUNT=0
for f in frames/transparent/frame_*.png; do
  out="public/hero/desktop/$(basename ${f%.png}).webp"
  ffmpeg -y -i "$f" -c:v libwebp -quality 85 -compression_level 6 "$out" 2>>"$LOG"
  COUNT=$((COUNT + 1))
done
WEBP_COUNT=$(ls public/hero/desktop/frame_*.webp 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh public/hero/desktop | cut -f1)
echo "  → public/hero/desktop/ ($WEBP_COUNT WebPs, total $TOTAL_SIZE)" | tee -a "$LOG"

echo "" | tee -a "$LOG"
echo "=== PIPELINE DONE at $(date) ===" | tee -a "$LOG"
echo "Raw frames:         $RAW_COUNT" | tee -a "$LOG"
echo "Transparent PNGs:   $TRANS_COUNT" | tee -a "$LOG"
echo "Final WebPs:        $WEBP_COUNT" | tee -a "$LOG"
echo "Total payload:      $TOTAL_SIZE" | tee -a "$LOG"
