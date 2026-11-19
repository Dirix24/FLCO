"use strict";
(function(){
 const $=id=>document.getElementById(id);
 let fileUrl=null;
 const connection=$("connection-state");
 function updateConnection(){connection.textContent=navigator.onLine?"Con conexión":"Sin conexión";}
 addEventListener("online",updateConnection);addEventListener("offline",updateConnection);updateConnection();
 $("back-button").addEventListener("click",()=>{
   $("search-form").scrollIntoView({behavior:"smooth",block:"start"});
   $("query").focus({preventScroll:true});
 });
 $("offline-file").addEventListener("change",()=>{
   const file=$("offline-file").files?.[0];
   if(!file)return;
   if(!file.type.startsWith("audio/")){$("offline-info").textContent="Selecciona un archivo de audio.";return;}
   if(fileUrl)URL.revokeObjectURL(fileUrl);
   fileUrl=URL.createObjectURL(file);
   const player=$("player");player.pause();player.src=fileUrl;player.load();
   $("now-playing").textContent=file.name;
   $("station-details").textContent="Archivo local · "+(file.size/1024/1024).toFixed(1)+" MB · "+(file.type||"audio")+" · No usa Internet.";
   $("offline-info").textContent="Archivo local cargado. Pulsa reproducir; puedes escucharlo sin Internet.";
   player.play().catch(()=>{$("offline-info").textContent="Archivo cargado: pulsa reproducir en el control de audio.";});
 });
 if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost"||location.hostname==="127.0.0.1")){
   navigator.serviceWorker.register("./sw.js").catch(()=>{});
 }
})();
