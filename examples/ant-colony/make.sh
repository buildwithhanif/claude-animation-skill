#!/bin/bash
# make.sh — render the colony film, measure the render, then music + synthesised SFX -> out/ant-colony-final.mp4
set -e
cd "$(dirname "$0")"
SK=../../plugins/claude-animation/skills/claude-animation
node film.mjs verify
node film.mjs render
N=$(node -e 'console.log(Math.round(require("./out/ant-colony.render.json").seconds))')
RENDER_SECONDS=$N node film.mjs render          # the end card states the real render time
node film.mjs cues
node $SK/scripts/music.mjs out/bed.wav --dur 29.8 --bpm 104 --quiet 13.1-13.8 --end 28.4
node $SK/scripts/sound.mjs cues.json out/ant-colony.mp4 out/ant-colony-final.mp4 --bed out/bed.wav --bed-vol .5 --bed-at 2.2 --lufs -14
