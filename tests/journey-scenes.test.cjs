const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const sandbox={window:{}};vm.createContext(sandbox);
for(const file of ['story.js','world.js','scenes.js'])vm.runInContext(fs.readFileSync('assets/journey/'+file,'utf8'),sandbox);
const world=sandbox.window.JOURNEY_WORLD;
const triggerCoin=stop=>world.coins.find(c=>c.stop===stop&&(!stop.event.coinStage||c.beat.stage===stop.event.coinStage));
assert.ok(world);assert.equal(world.sections.length,sandbox.window.JOURNEY_CONFIG.sections.length);
const labels=[];let people=0;
const noop=()=>{};
const ctx=new Proxy({},{get:()=>noop,set:()=>true});
const draw={ctx,rect:noop,line:noop,text:(value)=>labels.push(value),person:()=>people++,plaque:noop,monitor:noop};
const reduced={matches:false};
const scenes=sandbox.window.JourneyScenes.create(world,draw,reduced);
for(const stop of world.sections){
  assert.ok(stop.event);assert.ok(stop.atmosphere);
  const trigger=stop.start+stop.width*stop.event.at;
  const firstLabel=labels.length,firstPerson=people;
  scenes.draw(stop,0); // Before / after rendering paths must all be valid.
  scenes.update(stop.start+1,.04);
  assert.equal(scenes.states.get(stop.id).active,false);
  if(stop.event.trigger==='coin'){
    scenes.update(trigger,.04);assert.equal(scenes.states.get(stop.id).active,false,'Coin-triggered scenes wait for their coin');
    scenes.collect(stop,triggerCoin(stop));
  }
  const activated=scenes.update(trigger,.04);
  if(stop.event.trigger!=='coin')assert.ok(activated.includes(stop));assert.ok(scenes.progress(stop)>0&&scenes.progress(stop)<1);
  assert.equal(scenes.update(trigger,.04).length,0,'Each event activates once');
  scenes.update(trigger,10);assert.equal(scenes.progress(stop),1);
  scenes.draw(stop,10);scenes.drawActors(stop);
  if(stop.event.type!=='finale'){assert.equal(people,firstPerson,'Main sections draw no additional people');if(stop.event.type==='simplify'){const cloudLabels=labels.slice(firstLabel);for(const name of ['YOUR DEVICE','MICROSOFT','AZURE CLOUD','APPS','DATA','SERVICES'])assert.ok(cloudLabels.includes(name));assert.ok(cloudLabels.includes('SIMPLER · RELIABLE · COST-AWARE'));}else assert.equal(labels.length,firstLabel,'Other main sections draw no floating captions');}
}
assert.equal(scenes.encountered.size,world.sections.length);
for(const name of ['Teacher','Engineer','Team Builder','Leader'])assert.ok(labels.includes(name));
assert.equal(labels.includes('Customer'),false);assert.equal(labels.includes('Software'),false);
assert.ok(labels.includes('Teacher'));
assert.equal(people,4,'Ending has four fixed career identities');
assert.notEqual(scenes.paletteAt(world.sections[0].x).sky,scenes.paletteAt(world.sections[1].x).sky);
for(let x=0;x<world.worldWidth;x+=25){
  const palette=scenes.paletteAt(x);
  const linear=[1,3,5].map(i=>{const c=parseInt(palette.sky.slice(i,i+2),16)/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});
  const lum=linear.reduce((n,c,i)=>n+c*[.2126,.7152,.0722][i],0);
  const contrast=palette.ink==='#000000'?(lum+.05)/.05:1.05/(lum+.05);
  assert.ok(contrast>=4.5,'HUD contrast during atmosphere transitions');
}
scenes.reset();assert.equal(scenes.encountered.size,0);assert.ok([...scenes.states.values()].every(s=>!s.active&&s.progress===0));
reduced.matches=true;
const first=world.sections[0];scenes.collect(first);scenes.update(first.start+first.width*first.event.at,.001);assert.equal(scenes.progress(first),1);
assert.equal(sandbox.window.JOURNEY_CONFIG.sections.filter(s=>s.optional).flatMap(s=>world.coins.filter(c=>c.stop.id===s.id)).every(c=>c.tier===1),true);
console.log('PASS: all configured scene transformations before/after activation, quiet main scenes and preserved callback ending, one-time triggers, reduced motion, resets, main/bonus semantics and readable atmosphere transitions.');

