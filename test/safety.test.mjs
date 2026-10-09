import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const root = process.env.ANIMATION_ROOT || fileURLToPath(new URL('../plugins/claude-animation/skills/claude-animation/', import.meta.url));
const sound = path.join(root, 'scripts/sound.mjs');
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'animation-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'cues.json'), '[{"sfx":"pop","t":0.05}]');
  const r = spawnSync('ffmpeg', ['-v','error','-f','lavfi','-i','color=c=blue:s=32x32:r=8:d=1','-c:v','libx264','-pix_fmt','yuv420p',path.join(dir,'picture.mp4')]);
  assert.equal(r.status, 0, r.stderr?.toString());
  return dir;
}
function audio(dir, out, args = [], env = process.env) {
  return spawnSync(process.execPath, [sound, 'cues.json', 'picture.mp4', out, ...args], { cwd: dir, env, encoding: 'utf8', timeout: 15000 });
}
function filmScript(dir, config = {}) {
  const file = path.join(dir, `film-${Math.random()}.mjs`);
  fs.writeFileSync(file, `import {run} from ${JSON.stringify(pathToFileURL(path.join(root,'lib/film.mjs')).href)}; await run({...${JSON.stringify({name:'test',W:32,H:32,fps:8,dur:.25,out:path.join(dir,'out'),...config})}, frame(ctx){ctx.fillStyle='red';ctx.fillRect(2,2,20,20)}});`);
  return file;
}
function render(file) { return spawnSync(process.execPath, [file,'render'], { encoding:'utf8', timeout:15000 }); }

test('output filenames are data, including command substitutions and quotes', (t) => {
  const dir = fixture(t);
  for (const name of ['a$(touch INJECTED).mp4', 'a`touch INJECTED`.mp4', 'a"quoted file.mp4']) {
    const r = audio(dir, name);
    assert.equal(r.status, 0, r.stderr);
    assert.ok(fs.existsSync(path.join(dir,name)));
    assert.ok(!fs.existsSync(path.join(dir,'INJECTED')));
  }
  assert.ok(!fs.readdirSync(dir).some(n => n.startsWith('.sound-')));
});
test('reject whole invalid loudness values before effects or file writes', (t) => {
  const dir = fixture(t);
  for (const value of ['-16;touch INJECTED;#','-16,anull','NaN','Infinity','-71','-4','']) {
    const r = audio(dir, 'master.mp4', ['--lufs',value]);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /--lufs/);
    assert.ok(!fs.existsSync(path.join(dir,'INJECTED')));
    assert.ok(!fs.existsSync(path.join(dir,'master.mp4')));
  }
});
test('valid decimal loudness, bed audio, and silent fallback remain supported', (t) => {
  const dir = fixture(t);
  const r = spawnSync('ffmpeg',['-v','error','-f','lavfi','-i','sine=frequency=440:duration=1','-c:a','pcm_s16le',path.join(dir,'bed.wav')]);
  assert.equal(r.status,0);
  const mix = audio(dir,'master.mp4',['--lufs','-14.5','--bed','bed.wav','--bed-vol','.2','--bed-at','.1']);
  assert.equal(mix.status,0,mix.stderr); assert.match(mix.stdout,/mix was/);
  fs.writeFileSync(path.join(dir,'cues.json'),'[]');
  const silent = audio(dir,'silent.mp4'); assert.equal(silent.status,0,silent.stderr);
  const probe = spawnSync('ffprobe',['-v','error','-show_entries','stream=codec_type','-of','csv=p=0',path.join(dir,'master.mp4')],{encoding:'utf8'});
  assert.match(probe.stdout,/video/); assert.match(probe.stdout,/audio/);
});
test('failed mux preserves an existing master and cleans owned staging', (t) => {
  const dir = fixture(t), bin = path.join(dir,'bin'); fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin,'ffmpeg'), '#!/usr/bin/env node\nconst fs=require("fs");const a=process.argv.slice(2);if(a.includes("-hide_banner")){process.stderr.write("{}");}else{fs.writeFileSync(a.at(-1),"partial");process.exit(1);}', {mode:0o755});
  fs.writeFileSync(path.join(dir,'master.mp4'),'known good');
  const r = audio(dir,'master.mp4',[],{...process.env,PATH:bin+path.delimiter+process.env.PATH});
  assert.notEqual(r.status,0); assert.equal(fs.readFileSync(path.join(dir,'master.mp4'),'utf8'),'known good');
  assert.ok(!fs.readdirSync(dir).some(n=>n.startsWith('.sound-')));
});
test('renders publish only their own outputs, never stale staging files', (t) => {
  const dir=fixture(t), out=path.join(dir,'out');fs.mkdirSync(path.join(out,'.staging'),{recursive:true});
  fs.writeFileSync(path.join(out,'.staging','stale.mp4'),'stale');
  const r=render(filmScript(dir));assert.equal(r.status,0,r.stderr);
  assert.ok(!fs.existsSync(path.join(out,'stale.mp4')));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out,'test.render.json'))).files,['test.mp4']);
});
test('failed encoding and filename traversal preserve existing outputs', (t) => {
  const dir=fixture(t),out=path.join(dir,'out');fs.mkdirSync(out);fs.writeFileSync(path.join(out,'test.mp4'),'known good');
  const r=render(filmScript(dir,{crf:'invalid'}));assert.notEqual(r.status,0);
  assert.equal(fs.readFileSync(path.join(out,'test.mp4'),'utf8'),'known good');
  for(const name of ['../victim','nested/name','nested\\name']) assert.notEqual(render(filmScript(dir,{name})).status,0);
  assert.ok(!fs.readdirSync(out).some(n=>n.startsWith('.staging-')));
});
test('ProRes and matte layouts preserve receipts and filenames', (t) => {
  const dir=fixture(t);
  for(const alpha of ['prores','matte']){
    const r=render(filmScript(dir,{name:alpha,alpha}));assert.equal(r.status,0,r.stderr);
    const rec=JSON.parse(fs.readFileSync(path.join(dir,'out',alpha+'.render.json')));
    assert.deepEqual(rec.files.sort(),alpha==='prores'?['prores.mov']:['matte-matte.mp4','matte-rgb.mp4']);
    assert.equal(typeof rec.seconds,'number');
  }
});
test('different-name concurrent renders never promote another run', async(t)=>{
  const dir=fixture(t);
  const jobs=['one','two'].map(name=>new Promise(resolve=>{const child=spawn(process.execPath,[filmScript(dir,{name}),'render'],{stdio:'ignore'});child.on('close',resolve);}));
  assert.deepEqual(await Promise.all(jobs),[0,0]);
  for(const name of ['one','two'])assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir,'out',name+'.render.json'))).files,[name+'.mp4']);
});

