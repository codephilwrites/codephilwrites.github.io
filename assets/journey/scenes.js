/* Configurable environmental storytelling. Events change scenery, never block travel. */
(() => {
  'use strict';
  const atmospheres={
    morning:{sky:'#f2eadb',hills:'#c5d3bf',earth:'#514d40',grass:'#789064',ink:'#243e56'},
    terminal:{sky:'#1a2a40',hills:'#293f55',earth:'#263b43',grass:'#75a18a',ink:'#e0f0f6'},
    workshop:{sky:'#eee3d1',hills:'#c6c2b3',earth:'#4b4941',grass:'#9a986e',ink:'#243e56'},
    meadow:{sky:'#dfeddf',hills:'#b0ccb7',earth:'#354b41',grass:'#65875b',ink:'#243e56'},
    industrial:{sky:'#dce9ee',hills:'#a8c1cc',earth:'#34444d',grass:'#8ba79c',ink:'#243e56'},
    enterprise:{sky:'#e1edf6',hills:'#b0c6d4',earth:'#354952',grass:'#7fa399',ink:'#243e56'},
    dusk:{sky:'#e9e0ee',hills:'#beb0c8',earth:'#48424d',grass:'#8a9c82',ink:'#34324b'},
    horizon:{sky:'#f8e8d6',hills:'#c9c9b7',earth:'#4a4e45',grass:'#9ca786',ink:'#243e56'}
  };
  const clamp=n=>Math.max(0,Math.min(1,n));
  function mix(a,b,t){return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');}
  function create(world,draw,reduced){
    const {ctx,rect,line,text,person,plaque}=draw,G=world.ground;
    const states=new Map(),encountered=new Set();
    for(const stop of world.sections)states.set(stop.id,{active:false,progress:0});
    function update(x,dt){
      const activated=[];
      for(const stop of world.sections){
        const state=states.get(stop.id);
        if(x>=stop.start&&x<stop.end)encountered.add(stop.id);
        if(stop.event&&stop.event.trigger!=='coin'&&!state.active&&x>=stop.start+stop.width*stop.event.at&&x<stop.end){state.active=true;activated.push(stop);}
        if(state.active)state.progress=reduced.matches?1:Math.min(1,state.progress+dt/stop.event.duration);
      }
      return activated;
    }
    function collect(stop,coin){
      if(stop.event?.trigger!=='coin'||(stop.event.coinStage&&coin?.beat.stage!==stop.event.coinStage))return false;
      const state=states.get(stop.id);
      if(state.active)return false;
      state.active=true;return true;
    }
    function reset(){for(const state of states.values()){state.active=false;state.progress=0;}encountered.clear();}
    function paletteAt(x){
      const index=Math.max(0,world.sections.findLastIndex(s=>x>=s.start));
      const stop=world.sections[index],target=atmospheres[stop.atmosphere]||atmospheres.meadow;
      const from=atmospheres[world.sections[Math.max(0,index-1)].atmosphere]||atmospheres.meadow;
      const t=clamp((x-stop.start)/160),result={};
      for(const key of Object.keys(target))result[key]=mix(from[key],target[key],t);
      const linear=[1,3,5].map(i=>{const c=parseInt(result.sky.slice(i,i+2),16)/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});
      const luminance=linear.reduce((n,c,i)=>n+c*[.2126,.7152,.0722][i],0);
      result.ink=luminance>.179?'#000000':'#ffffff';
      result.kind=stop.atmosphere==='terminal'?'interior':stop.atmosphere==='enterprise'?'city':'landscape';
      return result;
    }
    const progress=stop=>states.get(stop.id).progress;
    function tag(label,x,y,fill='#243c50',ink='#fff6db'){
      const w=label.length*6+14;rect(x-w/2,y,w,19,fill);text(label,x,y+13,10,ink,'center');
    }
    function icon(type,x,y){
      if(type==='book'){rect(x-14,y-10,28,21,'#f1d195');rect(x,y-9,2,19,'#7b624e');line(x-10,y-5,x-4,y-5,'#775f51',2);}
      if(type==='terminal'){rect(x-16,y-12,32,23,'#173044');rect(x-12,y-8,24,14,'#12231c');text('>_',x,y+3,10,'#8be7a0','center');}
      if(type==='map'){rect(x-13,y-12,26,24,'#c2d7a8');line(x-9,y+6,x+8,y-7,'#568d81',3);}
      if(type==='platform'){rect(x-16,y-5,32,10,'#619a9c');rect(x-8,y-12,8,8,'#f2d49b');rect(x+5,y-12,8,8,'#f2d49b');}
    }
    function drawScene(stop,time){
      const x=stop.x,p=progress(stop),on=states.get(stop.id).active,type=stop.event?.type;
      switch(type){
        case 'classroom': {
          const bx=stop.buildingX;
          for(let i=0;i<4;i++)rect(bx-61+i*28,G-76,14,18,p>(i+1)/5?'#ffe1a1':'#425d67');
          break;
        }
        case 'firstbuild': {
          // The first successful build travels between the two existing terminals.
          if(on){
            const t=reduced.matches?1:p;
            line(x-35,G-70,x+70,G-70,'#557d79',2);
            rect(x-35+105*t,G-74,8,8,'#a8d39b');
          }
          break;
        }
        case 'sharing': {
          // A small notebook moves from one workstation to the other, then rests.
          if(on){
            const t=p*p*(3-2*p),sx=x-20+t*110,sy=G-135-Math.sin(t*Math.PI)*24;
            icon('book',sx,sy);
          }
          break;
        }
        case 'hackathon': {
          const teams=Array.from({length:3},(_,i)=>{
            const phase=clamp((p-i*.12)/.72);
            return {x:x-150+i*150,target:x-70+i*70,phase,t:phase*phase*(3-2*phase),ink:['#6997ba','#ab83ae','#8ba667'][i]};
          });
          // Connections sit behind the workstations and the shared demo.
          for(const team of teams)line(team.x,G-133,team.target,G-174,on?'#568c80':'#b8b9ae',2);
          for(const team of teams){
            const sx=team.x;
            rect(sx-37,G-130,74,39,'#24435b');rect(sx-32,G-125,64,29,'#f6f4e9');
            rect(sx-43,G-90,86,5,'#24435b');
            for(let row=0;row<3;row++)rect(sx-25,G-118+row*7,18+row*10,3,team.ink);
          }
          rect(x-116,G-240,232,66,'#24435b');rect(x-110,G-234,220,54,'#f6f4e9');
          rect(x-104,G-228,208,5,'#d4dfd9');
          for(let i=0;i<teams.length;i++){
            const team=teams[i],reveal=clamp((team.phase-.7)/.3);
            rect(x-103+i*70,G-216,64,30,'#e4e8dc');
            rect(x-103+i*70,G-216,64*reveal,30,team.ink);
          }
          // Arriving work fades into its matching panel instead of vanishing behind it.
          for(const team of teams)if(on&&team.phase>0&&team.phase<1){
            const px=team.x+(team.target-team.x)*team.t,py=G-145-55*team.t;
            ctx.save();ctx.globalAlpha=1-clamp((team.phase-.7)/.3);
            rect(px-9,py-6,18,12,team.ink);ctx.restore();
          }
          break;
        }
        case 'map': {
          const start=stop.start+340,end=stop.end-80;
          const points=Array.from({length:7},(_,i)=>[start+(end-start)*i/6,G-14-(i%2)*13]);
          for(let i=1;i<points.length;i++){
            const [a,b]=[points[i-1],points[i]];
            line(a[0],a[1],b[0],b[1],on?'#3d8b7d':'#9bb5a6',on?4:2);
            if(on&&p>(i-1)/6){rect(b[0]-4,b[1]-4,8,8,'#f4d487');}
          }
          break;
        }
        case 'selfservice':
          break;
        case 'simplify': {
          // A device connected to online services: no physical server-rack metaphor.
          const device=x-200,cx=x+80,cy=G-193,settled=p*p*(3-2*p);
          const connection=mix('#af7b72','#388574',settled);
          const elbowX=x-100+49*settled,elbowY=G-113-30*settled;
          line(device+47,G-143,elbowX,elbowY,connection,3);
          line(elbowX,elbowY,x-51,cy+22,connection,3);
          line(x-51,cy+22,cx-116,cy+22,connection,3);
          const scattered=[[-55,G-146],[175,G-132],[55,G-161]];
          const services=scattered.map(([sx,top],i)=>({
            x:x+sx+(cx-98+i*98-x-sx)*settled,
            y:top+(G-128-top)*settled
          }));
          // Tangled cross-links straighten and fade as the coin restores order.
          ctx.save();ctx.globalAlpha=1-settled;
          for(let i=0;i<services.length;i++){
            const a=services[i],b=services[(i+1)%services.length];
            line(a.x,a.y+18,x-85+i*110,G-96-i*25,'#b2877b',2);
            line(x-85+i*110,G-96-i*25,b.x,b.y+18,'#b2877b',2);
          }
          ctx.restore();
          for(let i=0;i<services.length;i++){
            const {x:sx,y:top}=services[i];
            const bendX=sx+((i%2?55:-45)*(1-settled)),bendY=top-12-20*(1-settled);
            line(cx,cy+29,bendX,bendY,connection,2);
            line(bendX,bendY,sx,top,connection,2);
          }
          rect(device-46,G-172,92,60,'#24435b');rect(device-39,G-165,78,45,'#f1f7fa');
          rect(device-34,G-159,68,8,'#69a5c1');
          rect(device-32,G-144,26,17,'#b7d8ca');rect(device+1,G-144,29,4,'#638ba0');rect(device+1,G-135,23,4,'#638ba0');
          rect(device-53,G-111,106,7,'#24435b');
          text('YOUR DEVICE',device,G-88,11,'#24435b','center');
          // Overlapping lobes and a flat base make one readable cloud silhouette.
          ctx.fillStyle='#f8fcff';ctx.strokeStyle='#5588a7';ctx.lineWidth=3;
          ctx.beginPath();ctx.moveTo(cx-117,cy+28);
          ctx.bezierCurveTo(cx-157,cy+26,cx-155,cy-28,cx-111,cy-28);
          ctx.bezierCurveTo(cx-104,cy-76,cx-39,cy-82,cx-14,cy-49);
          ctx.bezierCurveTo(cx+23,cy-88,cx+88,cy-62,cx+87,cy-27);
          ctx.bezierCurveTo(cx+144,cy-34,cx+152,cy+28,cx+110,cy+28);
          ctx.closePath();ctx.fill();ctx.stroke();
          text('MICROSOFT',cx,cy-24,12,'#24435b','center');
          text('AZURE CLOUD',cx,cy-4,19,'#24435b','center');
          for(let i=0;i<services.length;i++){
            const {x:sx,y:top}=services[i];
            ctx.save();ctx.translate(sx,top+18);ctx.rotate([-.16,.13,-.1][i]*(1-settled));
            rect(-43,-18,86,36,'#24435b');rect(-40,-15,80,30,'#f8fcff');
            rect(-33,-7,7,7,connection);
            text(['APPS','DATA','SERVICES'][i],7,3,10,'#24435b','center');
            ctx.restore();
          }
          tag(settled===1?'SIMPLER · RELIABLE · COST-AWARE':on?'BRINGING THE CLOUD UNDER CONTROL':'TANGLED CONNECTIONS',x,G-82,'#244f6c');
          break;
        }
        case 'converge':
          // The existing skyline fills with working teams, one window at a time.
          for(let side=0;side<2;side++){
            const bx=x+(side?285:-355),top=G-(side?220:185);
            for(let row=0;row<4;row++)for(let col=0;col<2;col++){
              if(p>(row*2+col+1)/9)rect(bx+14+col*28,top+20+row*35,14,18,'#ffe2a0');
            }
          }
          break;
        case 'repositories':
          break;
        case 'governance':
          // Existing pipeline objects align too; a coherent path appears underneath.
          for(let i=0;i<7;i++)rect(x-220+i*70,G+9,48*(on?p:0),5,'#b9d19f');
          break;
        case 'leadership':
        case 'ecosystem':
          break;
        case 'personal':
          
          break;
        case 'finale': {
          const visited=world.sections.filter(s=>encountered.has(s.id)&&s!==stop);
          const callbacks=[['book','classroom'],['terminal','firstbuild'],['map','map'],['platform','selfservice']].filter(([,type])=>visited.some(s=>s.event?.type===type)).map(([icon])=>icon);
          for(let i=0;i<callbacks.length;i++){
            const sx=x-175+i*105;
            if(i)line(sx-80,G-135,sx-25,G-135,'#648c87',3);
            icon(callbacks[i],sx,G-135);
          }
          for(let i=0;i<7;i++)if(p>i/9)rect(x-220+i*65,G+2,57,9,'#c8af7e');
          tag('TOGETHER, WHAT NEXT?',x,G-190);
          break;
        }
      }
      // Main scenes keep only labels attached to meaningful objects. The cast metadata
      // is retained solely for the callback ending above.

    }
    function drawActors(stop){
      if(stop.event?.type!=='finale')return;
      const x=stop.x,visited=world.sections.filter(s=>encountered.has(s.id)&&s!==stop);
      const roles=visited.flatMap(s=>s.characters||[]).filter((c,i,all)=>all.findIndex(v=>v.name===c.name)===i);
      const recalled=['Teacher','Engineer','Software','Customer'].map(name=>roles.find(c=>c.name===name)).filter(Boolean);
      for(const c of roles)if(recalled.length<4&&!recalled.includes(c))recalled.push(c);
      for(let i=0;i<recalled.length;i++){
        const c=recalled[i],nx=x-160+i*100;
        person(nx,G-4,1,false,c.color||'#9cb9a7',i);tag(c.name,nx,G-72);
      }
    }
    return {states,encountered,update,collect,reset,progress,paletteAt,draw:drawScene,drawActors};
  }
  window.JourneyScenes={create,atmospheres};
})();
