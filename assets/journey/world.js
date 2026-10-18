/* Compile editable sections into geometry. Rendering and movement live elsewhere. */
(() => {
  'use strict';
  const GROUND=450, START=40, TEXT_LIMIT=180;
  function number(value,fallback,min,max,name){
    const n=value===undefined?fallback:value;
    if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw new Error(name+' must be between '+min+' and '+max+'.');
    return n;
  }
  function chunks(text){
    const result=[];let pending='';
    function add(fragment){if(pending&&pending.length+fragment.length+1>TEXT_LIMIT){result.push(pending);pending='';}pending+=(pending?' ':'')+fragment;}
    for(const sentence of text.trim().split(/(?<=[.!?])\s+/)){
      if(sentence.length<=TEXT_LIMIT)add(sentence);else for(const word of sentence.split(/\s+/))add(word);
    }
    if(pending)result.push(pending);return result;
  }
  function build(config){
    if(!config||!Array.isArray(config.sections)||!config.sections.length)throw new Error('Add at least one section to JOURNEY_CONFIG.sections.');
    const defaults=config.defaults||{},sections=[],platforms=[],coins=[],ids=new Set();
    const minSpacing=number(defaults.minCoinSpacing,160,100,1000,'minCoinSpacing');
    const defaultHeight=number(defaults.coinHeight,28,20,120,'coinHeight');
    const defaultWidth=number(defaults.sectionWidth,1050,650,10000,'sectionWidth');
    const defaultPixels=number(defaults.imagePixels,64,16,96,'imagePixels');
    const outfits=['casual','suit','hoodie','hiking','chiefs','graduation'];
    const defaultOutfit=defaults.outfit||'casual';
    if(!outfits.includes(defaultOutfit))throw new Error('Unknown default outfit.');
    let cursor=0;
    for(const source of config.sections){
      if(typeof source.id!=='string'||!source.id.trim()||ids.has(source.id))throw new Error('Each section needs a unique id: '+source.id);
      if(typeof source.name!=='string'||!source.name.trim()||typeof source.building?.name!=='string'||!source.building.name.trim())throw new Error(source.id+': set name and building.name.');
      if(source.building.image!=null&&typeof source.building.image!=='string')throw new Error(source.id+': building.image must be a filename or null.');
      if(source.platforms!==undefined&&!Array.isArray(source.platforms))throw new Error(source.id+': platforms must be an array.');
      if(!Array.isArray(source.coins)||!source.coins.length)throw new Error(source.id+': add at least one story coin.');
      if(source.outfit!==undefined&&!outfits.includes(source.outfit))throw new Error(source.id+': unknown outfit.');
      ids.add(source.id);
      const entries=source.coins.flatMap((coin,index)=>{
        if(typeof coin.title!=='string'||!coin.title.trim()||typeof coin.text!=='string'||!coin.text.trim())throw new Error(source.id+': coin '+(index+1)+' needs title and text.');
        if(coin.stage!==undefined&&!['challenge','choice','outcome'].includes(coin.stage))throw new Error(source.id+': unknown coin stage.');
        if(coin.action!==undefined&&coin.action!=='meetCats')throw new Error(source.id+': unknown coin action.');
        const height=number(coin.height,defaultHeight,20,120,source.id+' coin height');
        return chunks(coin.text).map((body,part)=>({title:coin.title,body,height,stage:coin.stage,bonus:coin.bonus===undefined?!!source.optional:!!coin.bonus,action:part===0?coin.action:null,id:source.id+':coin:'+index+':'+part}));
      });
      const isFinale=source===config.sections.at(-1)&&source.event?.type==='finale';
      const length=Math.max(isFinale?Math.max(1050,2*((entries.length-1)*minSpacing-20)):0,number(source.width,defaultWidth,650,10000,source.id+' width'),460+(entries.length-1)*minSpacing);
      const start=cursor,end=start+length,playStart=start+340,playEnd=end-100;
      const stop={...source,start,end,width:length,x:(playStart+playEnd)/2,area:source.name,title:source.building.name,
        outfit:source.outfit||defaultOutfit,kind:source.scenery||'workshop',color:source.color||'#89b995',buildingX:start+150,
        subtitle:entries[0].title,body:source.details||source.coins.map(c=>c.text).join(' '),highlights:[],coinBeats:entries,
        imagePixels:number(source.building.imagePixels,defaultPixels,16,96,source.id+' imagePixels')};
      if(source.computers){
        const screen=source.computers.screen||'symbol';
        if(!['symbol','terminal'].includes(screen))throw new Error(source.id+': computers.screen must be symbol or terminal.');
        const lines=source.computers.lines||['READY.', '> LOAD IDEAS', 'EXPLORING...', '> BUILD SOMETHING', 'HELLO, WORLD!', '> KEEP LEARNING', 'OK'];
        if(!Array.isArray(lines)||!lines.length||lines.some(line=>typeof line!=='string'))throw new Error(source.id+': computers.lines must be a non-empty array of text.');
        stop.computers={screen,scrollSpeed:number(source.computers.scrollSpeed,10,0,40,source.id+' terminal scrollSpeed'),
          lines:lines.flatMap(line=>line.match(/.{1,16}/g)||[''])};
      }
      if(source.details!==undefined&&typeof source.details!=='string')throw new Error(source.id+': details must be text.');
      if(source.atmosphere&&!['morning','terminal','workshop','meadow','industrial','enterprise','dusk','horizon'].includes(source.atmosphere))throw new Error(source.id+': unknown atmosphere.');
      const eventTypes=['classroom','firstbuild','sharing','hackathon','map','selfservice','simplify','converge','repositories','governance','leadership','ecosystem','personal','finale'];
      if(source.event){
        if(source.event.trigger!==undefined&&!['walk','coin'].includes(source.event.trigger))throw new Error(source.id+': unknown event trigger.');
        if(source.event.coinStage!==undefined&&(!['challenge','choice','outcome'].includes(source.event.coinStage)||source.event.trigger!=='coin'||!source.coins.some(c=>c.stage===source.event.coinStage)))throw new Error(source.id+': event.coinStage needs a matching coin and a coin trigger.');
        if(source.event.caption!==undefined&&typeof source.event.caption!=='string')throw new Error(source.id+': event.caption must be text.');
        if(!eventTypes.includes(source.event.type))throw new Error(source.id+': unknown event type.');
        stop.event={...source.event,at:number(source.event.at,.45,0,1,source.id+' event at'),duration:number(source.event.duration,1.5,.2,8,source.id+' event duration')};
        if(source.event.resultLines){
          if(!Array.isArray(source.event.resultLines)||!source.event.resultLines.length||source.event.resultLines.some(line=>typeof line!=='string'))throw new Error(source.id+': event.resultLines must contain text.');
          stop.event.resultLines=source.event.resultLines.flatMap(line=>line.match(/.{1,16}/g)||['']);
        }
      }
      if(source.characters!==undefined&&!Array.isArray(source.characters))throw new Error(source.id+': characters must be an array.');
      stop.characters=(source.characters||[]).map(c=>{
        if(c.speech!==undefined&&typeof c.speech!=='string')throw new Error(source.id+': character speech must be text.');
        if(typeof c.name!=='string'||!c.name.trim())throw new Error(source.id+': character needs a name.');
        return {...c,at:number(c.at,.65,0,1,source.id+' character at')};
      });
      sections.push(stop);
      const local=(source.platforms||[]).map((p,index)=>{
        const rise=number(p.rise,60,24,180,source.id+' platform rise');
        const w=Math.min(number(p.width,140,60,600,source.id+' platform width'),playEnd-playStart);
        const at=number(p.at,.5,0,1,source.id+' platform at');
        return {stop,x:playStart+at*(playEnd-playStart-w),y:GROUND-rise,w,ladder:!!p.ladder||rise>110,tier:index+1};
      });
      platforms.push(...local);
      const coinEnd=isFinale?stop.x+240:playEnd;
      for(let index=0;index<entries.length;index++){
        const beat=entries[index];
        const x=entries.length===1?(playStart+coinEnd)/2:playStart+(coinEnd-playStart)*index/(entries.length-1);
        const support=local.filter(p=>x>=p.x&&x<=p.x+p.w).sort((a,b)=>a.y-b.y)[0]||null;
        coins.push({stop,beat,action:beat.action,id:beat.id,tier:beat.bonus?1:0,height:beat.height,x,y:(support?support.y:GROUND)-beat.height,
          airborne:beat.height>60,support,ending:isFinale&&index===entries.length-1});
      }
      cursor=end;
    }
    const last=sections.at(-1);
    let ending=null;
    if(last.event?.type==='finale'){
      const fallback=[{name:'Teacher',outfit:'graduation'},{name:'Engineer',outfit:'casual'},{name:'Team Builder',outfit:'hoodie'},{name:'Leader',outfit:'suit'}];
      const cast=last.ending?.cast||fallback,playerName=last.ending?.playerName||'Phil';
      if(!Array.isArray(cast)||cast.length!==4||cast.some(c=>!c||typeof c.name!=='string'||!c.name.trim()||(c.outfit!==undefined&&!outfits.includes(c.outfit))))throw new Error('ending.cast needs four named characters with valid outfits.');
      if(typeof playerName!=='string')throw new Error('ending.playerName must be text.');
      const firstX=last.x-160,spacing=100,playerX=firstX+cast.length*spacing;
      ending={stop:last,cast:cast.map((c,i)=>({...c,x:firstX+i*spacing})),firstX,spacing,playerX,playerName};
      const finalCoin=coins.findLast(c=>c.stop===last);finalCoin.x=playerX;
      const support=platforms.filter(p=>p.stop===last&&playerX>=p.x&&playerX<=p.x+p.w).sort((a,b)=>a.y-b.y)[0]||null;
      finalCoin.support=support;finalCoin.y=(support?support.y:GROUND)-finalCoin.height;
    }
    return {sections,platforms,coins,ending,ground:GROUND,spawnX:START,worldWidth:cursor+200,finishX:ending?.playerX??last.end-60};
  }
  window.JourneyWorld={build,chunks};
  try{window.JOURNEY_WORLD=build(window.JOURNEY_CONFIG);window.JOURNEY_STORY=window.JOURNEY_WORLD.sections;}
  catch(error){window.JOURNEY_CONFIG_ERROR=error.message;}
})();
