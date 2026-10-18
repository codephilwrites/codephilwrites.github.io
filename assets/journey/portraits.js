/* Local images become cached pixel portraits; originals are never modified. */
(() => {
  'use strict';
  const cache=new Map();
  function sourceURL(filename,base){
    if(typeof filename!=='string'||!filename||filename.startsWith('/')||filename.includes('\\')||filename.includes(':')||filename.split('/').some(p=>p==='..'||p==='.'||!p))throw new Error('Use a filename inside assets/journey/images/.');
    return base+'images/'+filename.split('/').map(encodeURIComponent).join('/');
  }
  // Six levels per RGB channel give at most 216 colours, plus transparency.
  function posterize(data){
    for(let i=0;i<data.length;i+=4){
      for(let channel=0;channel<3;channel++)data[i+channel]=Math.round(data[i+channel]/51)*51;
      data[i+3]=data[i+3]<128?0:255;
    }
    return data;
  }
  function load(filename,pixels,base){
    const key=base+filename+':'+pixels;
    if(cache.has(key))return cache.get(key);
    const task=new Promise((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>{
        try{
          const canvas=document.createElement('canvas');canvas.width=pixels;canvas.height=Math.round(pixels*.75);
          const context=canvas.getContext('2d',{willReadFrequently:true});
          context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
          const ratio=Math.min(canvas.width/image.naturalWidth,canvas.height/image.naturalHeight);
          const w=image.naturalWidth*ratio,h=image.naturalHeight*ratio;
          context.drawImage(image,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
          const bitmap=context.getImageData(0,0,canvas.width,canvas.height);posterize(bitmap.data);context.putImageData(bitmap,0,0);
          resolve({canvas});
        }catch(error){reject(error);}
      };
      image.onerror=()=>reject(new Error('Image could not be loaded.'));
      image.src=sourceURL(filename,base);
    }).catch(error=>({canvas:null,error:error.message}));
    cache.set(key,task);return task;
  }
  window.JourneyPortraits={sourceURL,posterize,load};
})();