// Kyckr stays tangled until collection, then passes through a real alignment transition.
const cloud=world.sections.find(s=>s.id==='kyckr');
assert.equal(cloud.event.trigger,'coin');
const cloudRects=[];
const cloudScenes=sandbox.window.JourneyScenes.create(world,{...draw,rect:(...args)=>cloudRects.push(args)},{matches:false});
const snapshot=()=>{cloudRects.length=0;cloudScenes.draw(cloud,0);return cloudRects.map(args=>Array.from(args));};
const before=snapshot();
cloudScenes.update(cloud.x,10);assert.equal(cloudScenes.progress(cloud),0);
assert.deepEqual(snapshot(),before,'Walking through the area leaves its disorder intact');
cloudScenes.collect(cloud,triggerCoin(cloud));cloudScenes.update(cloud.x,cloud.event.duration/2);
assert.notDeepEqual(snapshot(),before,'Collection animates the alignment');
cloudScenes.update(cloud.x,10);const after=snapshot();
assert.notDeepEqual(after,before);
cloudScenes.update(cloud.x,10);assert.deepEqual(snapshot(),after,'The controlled state remains settled');
cloudScenes.reset();assert.deepEqual(snapshot(),before,'Restart restores the tangled scene');

// New quiet scenes must visibly change, rather than merely completing a timer.
for(const type of ['classroom','firstbuild','sharing','hackathon','converge']){
  const stop=world.sections.find(s=>s.event.type===type),commands=[];
  const record=(name)=>(...args)=>commands.push([name,...args]);
  const animation=sandbox.window.JourneyScenes.create(world,{...draw,rect:record('rect'),line:record('line')},{matches:false});
  const capture=()=>{commands.length=0;animation.draw(stop,0);return JSON.stringify(commands);};
  const initial=capture();
  animation.collect(stop,triggerCoin(stop));animation.update(stop.start+stop.width*stop.event.at,stop.event.duration/2);
  const middle=capture();assert.notEqual(middle,initial,type+' has a visible intermediate state');
  animation.update(stop.x,10);const complete=capture();
  assert.notEqual(complete,initial,type+' leaves a visible story result');
  animation.reset();assert.equal(capture(),initial,type+' resets its artwork');
}

// The challenge introduces the problem; the choice causes the visible transformation.
for(const id of ['consulting','platform','kyckr','leadership']){
  const stop=world.sections.find(s=>s.id===id),coins=world.coins.filter(c=>c.stop===stop);
  assert.deepEqual(Array.from(coins,c=>c.beat.stage),['challenge','choice','outcome']);
  const arc=sandbox.window.JourneyScenes.create(world,draw,{matches:false});
  arc.update(stop.end-1,10);assert.equal(arc.progress(stop),0,'Walking past never resolves '+id);
  assert.equal(arc.collect(stop,coins[0]),false);arc.update(stop.x,10);
  assert.equal(arc.progress(stop),0,'Challenge coin leaves '+id+' unresolved');
  assert.equal(arc.collect(stop,coins[1]),true);arc.update(stop.x,stop.event.duration/2);
  assert.ok(arc.progress(stop)>0&&arc.progress(stop)<1);
  const midway=arc.progress(stop);assert.equal(arc.collect(stop,coins[2]),false);
  assert.equal(arc.progress(stop),midway,'Outcome coin does not replay '+id);
  arc.update(stop.x,10);assert.equal(arc.progress(stop),1);
  arc.reset();assert.equal(arc.progress(stop),0);
  const instant=sandbox.window.JourneyScenes.create(world,draw,{matches:true});
  instant.collect(stop,coins[1]);instant.update(stop.x,.01);assert.equal(instant.progress(stop),1);
}
