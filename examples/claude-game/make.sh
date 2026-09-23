#!/bin/bash
# make.sh — render the game short, then chiptune + synthesised SFX -> out/claude-game-final.mp4
set -e
cd "$(dirname "$0")"
SK=../../plugins/claude-animation/skills/claude-animation
node film.mjs verify
node film.mjs render
node film.mjs cues                     # writes cues.json and sections.txt (music sections in real time, after hit-stop)
node $SK/scripts/chiptune.mjs out/music.wav --dur 30 --bpm 150 --sections "$(cat sections.txt)"
node $SK/scripts/sound.mjs cues.json out/claude-game.mp4 out/claude-game-final.mp4 --bed out/music.wav --bed-vol .42 --lufs -14
