#!/bin/bash
# make.sh — the 30 s seamless loop: render, ambient bed (4 bars of 7.5 s so the audio loops too), burner + birds
set -e
cd "$(dirname "$0")"
SK=../../plugins/claude-animation/skills/claude-animation
node film.mjs verify
node film.mjs render
node film.mjs cues
node $SK/scripts/ambient.mjs out/ambient.wav --dur 30 --bar 7.5 --wind .25
node $SK/scripts/sound.mjs cues.json out/claude-balloon.mp4 out/claude-balloon-final.mp4 --bed out/ambient.wav --bed-vol .7 --lufs -16
