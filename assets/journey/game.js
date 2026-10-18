/* Original procedural pixel art. No external assets or runtime dependencies. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('world'), ctx = canvas.getContext('2d');
  const game = $('game'), dialog = $('story-dialog');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if(window.JOURNEY_CONFIG_ERROR){
    const message=document.createElement('p');message.className='config-error';
    message.textContent='Journey configuration: '+window.JOURNEY_CONFIG_ERROR;
    $('title-screen').append(message);$('start').disabled=true;return;
  }
  const world=window.JOURNEY_WORLD,story=world.sections;
  const WORLD=world.worldWidth,GROUND=world.ground;
  const platforms=world.platforms,coins=world.coins;
  const keys = new Set(), effects = new Set(), visited = new Set();
  const player = {x:world.spawnX,y:GROUND,vy:0,facing:1,moving:false,grounded:true,climbing:false};
  const portraits=new Map();
  const assetBase=canvas.dataset.assetsBase||'/assets/journey/';
  for(const stop of story){
    if(stop.building.image)window.JourneyPortraits.load(stop.building.image,stop.imagePixels,assetBase).then(result=>{
      if(result.canvas)portraits.set(stop.id,result.canvas);
      else $('status').textContent='Image unavailable for '+stop.building.name+'. Showing its placeholder.';
    });
  }
  const discoveries = new Set();
  let sparks = [], coyote = .12, jumpBuffer = 0, bubbleStop = null;
  let bubbleTier = 0, celebration = 0;
  let camera=0, cameraY=170, width=640, height=360, running=false, timeline=false;
  let previous=0, time=0, sound=false, audio=null, active=null, lastArea=-1;
  let presentation=false;
  let emma=null;
  const engineers=new Map();
  function approachActors(dt){
    if(emma){
      const stop=emma.stop,inSection=player.x>=stop.start&&player.x<stop.end;
      emma.playing=!inSection;
      const target=inSection?clamp(player.x+105,stop.start+30,stop.end-30):stop.end-160;
      const delta=target-emma.x;emma.moving=Math.abs(delta)>2;
      if(emma.moving)emma.facing=delta>0?1:-1;
      else emma.facing=player.x>=emma.x?1:-1;
      emma.x+=Math.sign(delta)*Math.min(Math.abs(delta),235*dt);
    }
    for(const crew of engineers.values())for(const engineer of crew){
      const delta=engineer.target-engineer.x;
      engineer.x+=Math.sign(delta)*Math.min(Math.abs(delta),270*dt);
      engineer.ready=Math.abs(engineer.target-engineer.x)<1;
    }
    for(const crew of engineers.values())if(crew.every(e=>e.ready))crew.delivery=reduced.matches?1:Math.min(1,(crew.delivery||0)+dt/1.4);
  }
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const clearInput=()=>{keys.clear();player.moving=false;player.climbing=false;jumpBuffer=0;};

  function beep(type) {
    if (!sound) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      audio.resume();
      const oscillator=audio.createOscillator(), gain=audio.createGain();
      oscillator.type='square'; oscillator.frequency.value={start:440,jump:330,interact:550,activate:660,end:880,collect:740}[type]||440;
      gain.gain.setValueAtTime(0.035,audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,audio.currentTime+0.14);
      oscillator.connect(gain).connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+0.15);
    } catch (_) { $('status').textContent='Sound is unavailable. The journey works without it.'; }
  }
  function resize() {
    fitBubble();
    const bounds=canvas.getBoundingClientRect();
    // A logical pixel grid preserves chunky art on every display.
    height=360;width=clamp(Math.round(height*bounds.width/Math.max(1,bounds.height)),280,1200);
    canvas.width=width;canvas.height=height;ctx.imageSmoothingEnabled=false;
    camera=clamp(player.x-width*0.35,0,WORLD-width);
    cameraY=Math.max(0,Math.min(GROUND-height*.76,player.y-height*.38));
  }
  new ResizeObserver(resize).observe(game);
  // Keep semantic colours distinct instead of collapsing them to a nearest palette.
  function color(value){return value;}
  function rect(x,y,w,h,fill){ctx.fillStyle=fill;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  const paletteColor=color;
  function text(value,x,y,size=14,color='#eff2d9',align='left'){
    ctx.fillStyle=paletteColor(color);ctx.font=`bold ${size}px monospace`;ctx.textAlign=align;ctx.fillText(value,Math.round(x),Math.round(y));ctx.textAlign='left';
  }
  function line(x,y,x2,y2,fill='#8fe0a3',thickness=3){
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(x2-x),Math.abs(y2-y))/2));
    for(let i=0;i<=steps;i++)rect(x+(x2-x)*i/steps,y+(y2-y)*i/steps,thickness,thickness,fill);
  }
  function cloud(x,y){
    ctx.fillStyle='#f7fbff';ctx.beginPath();
    ctx.ellipse(x+35,y,42,12,0,0,Math.PI*2);
    ctx.ellipse(x+20,y-8,19,15,0,0,Math.PI*2);
    ctx.ellipse(x+48,y-12,22,18,0,0,Math.PI*2);ctx.fill();
  }
  function tree(x,y,tint='#4e8270') {rect(x-4,y-61,9,62,'#795f58');rect(x-30,y-85,61,25,tint);rect(x-22,y-105,45,30,tint);rect(x-12,y-122,25,24,tint);rect(x-26,y-81,17,15,'#6c9b77');}
  function building(x,y,w,h,color,label) {
    rect(x+7,y-h-8,w-14,8,'#a5c6c0');rect(x,y-h,w,h,color);rect(x,y-10,w,10,'#0e2433');
    for(let row=0;row<Math.floor((h-45)/35);row++)for(let col=0;col<Math.floor((w-20)/28);col++){
      rect(x+14+col*28,y-h+20+row*35,14,18,'#77c6b6');rect(x+14+col*28,y-h+20+row*35,14,4,'#ccebc5');
    }
    rect(x+w/2-12,y-36,24,36,'#112c3d');if(label)plaque(label,x+w/2,y-h-43);
  }
  function nameLines(label){
    const words=String(label).match(/.{1,24}(?:\s|$)|\S+/g)||[String(label)];
    return words.flatMap(word=>{const line=word.trim();return line.length>24?line.match(/.{1,24}/g):[line];});
  }
  function plaque(label,x,top){
    const lines=nameLines(label),h=lines.length*16+14;
    const w=Math.max(100,...lines.map(l=>l.length*8+24));
    rect(x-w/2-2,top-2,w+4,h+4,'#fff1bd');rect(x-w/2,top,w,h,'#183047');
    for(let i=0;i<lines.length;i++)text(lines[i],x,top+20+i*16,13,'#fff8df','center');
    return h;
  }
  function drawSectionEntrance(stop){
    const x=stop.buildingX,roof=GROUND-96;
    building(x-90,GROUND,180,96,stop.building.color||'#526575');
    const signHeight=nameLines(stop.building.name).length*16+14;
    const signTop=roof-signHeight-12;
    plaque(stop.building.name,x,signTop);
    const portraitTop=signTop-84;
    rect(x-54,portraitTop-4,108,80,'#183047');rect(x-51,portraitTop-1,102,74,'#fff8df');
    const portrait=portraits.get(stop.id);
    if(portrait){
      ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(portrait,x-48,portraitTop+2,96,68);ctx.restore();
    }else{
      // Original monogram badge until a section image is configured.
      rect(x-47,portraitTop+3,94,66,stop.color);
      rect(x-30,portraitTop+15,60,42,'#304c60');
      const initials=stop.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
      text(initials,x,portraitTop+43,22,'#fff8df','center');
    }
  }
  function monitor(x,y,label='</>',computer=null,phase=0) {
    rect(x,y,84,58,'#121e32');
    if(computer?.screen==='terminal'){
      rect(x+5,y+5,74,43,'#000000');
      ctx.save();ctx.beginPath();ctx.rect(x+7,y+7,70,39);ctx.clip();
      const offset=reduced.matches?phase:time*computer.scrollSpeed+phase;
      const first=Math.floor(offset/9),shift=offset%9,lines=computer.lines;
      for(let row=0;row<6;row++){
        const index=((first+row)%lines.length+lines.length)%lines.length;
        text(lines[index],x+9,y+14+row*9-shift,7,'#76ff79');
      }
      ctx.restore();
    }else{
      rect(x+5,y+5,74,43,'#4d8b86');text(label,x+42,y+33,18,'#c8efb6','center');
    }
    rect(x+35,y+58,13,15,'#a2b1ab');rect(x+20,y+71,45,5,'#a2b1ab');
  }
  const outfits={
    casual:{top:'#235d9c',legs:'#27344d',shoes:'#f1e7cc'},
    graduation:{top:'#273346',legs:'#273346',shoes:'#17202d'},
    suit:{top:'#303747',legs:'#303747',shoes:'#171f2b'},
    hoodie:{top:'#477b69',legs:'#293647',shoes:'#fff0d5'},
    hiking:{top:'#b46c39',legs:'#52634a',shoes:'#513e34'},
    chiefs:{top:'#ad2436',legs:'#e8d9bd',shoes:'#fff4df'}
  };
  function playerOutfit(){return story.find(s=>player.x>=s.start&&player.x<s.end)?.outfit||'casual';}
  function clothing(name){
    if(name==='suit'){
      rect(-2,-12,4,7,'#fff3df');line(-5,-12,-1,-7,'#687383',1);line(4,-12,1,-7,'#687383',1);rect(0,-11,1,7,'#b95558');
    }else if(name==='hoodie'){rect(-6,-16,3,7,'#477b69');rect(-4,-12,8,2,'#9bc4ab');rect(-3,-7,6,2,'#305b50');}
    else if(name==='hiking'){rect(-9,-14,3,12,'#674c37');rect(-5,-12,2,8,'#ddbd7d');}
    else if(name==='chiefs')text('KC',0,-6,5,'#fff4df','center');
  }
  // Smooth shapes are limited to the sprites so the world keeps its retro character.
  function oval(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
  function softRect(x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
  function limb(points,fill,w){ctx.strokeStyle=fill;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(...points[0]);for(const point of points.slice(1))ctx.lineTo(...point);ctx.stroke();}
  function person(x,y,facing=1,walking=false,tint='#70c6be',variant=0,airborne=false,outfit=null) {
    const stride=walking&&!reduced.matches?Math.sin(time*12+variant):0;
    const wear=outfits[outfit]||{top:tint,legs:'#27344d',shoes:'#f1e7cc'};
    ctx.save();ctx.translate(x,y);ctx.scale(facing*2.3,2.3);
    oval(-.5,-19.4,5.6,6.2,'#3c303b');oval(.2,-17.5,4.9,4.9,'#efbd91');
    oval(-1,-22,5.2,2.7,'#3c303b');oval(4,-17,1.9,1.3,'#efbd91');oval(2.5,-19,.7,.8,'#1b2939');
    softRect(-5.8,-12.7,11.5,10.5,3,wear.top);
    if(outfit)clothing(outfit);
    for(const side of [-1,1]){
      const swing=stride*side,hip=side*2,foot=hip+swing*4,lift=Math.max(0,-swing)*1.4;
      limb([[hip,-3],[hip+swing*2,0],[foot,3-lift]],wear.legs,3.4);
      oval(foot+1,3.6-lift,3.1,1.3,wear.shoes);
    }
    if(outfit==='graduation'){
      // The gown covers the upper legs; the feet keep their normal walking stride.
      ctx.fillStyle=wear.top;ctx.beginPath();ctx.moveTo(-6,-12);ctx.lineTo(6,-12);ctx.lineTo(9,1);ctx.quadraticCurveTo(0,3,-9,1);ctx.closePath();ctx.fill();
      limb([[-4,-12],[-2,-7],[-2,0]],'#b36a90',1.8);limb([[4,-12],[2,-7],[2,0]],'#d5b46c',1.8);
      softRect(-8,-12,4.5,9,1.8,wear.top);
      limb([[5,-9],[7,-5],[12,-6]],'#efbd91',2.6);
      softRect(3,-12,4.5,5,1.5,wear.top);
      // Rolled parchment held in front, with a visible ribbon and curled ends.
      softRect(8,-9,11,4.5,1.8,'#fff0cc');oval(8,-6.7,1.4,2.4,'#ddc9a0');oval(19,-6.7,1.4,2.4,'#fff8e5');
      softRect(12.5,-9.3,2.2,5.2,.5,'#ad4057');
      softRect(-5,-26,10,3,1,'#273346');
      ctx.fillStyle='#273346';ctx.beginPath();ctx.moveTo(-10,-26);ctx.lineTo(0,-29.5);ctx.lineTo(10,-26);ctx.lineTo(0,-22.5);ctx.closePath();ctx.fill();
      limb([[0,-26],[8,-24],[8,-19]],'#d5b46c',.8);oval(8,-18.8,.9,1.7,'#d5b46c');
    }else{
      // Arms stay close to the torso; locomotion comes from the legs.
      limb([[-5,-10],[-6.6,-6],[-5.8,-3]],'#efbd91',2.5);
      limb([[5,-10],[6.1,-6],[5.5,-3]],'#efbd91',2.5);
      softRect(-7,-12,3.7,4.8,1.4,wear.top);softRect(3.4,-12,3.7,4.8,1.4,wear.top);
    }
    ctx.restore();
  }
  function cat(x,y,black=false,facing=1,running=false) {
    const fur=black?'#202234':'#e0c19b';
    const stride=running&&!reduced.matches?Math.sin(time*17)*3:0;
    ctx.save();ctx.translate(x,y);ctx.scale(facing,1);
    oval(0,-7,14,7.5,fur);oval(12,-17,8.5,8,fur);
    ctx.fillStyle=fur;ctx.beginPath();ctx.moveTo(5,-21);ctx.lineTo(6,-29);ctx.lineTo(12,-23);ctx.lineTo(17,-29);ctx.lineTo(20,-20);ctx.closePath();ctx.fill();
    ctx.strokeStyle=fur;ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-11,-9);ctx.quadraticCurveTo(-24,-10,-20,-24);ctx.stroke();
    limb([[-8,-4],[-9+stride,3]],fur,4);limb([[7,-4],[8-stride,3]],fur,4);
    oval(15,-19,1.5,1.5,'#c1e287');oval(20,-15,1.2,1,'#ba8a89');
    if(!black){oval(-3,-9,5,4,'#b56a47');oval(8,-20,4,4,'#38313d');}
    ctx.restore();
  }
  function strokeCats(x,y,facing,wear=outfits[playerOutfit()]){
    const stroke=reduced.matches?0:Math.sin(time*4)*1.4;
    ctx.save();ctx.translate(x,y);ctx.scale(facing*2.3,2.3);
    oval(4,-15,5.6,5.3,'#3c303b');oval(5,-12.9,4.9,4,'#efbd91');oval(2.5,-18,4.8,2,'#3c303b');oval(8,-14,.7,.8,'#1b2939');
    softRect(-7,-13,11,9,3,wear.top);softRect(-5,-10,10,6,2.5,wear.top);
    limb([[-5,-5],[-5,1]],wear.legs,4);limb([[-2,-4],[6,-3],[6,2]],wear.legs,4);
    oval(-5,3,3.5,1.3,wear.shoes);oval(7,3,3.5,1.3,wear.shoes);
    limb([[3,-9],[9,-7],[16,-8+stroke]],'#efbd91',2.8);
    ctx.restore();
  }
  function sign(x,y,label,color='#b5e876') {rect(x-3,y,6,50,'#87765e');const w=label.length*9+24;rect(x-w/2,y-28,w,30,'#152d3f');rect(x-w/2,y-28,w,3,color);text(label,x,y-8,14,color,'center');}
  function pipe(x,y,w,progress){
    rect(x,y,w,12,'#457c84');rect(x,y,w,3,'#9bd5c6');
    for(let j=0;j<3;j++){
      const phase=clamp((progress-j*.12)/.7,0,1),delivered=phase*phase*(3-2*phase),start=12+j*34,end=w-100+j*28;
      const offset=start+(end-start)*delivered;
      softRect(x+offset,y-25,24,22,3,delivered===1?'#c0e78e':'#b58d65');
      text(delivered===1?'✓':'+',x+offset+12,y-9,15,'#243b42','center');
    }
  }

  const scenes=window.JourneyScenes.create(world,{ctx,rect,line,text,person,plaque,monitor},reduced);
  const cats=window.JourneyCats.create(world,reduced);
  const totals={main:coins.filter(c=>!c.tier).length,bonus:coins.filter(c=>c.tier).length};
  function updateScore(){
    const main=coins.filter(c=>!c.tier&&discoveries.has(c.id)).length;
    const bonus=coins.filter(c=>c.tier&&discoveries.has(c.id)).length;
    $('progress-label').textContent='GOLD '+main+'/'+totals.main+' · BLUE '+bonus+'/'+totals.bonus;
  }
  function coinLabel(coin){return coin.stop.area.toUpperCase()+' / '+(coin.beat.stage?coin.beat.stage.toUpperCase()+' · ':'')+(coin.tier?'★ BONUS · OPTIONAL':'MAIN STORY')+(coin.airborne?' · JUMP':'');}

  function drawArea(s,index) {
    const x=s.x,y=GROUND;
    drawSectionEntrance(s);
    rect(s.start,y,s.width,6,s.color);

    switch(s.kind) {
      case 'campus': case 'map': case 'pipeline': case 'city': case 'repos':
      case 'system': case 'park': case 'horizon':
        drawPlayableLandmark(s);break;
      case 'computer':
        rect(x-155,y-35,300,14,'#a0785d');
        rect(x-135,y-21,12,21,'#a0785d');rect(x+110,y-21,12,21,'#a0785d');
        monitor(x-120,y-112,'?',s.computers);
        const completed=scenes.progress(s)>.65&&s.event?.resultLines;
        monitor(x+30,y-112,'</>',completed?{screen:'terminal',scrollSpeed:s.computers?.scrollSpeed||10,lines:s.event.resultLines}:s.computers,18);break;
      case 'workshop':
        monitor(x-65,y-90,'</>',s.computers);monitor(x+45,y-90,'</>',s.computers,18);break;
      case 'cloud': case 'hackathon': break;
      case 'garage':
        if(!s.event)building(x-110,y,220,115,'#705b60');break;
      case 'team': {
        const crew=engineers.get(s.id);
        for(let j=0;j<3;j++){
          const px=x-180+j*180,engineer=crew?.[j],ready=!!engineer?.ready;
          monitor(px-25,y-115,ready?'✓':'?',s.computers,j*18);
          rect(px+30,y-52,16,20,'#243c50');rect(px+34,y-48,8,8,ready?'#8ee6a1':'#f47a79');
        }
        const delivery=crew?.delivery||0;
        {
          // The empty output exists before the engineers arrive.
          const board=x+300;
          softRect(board-48,y-195,96,64,5,'#24435b');
          softRect(board-42,y-189,84,52,3,'#f2f7ec');
          for(let j=0;j<3;j++){
            const done=crew?.[j]?.ready?clamp(delivery*1.8-j*.25,0,1):0;
            rect(board-32,y-179+j*12,64,7,'#dce5df');
            rect(board-32,y-179+j*12,64*done,7,['#7ca9c8','#bd9fcb','#b5ba7f'][j]);
          }
          if(delivery===1)text('✓',board+33,y-140,15,'#2d6e51','center');
        }
        break;
      }
      case 'network': {
        const names=['PEOPLE','PRACTICES','PLATFORMS','QUALITY','GOVERNANCE','DELIVERY','CUSTOMERS'];
        const points=[[-260,-145],[-110,-215],[65,-215],[235,-145],[-180,-55],[0,-70],[200,-55]];
        for(let j=0;j<points.length;j++){
          const [px,py]=points[j],[nx,ny]=points[(j+1)%points.length];
          line(x+px,y+py,x+nx,y+ny,'#436d68',2);
          if(scenes.states.get(s.id).active){const t=reduced.matches?1:((time*.45+j*.12)%1);oval(x+px+(nx-px)*t,y+py+(ny-py)*t,3.5,3.5,'#c29548');}
        }
        for(let j=0;j<points.length;j++){
          const [px,py]=points[j];softRect(x+px-49,y+py-14,98,28,4,'#183b40');
          text(names[j],x+px,y+py+4,10,'#fff6db','center');
        }
        break;
      }
    }
    scenes.draw(s,time);
  }

  function drawPlayableLandmark(stop) {
    const x=stop.x,y=GROUND;
    // Art occupies the same geometry as the solid route, rather than sitting behind it.
    switch(stop.kind){
      case 'campus':
        tree(x+230,y,'#537e65');break;
      case 'map':
        tree(x-295,y,'#426b61');
        // The survey marker sits on the summit, clear of the player's route.
        const summit=platforms.filter(p=>p.stop===stop).sort((a,b)=>a.y-b.y)[0];
        if(summit){rect(summit.x+summit.w-25,summit.y-48,8,48,'#d7d5af');rect(summit.x+summit.w-35,summit.y-57,28,9,'#ead9ab');}break;
      case 'pipeline': {
        const progress=scenes.progress(stop);
        // Moving resources hang below the gantry, never across the landing surface.
        const gantry=platforms.find(p=>p.stop===stop);
        if(gantry)pipe(gantry.x+18,y-35,Math.max(120,gantry.w-36),progress);break;
      }
      case 'city':
        // Distant skyline is faint and outside the playable rooftop footprint.
        ctx.save();building(x-355,y,95,185,'#3d706d');building(x+285,y,100,220,'#3d706d');ctx.restore();break;
      case 'repos':
        // Each actual repository stack is painted in drawRoutes().
        break;
      case 'system': {
        const p=scenes.progress(stop),t=p*p*(3-2*p),on=p===1;
        const boxes=Array.from({length:4},(_,j)=>{
          const from=y-155-(j%2)*37;
          return {x:x-205+j*128,y:from+(y-175-from)*t};
        });
        for(let j=0;j<boxes.length-1;j++)line(boxes[j].x+104,boxes[j].y+14,boxes[j+1].x,boxes[j+1].y+14,on?'#89b995':'#986c77',2);
        for(let j=0;j<boxes.length;j++){
          const b=boxes[j];softRect(b.x-2,b.y-2,108,32,4,'#213745');
          softRect(b.x,b.y,104,28,3,on?'#366659':'#594756');
          text(['PRACTICES','QUALITY','SECURITY','DELIVERY'][j],b.x+52,b.y+18,10,'#fff6db','center');
        }
        break;
      }
      case 'park':
        tree(x-280,y,'#826879');
        // Clearly named display boards keep the hobbies readable to every audience.
        const elevatedEnd=Math.max(stop.start+630,...platforms.filter(p=>p.stop===stop&&p.y<GROUND-60).map(p=>p.x+p.w));
        const theatre=stop.start+480,emblem=elevatedEnd+130;
        rect(theatre-88,y-247,176,123,'#513344');rect(theatre-82,y-241,164,111,'#fff0cf');
        rect(theatre-78,y-237,17,88,'#a43c57');rect(theatre+61,y-237,17,88,'#a43c57');
        text('MUSICAL THEATRE',theatre,y-217,13,'#513344','center');
        for(let j=0;j<2;j++){
          const mx=theatre-25+j*50,my=y-177+j*8;
          ctx.fillStyle=j?'#ba6680':'#e5bb62';ctx.beginPath();ctx.ellipse(mx,my,21,27,j?-.18:.18,0,Math.PI*2);ctx.fill();
          rect(mx-12,my-8,6,4,'#342b3c');rect(mx+6,my-8,6,4,'#342b3c');
          ctx.strokeStyle='#342b3c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(mx,my+(j?11:0),11,j?Math.PI:0,j?Math.PI*2:Math.PI);ctx.stroke();
        }
        rect(emblem-99,y-247,198,123,'#a71930');rect(emblem-93,y-241,186,111,'#fff4df');
        text('KANSAS CITY',emblem,y-220,14,'#a71930','center');
        ctx.fillStyle='#fff4df';ctx.strokeStyle='#202534';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(emblem-50,y-207);ctx.lineTo(emblem+27,y-202);ctx.lineTo(emblem+54,y-183);ctx.lineTo(emblem+19,y-164);ctx.lineTo(emblem-50,y-155);ctx.lineTo(emblem-35,y-182);ctx.closePath();ctx.fill();ctx.stroke();
        text('KC',emblem,y-177,28,'#b21f35','center');
        text('CHIEFS',emblem,y-137,17,'#a71930','center');
        const piano=Math.max(stop.start+1040,emblem+240);
        rect(piano-88,y-247,176,123,'#283543');rect(piano-82,y-241,164,111,'#fff0cf');
        text('PIANO',piano,y-217,16,'#283543','center');
        rect(piano-66,y-201,132,54,'#283543');
        for(let j=0;j<14;j++){const lit=scenes.states.get(stop.id).active&&(reduced.matches?j===4:j===Math.floor(time*3)%14);rect(piano-62+j*9,y-185,8,32,lit?'#dfb866':'#fffaf0');}
        for(let j=0;j<13;j++)if(![2,6,9].includes(j))rect(piano-57+j*9,y-185,5,20,'#172333');
        rect(piano-65,y-149,130,5,'#a67b5b');
        break;
      case 'horizon':
        for(let j=0;j<3;j++){rect(x+275+j*46,y-45,28,7,'#eab774');rect(x+285+j*46,y-55,8,30,'#eab774');}
        break;
    }
  }

  function drawActors(){
    const visible=x=>x>camera-45&&x<camera+width+45;
    for(const crew of engineers.values())for(let j=0;j<crew.length;j++){
      const engineer=crew[j];
      if(visible(engineer.x))person(engineer.x,GROUND,-1,!engineer.ready,['#7ca9c8','#bd9fcb','#b5ba7f'][j],j);
    }
    if(emma&&visible(emma.x)){
      if(emma.playing&&!emma.moving){
        strokeCats(emma.x,GROUND,1,{top:'#bd708e',legs:'#27344d',shoes:'#f1e7cc'});
        softRect(emma.x-4,GROUND-42,9,23,4,'#684739');
        const toyX=emma.x+65+(reduced.matches?0:Math.sin(time*2)*14);
        limb([[emma.x+37,GROUND-17],[toyX,GROUND-12]],'#b79b6a',2);oval(toyX,GROUND-8,4,4,'#d59b48');
      }else{
        person(emma.x,GROUND,emma.facing,emma.moving,'#bd708e');softRect(emma.x-emma.facing*15,GROUND-56,9,32,4,'#684739');
      }
    }
    for(const stop of story)if(stop.end>camera-100&&stop.start<camera+width+100)scenes.drawActors(stop);
    for(const animal of cats.animals)if(visible(animal.x))cat(animal.x,GROUND,animal.black,animal.facing,animal.running);
    if(cats.petting)strokeCats(player.x,player.y,cats.facing);
    else person(player.x,player.y,player.facing,player.moving,'#235d9c',0,!player.grounded||player.climbing,playerOutfit());
  }

  function drawRoutes() {
    for (const platform of platforms) {
      if(platform.x+platform.w<camera-80||platform.x>camera+width+80)continue;
      const {x,y,w,stop,tier}=platform;
      const ladderX=x+35;
      if(platform.ladder){
        rect(ladderX-13,y+10,5,GROUND-y-10,'#ad9775');
        rect(ladderX+10,y+10,5,GROUND-y-10,'#ad9775');
        for(let rung=y+21;rung<GROUND;rung+=15)rect(ladderX-9,rung,20,4,'#e2c99b');
      }
      const terrain=stop.kind==='map'||stop.kind==='park'||stop.kind==='campus';
      if(stop.event?.type==='classroom'){
        rect(x,y+6,w,18,'#b8875b');rect(x+7,y+11,w-14,6,'#f3dfb7');rect(x+9,y+6,4,18,'#865945');
      }else if(terrain){
        rect(x,y+6,w,20,stop.kind==='campus'?'#52616a':'#344e47');
        rect(x+8,y+26,12,Math.max(0,GROUND-y-26),'#34433f');rect(x+w-20,y+26,12,Math.max(0,GROUND-y-26),'#34433f');
        for(let j=14;j<w-12;j+=35)rect(x+j,y+21,13,5,'#597265');
      }else if(stop.kind==='repos'){
        for(let row=y+6;row<GROUND;row+=22)for(let col=x;col<x+w-10;col+=32){if(row<y+45||col<x+35||col>x+w-55){rect(col,row,28,18,'#38605b');rect(col+5,row+5,10,3,'#76a78e');}}
      }else{
        rect(x,y+6,w,12,'#2c454e');
        rect(x+10,y+18,6,GROUND-y-18,'#33484d');rect(x+w-16,y+18,6,GROUND-y-18,'#33484d');
      }
      // An uninterrupted pale edge identifies every walkable surface.
      rect(x-2,y-2,w+4,10,'#172e43');rect(x,y,w,5,'#f2d592');
      if(stop.event?.type==='repositories'&&scenes.progress(stop)>0){const n=scenes.progress(stop);rect(x+8,y+12,(w-16)*n,3,'#c7e6b2');}
    }

  }

  function drawCoins() {
    for(const coin of coins){
      if(discoveries.has(coin.id)||coin.x<camera-30||coin.x>camera+width+30)continue;
      const bob=reduced.matches?0:Math.sin(time*2.4+coin.x)*2;
      const x=coin.x,y=coin.y+bob;
      if(coin.tier){
        ctx.fillStyle='#8cc8fa';ctx.strokeStyle='#244d77';ctx.lineWidth=2.5;
        ctx.beginPath();ctx.moveTo(x,y-16);ctx.lineTo(x+13,y);ctx.lineTo(x,y+16);ctx.lineTo(x-13,y);ctx.closePath();ctx.fill();ctx.stroke();
        text('★',x,y+5,13,'#163e64','center');
      }else{
        ctx.fillStyle='#f6c453';ctx.strokeStyle='#74470d';ctx.lineWidth=2.5;
        ctx.beginPath();ctx.ellipse(x,y,11,14,0,0,Math.PI*2);ctx.fill();ctx.stroke();
        ctx.strokeStyle='#fff0ae';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x-1,y-1,7,10,0,Math.PI*.65,Math.PI*1.5);ctx.stroke();
        rect(x-2,y-6,4,12,'#a86e15');
      }


    }
  }
  function showBubble(coin) {
    bubbleStop=coin.stop;bubbleTier=coin.tier;
    $('bubble-location').textContent=coinLabel(coin);
    $('story-bubble').setAttribute('data-kind',coin.tier?'bonus':'story');
    // Transform within the reserved area; text changes never resize the playfield.
    $('story-bubble').setAttribute('data-position',String(discoveries.size%3));
    $('bubble-title').textContent=coin.beat.title;
    $('bubble-body').textContent=coin.beat.body;
    $('story-bubble').hidden=false;
  }
  function fitBubble(){
    // Measure every message at this viewport size, never on coin pickup. Reserving
    // the largest bubble keeps the playfield and camera steady for the whole run.
    const probe=document.createElement('aside');
    probe.className='story-bubble bubble-measure';
    probe.setAttribute('aria-hidden','true');
    const label=document.createElement('p'),title=document.createElement('h2'),body=document.createElement('p');
    label.className='bubble-location';title.className='bubble-title';body.className='bubble-body';
    probe.append(label,title,body);game.append(probe);
    let largest=0;
    for(const coin of coins){
      label.textContent=coinLabel(coin);
      title.textContent=coin.beat.title;body.textContent=coin.beat.body;
      largest=Math.max(largest,probe.getBoundingClientRect().height);
    }
    probe.remove();
    const space=Math.ceil(largest+88);
    game.style.setProperty('--bubble-height',Math.ceil(largest)+'px');
    game.style.setProperty('--story-space',space+'px');
    const compact=matchMedia('(max-height:550px) and (min-width:560px)').matches;
    game.style.minHeight=(compact?Math.max(280,space):Math.max(480,space+240))+'px';
  }

  function collectCoin(coin) {
    const id=coin.id;
    if(discoveries.has(id))return;
    discoveries.add(id);visited.add(coin.stop.id);showBubble(coin);scenes.collect(coin.stop,coin);
    if(coin.action==='meetCats')cats.summon();
    if(coin.beat.title==='Meet Emma.'&&!emma)emma={stop:coin.stop,x:Math.max(camera+width+70,player.x+210),facing:-1,moving:true};
    if(coin.stop.event?.type==='leadership'&&scenes.states.get(coin.stop.id).active&&!engineers.has(coin.stop.id)){
      const start=Math.max(camera+width+80,coin.stop.x+315);
      engineers.set(coin.stop.id,Array.from({length:3},(_,j)=>({x:start+j*75,target:coin.stop.x-180+j*180+55,ready:false})));
    }
    if(coin.stop.effect&&(!coin.stop.event||scenes.states.get(coin.stop.id).active))effects.add(coin.stop.effect);
    celebration=1.1;
    updateScore();
    beep('collect');
    if(!reduced.matches)for(let j=0;j<8;j++)sparks.push({x:coin.x,y:coin.y,vx:(j-3.5)*35,vy:-100-Math.random()*100,life:.5,color:coin.tier?'#8cc8fa':'#f5cc56'});
  }
  function nearestLadder() {
    return platforms.find(p=>p.ladder&&Math.abs(player.x-(p.x+35))<25&&player.y>=p.y-8&&player.y<=GROUND+1);
  }
  function supported() {
    return player.y===GROUND||platforms.some(p=>player.x+12>p.x&&player.x-12<p.x+p.w&&Math.abs(player.y-p.y)<1);
  }
  function movePlayer(dt,direction) {
    coyote=player.grounded?.12:Math.max(0,coyote-dt);
    jumpBuffer=Math.max(0,jumpBuffer-dt);
    const ladder=nearestLadder();
    const vertical=(keys.has('ArrowDown')?1:0)-(keys.has('ArrowUp')?1:0);
    const climbing=ladder&&vertical!==0&&!(vertical<0&&player.y<=ladder.y);
    player.climbing=!!climbing;player.moving=direction!==0||!!climbing;
    if(climbing){
      player.x=ladder.x+35;player.vy=0;
      player.y=clamp(player.y+vertical*180*dt,ladder.y,GROUND);
      player.grounded=supported();
    }else{
      // Holding still on a ladder is safe; horizontal movement releases it.
      const hanging=ladder&&direction===0&&!supported()&&player.vy===0&&jumpBuffer===0;
      if(direction){player.facing=direction;player.x=clamp(player.x+direction*265*dt,world.spawnX,WORLD-110);}
      if(jumpBuffer>0&&(coyote>0||ladder)){
        player.vy=-570;player.grounded=false;player.climbing=false;jumpBuffer=0;coyote=0;beep('jump');
      }
      if(!hanging){
        const oldY=player.y;player.vy+=1350*dt;player.y+=player.vy*dt;
        player.grounded=false;
        // One-way collision: jump through undersides; land reliably from above.
        const landing=platforms.filter(p=>player.x+12>p.x&&player.x-12<p.x+p.w&&oldY<=p.y+.5&&player.y>=p.y&&player.vy>=0).sort((a,b)=>a.y-b.y)[0];
        if(landing){player.y=landing.y;player.vy=0;player.grounded=true;}
        if(player.y>=GROUND){player.y=GROUND;player.vy=0;player.grounded=true;}
      }
    }
    for(const coin of coins){
      if(Math.abs(player.x-coin.x)<27&&Math.abs(player.y-24-coin.y)<34)collectCoin(coin);
    }
  }
  function draw() {
    // Quiet, pale background; dark foreground and gold coin outlines stay distinct.
    const palette=scenes.paletteAt(player.x);
    game.style.setProperty('--scene-sky',palette.sky);game.style.setProperty('--scene-ink',palette.ink);
    rect(0,0,width,height,palette.sky);
    const floor=GROUND-cameraY;
    if(palette.kind==='interior'){
      for(let j=-1;j<width/112+1;j++){
        const px=j*112-(camera*.12%112);rect(px,30,96,Math.max(90,floor-45),palette.hills);
        rect(px+8,42,80,3,'#567784');rect(px+8,62,4,8,'#92c9a5');
      }
    }else{
      for(let j=0;j<5;j++){const cx=((j*240-camera*.12)%(width+260)+width+260)%(width+260)-90;cloud(cx,35+(j%2)*32);}
      ctx.fillStyle=palette.hills;
      for(let j=-1;j<width/230+2;j++){
        const hx=j*230-(camera*.18%230);
        if(palette.kind==='city'){
          rect(hx,floor-140,78,140,palette.hills);rect(hx+85,floor-200,90,200,palette.hills);rect(hx+182,floor-110,50,110,palette.hills);
        }else{ctx.beginPath();ctx.ellipse(hx+100,floor+45,190,145+(j%2)*25,0,Math.PI,Math.PI*2);ctx.fill();}
      }
    }
    rect(0,floor,width,height-floor,palette.earth);
    rect(0,floor,width,8,palette.grass);rect(0,floor+8,width,4,'#223c35');
    for(let j=-1;j<width/90+1;j++){
      const sx=j*90-(camera%90);
      rect(sx,floor+30+(j%3)*12,12,3,'#637061');
    }
    ctx.save();ctx.translate(-Math.round(camera),-Math.round(cameraY));
    // Backdrops are contained within each section. Solid routes then sit in front;
    // characters, collectible markers and short-lived feedback form separate passes.
    for(let j=0;j<story.length;j++)if(story[j].end>camera-100&&story[j].start<camera+width+100){
      ctx.save();ctx.beginPath();ctx.rect(story[j].start,GROUND-400,story[j].width,600);ctx.clip();
      drawArea(story[j],j);ctx.restore();
    }
    drawRoutes();
    drawActors();
    drawCoins();
    for(const spark of sparks)rect(spark.x,spark.y,4,4,spark.color);
    for(let j=Math.floor(camera/170);j<(camera+width)/170+1;j++){const fx=j*170;rect(fx,GROUND+115,4,20,'#78a085');rect(fx-7,GROUND+120,18,4,'#78a085');}
    ctx.restore();
  }
  function update(dt) {
    if(!running||timeline||dialog.open) return;
    const direction=(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0);
    movePlayer(dt,direction);
    approachActors(dt);
    cats.update(player,dt,emma?.playing?emma:null);
    for(const stop of scenes.update(player.x,dt)){
      if(stop.effect)effects.add(stop.effect);
      $('status').textContent=stop.event.caption||stop.area;
      beep('activate');
    }
    celebration=Math.max(0,celebration-dt);
    for(const spark of sparks){spark.x+=spark.vx*dt;spark.y+=spark.vy*dt;spark.vy+=500*dt;spark.life-=dt;}
    sparks=sparks.filter(spark=>spark.life>0);
    const target=clamp(player.x-width*.35,0,WORLD-width);camera=reduced.matches?target:camera+(target-camera)*(1-Math.exp(-8*dt));
    const verticalTarget=Math.max(0,Math.min(GROUND-height*.76,player.y-height*.38));
    cameraY=reduced.matches?verticalTarget:cameraY+(verticalTarget-cameraY)*(1-Math.exp(-7*dt));
    const area=Math.max(0,story.findLastIndex(s=>player.x>=s.start));
    if(area!==lastArea){lastArea=area;$('chapter').textContent=String(area+1).padStart(2,'0')+' / '+story[area].area.toUpperCase();$('section-jump').value=story[area].id;}
    if(player.x>=world.finishX&&!visited.has('ending')){visited.add('ending');openStory(story.at(-1));}
    const progress=Math.round(clamp((player.x-world.spawnX)/(world.finishX-world.spawnX),0,1)*100);$('progress').style.width=progress+'%';document.querySelector('.progress').setAttribute('aria-valuenow',progress);
  }
  function loop(timestamp){const dt=Math.min((timestamp-previous)/1000||0,.04);previous=timestamp;if(!reduced.matches&&!document.hidden&&!timeline&&!dialog.open)time+=dt;update(dt);if(!timeline)draw();requestAnimationFrame(loop);}
  function jump(){if(running&&!timeline&&!dialog.open)jumpBuffer=.14;}
  function openStory(s){
    active=s;clearInput();visited.add(s.id);
    $('dialog-counter').textContent=String(story.indexOf(s)+1).padStart(2,'0')+' / JOURNEY COMPLETE';
    $('dialog-title').textContent=s.title;$('dialog-subtitle').textContent=s.subtitle;$('dialog-body').textContent=s.body;
    $('dialog-highlights').replaceChildren(...s.highlights.map(value=>{const li=document.createElement('li');li.textContent=value;return li;}));
    $('continue').textContent='Explore Again ↺';$('website').hidden=false;
    $('ending-summary').textContent='Explain clearly. Make complexity understandable. Help others succeed. The people along the way carry those lessons into what we build next.';
    dialog.showModal();beep('end');$('continue').focus();
  }
  function closeStory(){dialog.close();clearInput();canvas.focus();}
  function start(){game.classList.toggle('entered',true);running=true;$('title-screen').hidden=true;clearInput();canvas.focus();beep('start');}
  function restart(){game.classList.toggle('entered',false);closeStory();effects.clear();visited.clear();discoveries.clear();scenes.reset();cats.reset();emma=null;engineers.clear();sparks=[];bubbleStop=null;bubbleTier=0;celebration=0;coyote=.12;$('story-bubble').hidden=true;updateScore();player.x=world.spawnX;player.y=GROUND;player.vy=0;player.grounded=true;player.climbing=false;camera=0;cameraY=GROUND-height*.76;lastArea=-1;running=false;$('title-screen').hidden=false;$('chapter').textContent='01 / '+story[0].area.toUpperCase();$('progress').style.width='0%';document.querySelector('.progress').setAttribute('aria-valuenow',0);$('start').focus();resize();}
  function jumpToSection(index){
    const next=story[clamp(index,0,story.length-1)];
    if(dialog.open)closeStory();if(timeline)showTimeline(false);if(!running)start();
    clearInput();player.x=next.start+70;player.y=GROUND;player.vy=0;player.grounded=true;
    camera=clamp(player.x-width*.35,0,WORLD-width);cameraY=GROUND-height*.76;
    $('story-bubble').hidden=true;lastArea=-1;$('section-jump').value=next.id;
    canvas.focus();$('status').textContent='Jumped to '+next.area;
  }
  function currentSection(){return Math.max(0,story.findLastIndex(stop=>player.x>=stop.start));}
  function showTimeline(show){timeline=show;clearInput();$('timeline').hidden=!show;game.hidden=show;$('timeline-toggle').textContent=show?'Back to the world':'View journey as timeline';if(show){$('timeline-title').tabIndex=-1;$('timeline-title').focus();}else{resize();if(running)canvas.focus();else $('start').focus();}}
  for(const s of story){const article=document.createElement('article');const title=document.createElement('h2');title.textContent=s.title+(s.optional?' · optional':'');const subtitle=document.createElement('h3');subtitle.textContent=s.subtitle;const body=document.createElement('p');body.textContent=s.body;const list=document.createElement('ul');for(const value of s.highlights){const li=document.createElement('li');li.textContent=value;list.append(li);}article.append(title,subtitle,body,list);$('timeline-content').append(article);}
  for(const stop of story){const option=document.createElement('option');option.value=stop.id;option.textContent=stop.area;$('section-jump').append(option);}
  $('previous-section').onclick=()=>jumpToSection(currentSection()-1);
  $('next-section').onclick=()=>jumpToSection(currentSection()+1);
  $('section-jump').onchange=()=>jumpToSection(story.findIndex(s=>s.id===$('section-jump').value));
  $('start').onclick=start;$('restart').onclick=()=>{showTimeline(false);restart();};$('close-dialog').onclick=closeStory;
  $('continue').onclick=restart;dialog.addEventListener('close',()=>{clearInput();canvas.focus();});
  $('timeline-toggle').onclick=()=>showTimeline(!timeline);$('back-game').onclick=()=>showTimeline(false);
  $('title-timeline').onclick=e=>{e.preventDefault();showTimeline(true);};document.querySelector('.skip').onclick=e=>{e.preventDefault();showTimeline(true);};
  $('sound').onclick=()=>{sound=!sound;$('sound').textContent='Sound '+(sound?'on':'off');$('sound').setAttribute('aria-pressed',sound);if(sound)beep('start');};
  function presentationUI(on){presentation=on;document.body.classList.toggle('presenting',on);$('fullscreen').textContent=on?'↙ Exit presentation':'⛶ Present';$('fullscreen').setAttribute('aria-pressed',on);resize();}
  $('fullscreen').onclick=async()=>{
    if(presentation){if(document.fullscreenElement)await document.exitFullscreen().catch(()=>{});presentationUI(false);return;}
    presentationUI(true);
    try{if(!document.documentElement.requestFullscreen)throw new Error('unsupported');await document.documentElement.requestFullscreen();}catch(_){$('status').textContent='Presentation view enabled. Fullscreen is unavailable; use Exit presentation to return.';}
  };
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)presentationUI(false);});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&presentation&&!dialog.open){presentationUI(false);return;}
    // Native buttons and the modal retain their standard keyboard behaviour.
    if(e.target!==canvas||!running||timeline||dialog.open)return;
    if(['[',']','Home','End'].includes(e.key)&&!e.repeat){e.preventDefault();jumpToSection(e.key==='Home'?0:e.key==='End'?story.length-1:currentSection()+(e.key===']'?1:-1));return;}
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();
    if(e.key===' '&&!e.repeat)jump();
    else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
      if(e.key==='ArrowUp'&&!e.repeat&&!nearestLadder())jump();
      keys.add(e.key);
    }
  });
  document.addEventListener('keyup',e=>keys.delete(e.key));window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',clearInput);
  document.querySelectorAll('[data-control]').forEach(button=>{
    button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);if(button.dataset.control==='Jump')jump();else if(running&&!dialog.open){keys.add(button.dataset.control);if(button.dataset.control==='ArrowUp'&&!nearestLadder())jump();}});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,()=>keys.delete(button.dataset.control));
    // Also operable with keyboard / assistive technology.
    button.addEventListener('click',e=>{if(e.detail===0){if(!running||dialog.open||timeline)return;
      if(button.dataset.control==='Jump')jump();
      else if(button.dataset.control==='ArrowUp'||button.dataset.control==='ArrowDown'){
        const ladder=nearestLadder();if(ladder){player.x=ladder.x+35;player.y=clamp(player.y+(button.dataset.control==='ArrowUp'?-64:64),ladder.y,GROUND);player.vy=0;}else if(button.dataset.control==='ArrowUp')jump();
      }else{player.x=clamp(player.x+(button.dataset.control==='ArrowRight'?65:-65),world.spawnX,WORLD-110);}}});
  });
  $('chapter').textContent='01 / '+story[0].area.toUpperCase();
  updateScore();
  resize();requestAnimationFrame(loop);
})();
