"use strict";
(function(){
 const $=id=>document.getElementById(id);
 const bars=[...document.querySelectorAll(".dial-bars i")];
 let currentColor=196;
 document.addEventListener("flco:station",event=>{
   const {index,name,url}=event.detail;
   const identifier=[...url].reduce((h,ch)=>(h*31+ch.charCodeAt(0))>>>0,7);
   currentColor=190+(identifier%56);
   const dial=$("radio-dial");
   dial.style.setProperty("--dial-hue",String(currentColor));
   $("dial-number").textContent=index>=0?"CANAL "+(index+1):"RADIO";
   $("dial-mode").textContent=name||"Escuchando";
   bars.forEach((bar,i)=>{
     const height=16+((identifier>>>(i%24))+(i*17))%65;
     bar.style.height=height+"%";
     bar.style.animationDelay=(i*.07)+"s";
   });
   dial.classList.add("is-playing");
 });
 $("player").addEventListener("pause",()=>$("radio-dial").classList.remove("is-playing"));
 $("player").addEventListener("play",()=>$("radio-dial").classList.add("is-playing"));
 $("prev-station").addEventListener("click",()=>window.FLCOFM?.active()?window.FLCOFM.step(-1):window.FLCOOffline?.active()?window.FLCOOffline.step(-1):window.FLCOStations?.step(-1));
 $("next-station").addEventListener("click",()=>window.FLCOFM?.active()?window.FLCOFM.step(1):window.FLCOOffline?.active()?window.FLCOOffline.step(1):window.FLCOStations?.step(1));
})();
