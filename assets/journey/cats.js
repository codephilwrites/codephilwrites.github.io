/* A coin-triggered cat greeting. Movement is never locked for the animation. */
(() => {
  'use strict';
  function create(world,reduced){
    const park=world.coins.find(c=>c.action==='meetCats')?.stop||world.sections.find(s=>s.kind==='park');
    const homes=park?[park.x-44,park.x+65]:[];
    const animals=homes.map((home,i)=>({name:i?'Matilda':'Maggie',black:!!i,home,x:home,facing:i?-1:1,running:false,side:null}));
    let called=false,petting=false,playing=false,facing=1,clock=0;
    function summon(){if(park)called=true;}
    function reset(){called=false;petting=false;playing=false;clock=0;for(const cat of animals){cat.x=cat.home;cat.running=false;cat.side=null;}}
    function update(player,dt,companion=null){
      if(!park)return;
      if(!reduced.matches)clock+=dt;
      const inPark=player.x>=park.start+20&&player.x<=park.end-20;
      playing=!!(companion&&!inPark);
      for(let i=0;i<animals.length;i++){
        const cat=animals[i];
        if(called&&inPark&&cat.side===null)cat.side=cat.x<player.x?-1:1;
        if(!inPark)cat.side=null;
        const target=playing
          ?Math.max(park.start+15,Math.min(park.end-15,companion.x+42+i*47+(reduced.matches?0:Math.sin(clock*2+i*2)*6)))
          :called&&inPark
          ?Math.max(park.start+15,Math.min(park.end-15,player.x+cat.side*(35+i*29)))
          :called?cat.home:cat.home+(reduced.matches?0:Math.sin(clock*.55+i*2)*14);
        const delta=target-cat.x,speed=playing?125:called&&inPark?170+i*12:35;
        cat.x+=Math.sign(delta)*Math.min(Math.abs(delta),speed*dt);
        cat.running=(playing||called&&inPark)&&Math.abs(delta)>(playing?.15:3);
        if(Math.abs(delta)>1)cat.facing=delta>0?1:-1;
        else if(playing)cat.facing=companion.x+65>=cat.x?1:-1;
        else if(called&&inPark)cat.facing=player.x>=cat.x?1:-1;
      }
      const close=animals.find(cat=>!cat.running&&Math.abs(cat.x-player.x)>=18&&Math.abs(cat.x-player.x)<=68);
      petting=!!(called&&inPark&&close&&player.grounded&&Math.abs(player.y-world.ground)<1&&!player.moving&&!player.climbing);
      if(petting)facing=close.x>=player.x?1:-1;
    }
    return {animals,summon,reset,update,get called(){return called;},get petting(){return petting;},get playing(){return playing;},get facing(){return facing;}};
  }
  window.JourneyCats={create};
})();
