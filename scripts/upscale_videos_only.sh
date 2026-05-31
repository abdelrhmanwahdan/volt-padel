#!/usr/bin/env bash
# Videos-only variant of the asset-enhance pipeline.
# Use when the stills are already upscaled correctly and you only want to
# re-encode videos at a different CRF.

set -euo pipefail

BIN=$HOME/tools/realesrgan/realesrgan-ncnn-vulkan
MODELS=$HOME/tools/realesrgan/models
MODEL=realesr-animevideov3
TILE=256
SCALE=2
THREADS=2:4:2
CRF=${VIDEO_CRF:-18}
PRESET=slow
PUB=$(pwd)/public
WORK=$(pwd)/.upscale_work_videos
LOG=$(pwd)/.upscale_videos.log

mkdir -p "$WORK"
exec > >(tee -a "$LOG") 2>&1
echo "==== VIDEOS-ONLY START $(date) ===="
echo "CRF=$CRF  preset=$PRESET  model=$MODEL  tile=$TILE"

for src in "$PUB"/videos/*.mp4; do
  name=$(basename "${src%.*}")
  frames_in=$WORK/$name/in
  frames_out=$WORK/$name/out
  mkdir -p "$frames_in" "$frames_out"

  echo ""
  echo "==== $name ===="
  ffmpeg -y -v error -i "$src" -q:v 1 "$frames_in/f_%04d.png"
  echo "  $(ls "$frames_in" | wc -l) frames extracted"

  "$BIN" -i "$frames_in" -o "$frames_out" \
    -n "$MODEL" -s "$SCALE" -t "$TILE" -f png -j "$THREADS" -m "$MODELS" 2>&1 \
    | grep -E "^[0-9]" | tail -3

  FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$src")
  ffmpeg -y -v error \
    -framerate "$FPS" -i "$frames_out/f_%04d.png" \
    -c:v libx264 -crf "$CRF" -preset "$PRESET" \
    -pix_fmt yuv420p \
    -g 1 -keyint_min 1 -sc_threshold 0 \
    -movflags +faststart -an \
    "$src.new.mp4"
  mv "$src.new.mp4" "$src"

  ffmpeg -y -v error -ss 0 -i "$src" -frames:v 1 -q:v 85 -c:v libwebp "$PUB/posters/$name.webp" 2>/dev/null || true

  echo "  ✓ $name.mp4 → $(du -h "$src" | cut -f1), poster $(du -h "$PUB/posters/$name.webp" | cut -f1)"
  rm -rf "$WORK/$name"
done

echo ""
echo "==== DONE ===="
du -sh "$PUB"
echo "==== END $(date) ===="
