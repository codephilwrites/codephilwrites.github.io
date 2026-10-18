const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const sandbox={window:{},Uint8ClampedArray};vm.createContext(sandbox);
for(const file of ['story.js','world.js','portraits.js'])vm.runInContext(fs.readFileSync('assets/journey/'+file,'utf8'),sandbox);
const {window}=sandbox,{build}=window.JourneyWorld;
assert.equal(window.JOURNEY_CONFIG_ERROR,undefined);
const config=JSON.parse(JSON.stringify(window.JOURNEY_CONFIG)),world=build(config);
assert.equal(world.sections.length,config.sections.length);
for(let i=0;i<world.sections.length;i++){
  const s=world.sections[i],source=config.sections[i];
  assert.equal(s.start,i?world.sections[i-1].end:0);
  assert.equal(s.body,source.details||source.coins.map(c=>c.text).join(' '));
  assert.ok(s.buildingX>s.start&&s.buildingX<s.start+340);
  const coins=world.coins.filter(c=>c.stop===s);
  for(let j=0;j<coins.length;j++){
    assert.ok(coins[j].x>=s.start+340&&coins[j].x<=s.end-100);
    if(j)assert.ok(coins[j].x-coins[j-1].x>=config.defaults.minCoinSpacing);
    assert.equal((coins[j].support?.y??world.ground)-coins[j].y,coins[j].height);
    assert.ok(coins[j].beat.body.length<=180);
  }
  assert.equal(coins.map(c=>c.beat.body).join(' '),source.coins.map(c=>c.text).join(' '));
}
// Reordering, extending and adding sections require no coordinate edits.
const reordered={...config,sections:[...config.sections].reverse()};
assert.equal(build(reordered).sections[0].id,config.sections.at(-1).id);
const custom={defaults:config.defaults,sections:[{id:'new',name:'New chapter',building:{name:'A new building',image:'my photo.png'},coins:Array.from({length:12},(_,i)=>({title:'Part '+i,text:'A complete message.',height:i%2?102:28}))}]};
const grown=build(custom);assert.ok(grown.worldWidth>config.defaults.sectionWidth);
assert.equal(grown.coins.length,12);assert.equal(grown.coins[1].height,102);
assert.throws(()=>build({...custom,sections:[custom.sections[0],custom.sections[0]]}),/unique id/);
assert.throws(()=>build({...custom,sections:[{...custom.sections[0],coins:[{title:'Bad',text:'Message',height:500}]}]}),/coin height/);
assert.throws(()=>build({...custom,sections:[{...custom.sections[0],building:{name:''}}]}),/building.name/);
// Image conversion reduces colours, preserves transparency and resolves baseurl paths.
const portraits=window.JourneyPortraits;
assert.equal(portraits.sourceURL('my photo.png','/preview/assets/journey/'),'/preview/assets/journey/images/my%20photo.png');
assert.throws(()=>portraits.sourceURL('../private.png','/assets/journey/'));
assert.throws(()=>portraits.sourceURL('https://example.com/image.png','/assets/journey/'));
const pixels=new Uint8ClampedArray([93,17,244,130,255,128,33,0]);portraits.posterize(pixels);
assert.deepEqual(Array.from(pixels),[102,0,255,255,255,153,51,0]);
let drawArgs,converted;
sandbox.document={createElement:()=>({getContext:()=>({drawImage(...args){drawArgs=args;},getImageData(){return {data:new Uint8ClampedArray([93,17,244,255])};},putImageData(bitmap){converted=bitmap.data;}})})};
sandbox.Image=class {constructor(){this.naturalWidth=800;this.naturalHeight=400;}set src(value){queueMicrotask(()=>value.includes('missing')?this.onerror():this.onload());}};
(async()=>{
  const task=portraits.load('photo.png',40,'/preview/assets/journey/');
  assert.equal(task,portraits.load('photo.png',40,'/preview/assets/journey/'));
  const loaded=await task;assert.ok(loaded.canvas);assert.equal(loaded.canvas.width,40);assert.equal(loaded.canvas.height,30);
  assert.deepEqual(Array.from(drawArgs.slice(1)),[0,5,40,20]);assert.deepEqual(Array.from(converted),[102,0,255,255]);
  const failed=await portraits.load('missing.png',40,'/assets/journey/');assert.equal(failed.canvas,null);assert.ok(failed.error);
  console.log('PASS: section ordering, automatic widths/spacing, coin heights, preserved story, configuration validation, image quantisation/fit/cache/fallback and baseurl paths.');
})().catch(error=>{console.error(error);process.exitCode=1;});

// Outfit defaults and per-section overrides stay configuration-only.
for(const outfit of ['casual','suit','hoodie','hiking','chiefs','graduation']){
  const sample=JSON.parse(JSON.stringify(config));sample.defaults.outfit=outfit;
  delete sample.sections[0].outfit;
  assert.equal(build(sample).sections[0].outfit,outfit);
  sample.sections[0].outfit='suit';assert.equal(build(sample).sections[0].outfit,'suit');
}
const badOutfit=JSON.parse(JSON.stringify(config));badOutfit.defaults.outfit='unknown';
assert.throws(()=>build(badOutfit),/outfit/);
badOutfit.defaults.outfit='casual';badOutfit.sections[0].outfit='unknown';assert.throws(()=>build(badOutfit),/outfit/);

assert.equal(world.sections.find(s=>s.id==='education').outfit,'graduation','University uses the gown and scroll outfit');

const invalidStage=JSON.parse(JSON.stringify(config));invalidStage.sections[0].coins[0].stage='unknown';
assert.throws(()=>build(invalidStage),/stage/);
const invalidTrigger=JSON.parse(JSON.stringify(config));invalidTrigger.sections[0].event.coinStage='choice';
assert.throws(()=>build(invalidTrigger),/coinStage/);
