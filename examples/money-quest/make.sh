#!/bin/bash
set -e
cd "$(dirname "$0")"
SK=../../plugins/claude-animation/skills/claude-animation
node film.mjs verify && node film.mjs render && node film.mjs cues
node $SK/scripts/music.mjs out/bed.wav --dur 30 --bpm 112 --quiet 0-2.4 --end 28.8
node $SK/scripts/sound.mjs cues.json out/money-quest.mp4 out/money-quest-final.mp4 --bed out/bed.wav --bed-vol .5 --lufs -14
