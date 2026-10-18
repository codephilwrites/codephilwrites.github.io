// Dependency-free logic checks. These do not replace visual checks in a browser.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class Element {
  constructor(id) { this.id=id;this.hidden=false;this.open=false;this.dataset={};this.style={setProperty(name,value){this[name]=value;}};this.attributes={};this.events={};this.children=[];this.dimensionWrites=0;this.classList={toggle(){}}; }
  addEventListener(name, callback) { (this.events[name] ||= []).push(callback); }
  dispatch(name, data={}) { for (const callback of this.events[name]||[]) callback({target:this,preventDefault(){},...data}); }
  setAttribute(k,v) { this.attributes[k]=String(v); }
  append(...children) { for(const child of children)child.parent=this;this.children.push(...children); }
  remove() { if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this); }
  set width(value) {this._width=value;this.dimensionWrites++;}
  get width() {return this._width;}
  set height(value) {this._height=value;this.dimensionWrites++;}
  get height() {return this._height;}
  replaceChildren(...children) { this.children=children; }
  focus() { document.activeElement=this; }
  showModal() { this.open=true; }
  close() { this.open=false;this.dispatch('close'); }
  getBoundingClientRect() {
    if(this.className?.includes('bubble-measure')){
      const title=this.children[1].textContent,body=this.children[2].textContent;
      return {width:process.env.JOURNEY_MOBILE?358:620,height:64+Math.ceil(title.length/35)*24+Math.ceil(body.length/45)*23};
    }
    return process.env.JOURNEY_MOBILE ? {width:390,height:744} : {width:1280,height:720};
  }
  setPointerCapture() {}
}
const elements=new Map();
const get=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);};
const controls=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Jump'].map(value=>{const el=new Element(value);el.dataset.control=value;return el;});
const document=new Element('document');
document.getElementById=get;document.querySelector=value=>get(value);document.querySelectorAll=()=>controls;document.createElement=()=>new Element();document.body=new Element('body');document.documentElement=new Element('html');
let canvasTrace=null;
const context=new Proxy({}, {get:(_target,key)=>key==='createLinearGradient'?()=>({addColorStop(){}}):(...args)=>{if(canvasTrace)canvasTrace.push({key,args});},set:()=>true});
get('world').getContext=()=>context;get('story-bubble').hidden=true;get('ending-link').hidden=true;
let raf;
const window=new Element('window');
const sandbox={window,document,console,matchMedia:()=>({matches:!!process.env.JOURNEY_REDUCED_MOTION}),ResizeObserver:class{observe(){}},requestAnimationFrame:callback=>{raf=callback;}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('assets/journey/story.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('assets/journey/world.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('assets/journey/portraits.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('assets/journey/scenes.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('assets/journey/cats.js','utf8'),sandbox);
// Observe physics in tests without exposing debug controls in the shipped game.
const engine=fs.readFileSync('assets/journey/game.js','utf8').replace(
  '  resize();requestAnimationFrame(loop);',
  '  window.testState={player,platforms,coins,effects,discoveries,visited,scenes,cats,engineers,get emma(){return emma;},get endingReached(){return endingReached;}};resize();requestAnimationFrame(loop);'
);
vm.runInContext(engine,sandbox);
let timestamp=0;
const frame=()=>{timestamp+=40;raf(timestamp);};
const key=(name,key)=>document.dispatch(name,{key,target:get('world'),repeat:false});
const state=window.testState;
const frames=count=>{for(let i=0;i<count;i++)frame();};
function walkTo(x){
  const right=state.player.x<x;
  key('keydown',right?'ArrowRight':'ArrowLeft');
  let budget=1600;
  while(Math.abs(state.player.x-x)>6&&!get('story-dialog').open&&budget--){
    if((right&&state.player.x>x)||(!right&&state.player.x<x))break;
    frame();
  }
  key('keyup',right?'ArrowRight':'ArrowLeft');
  assert.ok(budget>0,'Walking must never get trapped');
}
assert.equal(get('timeline-content').children.length,window.JOURNEY_CONFIG.sections.length);
get('start').onclick();frame();
assert.equal(get('title-screen').hidden,true);
assert.equal(get('story-bubble').hidden,true,'Story is behind a coin');
walkTo(state.coins[0].x-60);canvasTrace=[];frame();
const spriteHead=canvasTrace.findIndex(c=>c.key==='ellipse'&&c.args[2]===4.9&&c.args[3]===4.9);
const goldMarker=canvasTrace.findIndex(c=>c.key==='ellipse'&&c.args[2]===11&&c.args[3]===14);
assert.ok(spriteHead>=0&&goldMarker>spriteHead,'Collectible markers are painted above characters');
canvasTrace=null;
const initialCanvasWrites=get('world').dimensionWrites;
const reservedSpace=get('game').style['--story-space'];
walkTo(state.coins[0].x);
assert.equal(get('story-bubble').hidden,false,'Coin reveals its story automatically');
assert.equal(get('story-bubble').attributes['data-position'],'1','First pickup selects the first gentle bubble offset');
const firstBubblePosition=get('story-bubble').attributes['data-position'];
frames(10);assert.equal(get('story-bubble').attributes['data-position'],firstBubblePosition,'The bubble stays still while reading');
assert.equal(get('world').dimensionWrites,initialCanvasWrites,'Coin pickup never resets canvas or camera');
assert.equal(get('world').height,360);
key('keydown','Enter');assert.equal(get('story-dialog').open,false);

// Presenter controls recover position without resetting progress or resizing play.
const collectedBeforeJump=state.discoveries.size;
key('keydown','ArrowRight');key('keydown',']');
assert.equal(state.player.x,window.JOURNEY_WORLD.sections[1].start+70);
frames(3);assert.equal(state.player.x,window.JOURNEY_WORLD.sections[1].start+70,'Navigation clears held movement');
key('keydown','Home');assert.equal(state.player.x,70);
get('section-jump').value=window.JOURNEY_WORLD.sections[3].id;get('section-jump').onchange();
assert.equal(state.player.x,window.JOURNEY_WORLD.sections[3].start+70);
get('previous-section').onclick();assert.equal(state.player.x,window.JOURNEY_WORLD.sections[2].start+70);
key('keydown','End');assert.equal(state.player.x,window.JOURNEY_WORLD.sections.at(-1).start+70);
key('keydown','Home');assert.equal(state.discoveries.size,collectedBeforeJump);
assert.equal(get('world').dimensionWrites,initialCanvasWrites);

// Every configured platform is reachable by actual movement / climbing input.
for(const platform of state.platforms){
  if(platform.ladder){
    walkTo(platform.x+35);key('keydown','ArrowUp');
    let budget=120;while(state.player.y>platform.y&&budget--)frame();
    key('keyup','ArrowUp');assert.ok(budget>0,'Ladder must be reachable');
  }else{
    walkTo(platform.x-20);key('keydown',' ');walkTo(platform.x+platform.w/2);frames(35);
  }
  assert.equal(state.player.y,platform.y,platform.stop.id+' landing');
  assert.equal(get('story-dialog').open,false);
}
// A jump coin on open ground cannot be reached simply by walking.
const jumpCoin=state.coins.find(c=>c.airborne&&!c.support&&!state.discoveries.has(c.id));
assert.ok(jumpCoin);walkTo(jumpCoin.x);frames(35);
assert.ok(!state.discoveries.has(jumpCoin.id));key('keydown',' ');frames(35);
assert.ok(state.discoveries.has(jumpCoin.id));

// Collect all configured coins, using their automatically selected support.
for(const coin of state.coins){
  if(coin.support){
    const p=coin.support;
    if(p.ladder){
      walkTo(p.x+35);key('keydown','ArrowUp');
      let budget=120;while(state.player.y>p.y&&budget--)frame();key('keyup','ArrowUp');assert.ok(budget>0);
    }else{
      walkTo(p.x-20);key('keydown',' ');walkTo(coin.x);frames(35);
    }
  }
  walkTo(coin.x);frames(35);
  if(!state.discoveries.has(coin.id)){key('keydown',' ');frames(35);}
  assert.ok(state.discoveries.has(coin.id),coin.id+' is reachable');
  assert.equal(get('story-bubble').attributes['data-position'],String(state.discoveries.size%3),'Each new pickup advances the bubble position');
  assert.equal(get('world').dimensionWrites,initialCanvasWrites);
  assert.equal(get('game').style['--story-space'],reservedSpace);
  assert.ok(get('bubble-body').textContent.length<=180);
}
assert.equal(state.endingReached,true,'The final bubble arrives at the fifth position');
assert.equal(state.player.x,window.JOURNEY_WORLD.finishX);
assert.equal(get('ending-link').hidden,false);assert.equal(get('story-dialog').open,false,'Ending keeps the scene visible');
assert.equal(get('bubble-title').textContent,state.coins.at(-1).beat.title);
key('keydown','ArrowRight');frames(20);key('keyup','ArrowRight');
assert.equal(state.player.x,window.JOURNEY_WORLD.finishX,'Held movement cannot overshoot the lineup');
key('keydown','Home');assert.equal(get('ending-link').hidden,true);assert.equal(state.endingReached,false);
assert.equal(state.engineers.size,1,'Leadership coin summons one crew');
frames(200);
assert.ok([...state.engineers.values()][0].every(engineer=>engineer.ready),'Engineers run all the way to their lights');
assert.equal([...state.engineers.values()][0].delivery,1,'Enabled engineers complete a shared result');
assert.ok(state.emma,'Emma appears only after her introduction coin');
walkTo(state.coins.find(c=>c.beat.title==='Meet Emma.').x);frames(200);
assert.ok(Math.abs(state.emma.x-(state.player.x+105))<2,'Emma approaches Phil and stops clear of the cats');
// The cats' coin summons them; landing and waiting nearby triggers the crouch.
const catCoin=state.coins.find(c=>c.action==='meetCats');assert.ok(catCoin);
walkTo(catCoin.x);frames(35);assert.equal(state.cats.called,true);
frames(100);assert.equal(state.cats.petting,true,'Phil crouches and strokes the cats automatically');
assert.ok(state.cats.animals.every(cat=>Math.abs(cat.x-state.player.x)<=68));
key('keydown',' ');frames(2);assert.equal(state.cats.petting,false,'Jump releases the pose');frames(35);
key('keydown','ArrowLeft');frames(2);key('keyup','ArrowLeft');assert.equal(state.cats.petting,false,'Movement is never locked');
frames(100);assert.equal(state.cats.petting,true);
// On leaving the park, Emma plays with the cats; returning restores their greeting.
walkTo(catCoin.stop.end+45);frames(160);
assert.equal(state.emma.playing,true);assert.equal(state.emma.moving,false);
assert.equal(state.cats.playing,true);assert.equal(state.cats.petting,false);
assert.ok(state.cats.animals.every(cat=>cat.x>state.emma.x&&cat.x-state.emma.x<105));
assert.ok(state.cats.animals.every(cat=>cat.x>=catCoin.stop.start&&cat.x<catCoin.stop.end));
walkTo(catCoin.x);frames(160);
assert.equal(state.emma.playing,false);assert.equal(state.cats.playing,false);
assert.equal(state.cats.petting,true);


assert.equal(state.effects.size,3);
assert.ok([...state.scenes.states.values()].every(state=>state.active),'Every section event was reached');
assert.equal(state.discoveries.size,state.coins.length);

// Ladder descent and pausing remain safe.
const ladder=state.platforms.find(p=>p.ladder&&p.y<350);
walkTo(ladder.x+35);key('keydown','ArrowUp');frames(40);key('keyup','ArrowUp');
key('keydown','ArrowDown');frames(8);key('keyup','ArrowDown');
const hangingY=state.player.y;frames(10);assert.equal(state.player.y,hangingY);
key('keydown','ArrowDown');frames(30);key('keyup','ArrowDown');assert.equal(state.player.y,450);
walkTo(window.JOURNEY_WORLD.finishX);key('keydown','ArrowRight');frames(2);key('keyup','ArrowRight');assert.equal(state.endingReached,true);
assert.equal(get('ending-link').hidden,false);get('restart').onclick();
assert.equal(get('title-screen').hidden,false);assert.equal(state.discoveries.size,0);
assert.equal(state.effects.size,0);assert.equal(get('story-bubble').hidden,true);
assert.ok([...state.scenes.states.values()].every(state=>!state.active&&state.progress===0));
assert.equal(state.emma,null);assert.equal(state.engineers.size,0);
assert.equal(state.cats.called,false);assert.equal(state.cats.petting,false);assert.equal(state.cats.playing,false);
get('timeline-toggle').onclick();assert.equal(get('timeline').hidden,false);
get('back-game').onclick();assert.equal(get('game').hidden,false);

// Touch controls share the same physics and cancel on release / focus loss.
get('start').onclick();frame();
controls[1].dispatch('pointerdown',{pointerId:1});frames(5);controls[1].dispatch('pointercancel');
const stoppedX=state.player.x;frames(5);assert.equal(state.player.x,stoppedX);
const touchLadder=state.platforms.find(p=>p.ladder);
walkTo(touchLadder.x+35);controls[2].dispatch('pointerdown',{pointerId:2});frames(40);controls[2].dispatch('pointerup');
assert.equal(state.player.y,touchLadder.y);
controls[4].dispatch('pointerdown',{pointerId:3});frames(5);controls[4].dispatch('pointerup');assert.ok(state.player.y<touchLadder.y);
controls[1].dispatch('pointerdown',{pointerId:4});window.dispatch('blur');
const blurX=state.player.x;frames(5);assert.equal(state.player.x,blurX);
get('restart').onclick();get('start').onclick();frame();
key('keydown','ArrowRight');let groundBudget=2500;
while(!state.endingReached&&groundBudget--){frame();assert.equal(state.player.y,450);}
key('keyup','ArrowRight');assert.ok(groundBudget>0,'Ending remains reachable without collecting every coin');
assert.equal(get('ending-link').hidden,false);assert.equal(get('story-bubble').hidden,false);
get('restart').onclick();
(async()=>{await get('fullscreen').onclick();assert.equal(get('fullscreen').attributes['aria-pressed'],'true');await get('fullscreen').onclick();assert.equal(get('fullscreen').attributes['aria-pressed'],'false');console.log('PASS: all configured coins/platforms, automatic messages, stable camera, real jump pickups, ending, restart, timeline, cat greeting/petting/reset, event reset, presenter jumps, touch controls and fullscreen fallback.');})();
