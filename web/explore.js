"use strict";
(function(){
 const button=document.getElementById("nearby-stations");
 const info=document.getElementById("nearby-info");
 if(!button||!info)return;
 button.addEventListener("click",()=>{
   if(!navigator.geolocation){info.textContent="Este navegador no admite ubicación.";return;}
   if(!window.isSecureContext){info.textContent="Para usar ubicación abre FLCO en HTTPS o localhost. La ubicación no funciona normalmente desde una IP HTTP.";return;}
   button.disabled=true;
   info.textContent="Solicitando permiso para localizar emisoras de tu país...";
   navigator.geolocation.getCurrentPosition(async position=>{
     const controller=new AbortController();
     const timer=setTimeout(()=>controller.abort(),15000);
     try{
       // Se envían coordenadas solo tras pulsar el botón y conceder permiso.
       const reverse=new URL("https://nominatim.openstreetmap.org/reverse");
       reverse.searchParams.set("lat",String(position.coords.latitude));
       reverse.searchParams.set("lon",String(position.coords.longitude));
       reverse.searchParams.set("format","jsonv2");
       reverse.searchParams.set("zoom","3");
       reverse.searchParams.set("addressdetails","1");
       const geoResponse=await fetch(reverse,{signal:controller.signal,headers:{Accept:"application/json"}});
       if(!geoResponse.ok)throw new Error("geocoding");
       const location=await geoResponse.json();
       const countryCode=String(location.address?.country_code||"").toUpperCase();
       if(!/^[A-Z]{2}$/.test(countryCode))throw new Error("country");
       window.FLCOStartCountrySearch(countryCode);
       info.textContent="Mostrando emisoras del país detectado ("+countryCode+"). Puedes pulsar «Cargar más radios». La cercanía no garantiza mejor calidad de audio. Datos de ubicación: © OpenStreetMap contributors.";
     }catch(_){info.textContent="No se pudo buscar por ubicación. Puedes buscar por país manualmente.";}
     finally{clearTimeout(timer);button.disabled=false;}
   },error=>{
     info.textContent=error.code===1?"Permiso de ubicación denegado. Puedes buscar por país manualmente.":"No se pudo obtener la ubicación. Comprueba los permisos.";
     button.disabled=false;
   },{enableHighAccuracy:false,timeout:12000,maximumAge:600000});
 });
})();