for (const secondName of ['shared', 'SHARED']) test(`matte publishers serialize output sets (${secondName})`, async(t)=>{
  const dir=fixture(t), a=filmScript(dir,{name:'shared',alpha:'matte'}), b=filmScript(dir,{name:secondName,alpha:'matte',W:64,H:64});
  const paused=path.join(dir,'paused'), release=path.join(dir,'release');
  fs.writeFileSync(a, `import fs from 'node:fs';const rename=fs.renameSync;let stopped=false;fs.renameSync=(...args)=>{rename(...args);if(!stopped && /\\.mp4$/.test(args[1])){stopped=true;fs.writeFileSync(${JSON.stringify(paused)},'yes');while(!fs.existsSync(${JSON.stringify(release)}))Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,20);}};`+fs.readFileSync(a,'utf8'));
  const start=(file)=>{const child=spawn(process.execPath,[file,'render'],{stdio:'ignore'});return{child,done:new Promise(resolve=>child.on('close',resolve))};};
  const A=start(a);t.after(()=>{if(fs.existsSync(dir))fs.writeFileSync(release,'yes');A.child.kill();});
  const deadline=Date.now()+10000;while(!fs.existsSync(paused)){assert.ok(Date.now()<deadline,'first publisher did not pause');await new Promise(r=>setTimeout(r,20));}
  const B=start(b);let finished=false;B.done.then(()=>finished=true);
  await new Promise(r=>setTimeout(r,500));
  try{assert.equal(finished,false,'second publisher completed inside first output-set promotion');}finally{fs.writeFileSync(release,'yes');}
  assert.deepEqual(await Promise.all([A.done,B.done]),[0,0]);
  for(const suffix of ['rgb','matte']){
    const probe=spawnSync('ffprobe',['-v','error','-show_entries','stream=width','-of','csv=p=0',path.join(dir,'out',`${secondName}-${suffix}.mp4`)],{encoding:'utf8'});
    assert.equal(probe.stdout.trim(),'64');
  }
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'out',secondName+'.render.json'))).W,64);
});
