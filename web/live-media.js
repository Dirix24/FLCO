"use strict";
// Visualización de muestras de audio reproducido, nunca de potencia de radiofrecuencia.
(function () {
  const $ = id => document.getElementById(id);
  const player = $("player");
  const wave = $("live-wave"), spectrum = $("live-spectrum");
  let context, analyser, source, animation, active = false;
  const timeData = new Uint8Array(2048), freqData = new Uint8Array(1024);
  function draw() {
    if (!active || !analyser) return;
    analyser.getByteTimeDomainData(timeData);
    analyser.getByteFrequencyData(freqData);
    const w = wave.getContext("2d"), s = spectrum.getContext("2d");
    for (const [ctx, canvas] of [[w,wave],[s,spectrum]]) {
      ctx.fillStyle = "#0e192b"; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle = "#41516b";ctx.beginPath();ctx.moveTo(0,canvas.height/2);ctx.lineTo(canvas.width,canvas.height/2);ctx.stroke();
    }
    w.beginPath();w.strokeStyle="#55b9e6";w.lineWidth=2;
    timeData.forEach((v,i)=>{const x=i/(timeData.length-1)*wave.width,y=(1-v/255)*wave.height;if(!i)w.moveTo(x,y);else w.lineTo(x,y);});w.stroke();
    const bins = Math.min(256,freqData.length), width=spectrum.width/bins;
    s.fillStyle="#55b9e6";
    for(let i=0;i<bins;i++) {const h=freqData[i]/255*spectrum.height;s.fillRect(i*width,spectrum.height-h,Math.max(1,width-1),h);}
    const rms=Math.sqrt(timeData.reduce((sum,v)=>sum+Math.pow((v-128)/128,2),0)/timeData.length);
    $("live-info").textContent = `Audio del reproductor: ${player.paused?"en pausa":"reproduciendo"} · nivel digital relativo ${(rms*100).toFixed(1)}% · espectro de frecuencias de audio (no RF). Si aparece plano, el flujo puede bloquear el acceso a muestras por seguridad del navegador.`;
    animation=requestAnimationFrame(draw);
  }
  $("start-visualizer").addEventListener("click", async () => {
    if (active) return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if (!AC || typeof player.captureStream !== "function") {
      $("live-info").textContent="La radio puede seguir escuchándose. El navegador no permite obtener muestras para dibujar ondas reales; se muestran los datos disponibles de la emisora.";
      return;
    }
    try {
      if (!context) context=new AC();
      await context.resume();
      if (!analyser) {
        const stream=player.captureStream();
        source=context.createMediaStreamSource(stream);
        analyser=context.createAnalyser();
        analyser.fftSize=2048;
        analyser.smoothingTimeConstant=.75;
        source.connect(analyser);
      }
      active=true;
      draw();
    } catch (_) {
      $("live-info").textContent="La radio puede seguir escuchándose. Este flujo no permite leer sus muestras de audio; no se dibujarán ondas inventadas. Consulta los datos de la emisora.";
    }
  });
  $("stop-visualizer").addEventListener("click", () => {
    active=false;cancelAnimationFrame(animation);
    $("live-info").textContent="Gráfico detenido; la radio puede continuar sonando.";
  });
  // Accesos directos reutilizan el buscador único, sin un segundo sistema de búsqueda.
  const shortcuts={news:"noticias",sports:"deportes",music:"música",all:"España"};
  document.querySelectorAll("[data-browse]").forEach(button=>button.addEventListener("click",()=>{
    $("query").value=shortcuts[button.dataset.browse];
    $("search-form").requestSubmit();
  }));

  // Wikimedia Commons: solo metadatos y archivos públicos. No atribuir licencias no comprobadas.
  $("media-search").addEventListener("submit", async event=>{
    event.preventDefault();
    const query=$("media-query").value.trim();
    if(!query) return;
    const target=$("media-results");
    target.replaceChildren();
    $("media-status").textContent="Buscando imágenes y vídeos públicos...";
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),12000);
    try {
      const url=new URL("https://commons.wikimedia.org/w/api.php");
      for(const [k,v] of Object.entries({action:"query",generator:"search",gsrsearch:query,gsrnamespace:"6",gsrlimit:"20",prop:"imageinfo",iiprop:"url|mime|extmetadata",iiurlwidth:"360",format:"json",origin:"*"}))url.searchParams.set(k,v);
      const response=await fetch(url,{signal:controller.signal});
      if(!response.ok)throw new Error("HTTP");
      const data=await response.json();
      const pages=Object.values(data.query?.pages||{});
      let count=0;
      for(const page of pages) {
        const info=page.imageinfo?.[0];
        if(!info || !/^image\/(png|jpeg|gif|webp)$|^video\/(webm|ogg|mp4)$/.test(info.mime||""))continue;
        const card=document.createElement("article");card.className="media-card";
        const title=document.createElement("p");title.textContent=page.title.replace(/^File:/,"");
        const link=document.createElement("a");link.href=info.descriptionurl||"https://commons.wikimedia.org";link.target="_blank";link.rel="noopener noreferrer";link.textContent="Ver archivo, fuente y licencia";
        if(info.mime.startsWith("image/")) {
          const img=document.createElement("img");img.src=info.thumburl||info.url;img.alt=title.textContent;img.loading="lazy";card.append(img);
        } else {
          const video=document.createElement("video");video.controls=true;video.preload="none";video.src=info.url;video.setAttribute("aria-label",title.textContent);card.append(video);
        }
        card.append(title,link);target.append(card);count++;
      }
      $("media-status").textContent=count?`${count} archivos multimedia encontrados en Wikimedia Commons. No son emisiones de TV en directo.`:"No se encontraron imágenes o vídeos compatibles. Prueba otra búsqueda.";
    } catch(_) {
      $("media-status").textContent="No se pudo consultar Wikimedia Commons. Comprueba la conexión.";
    } finally {clearTimeout(timer);}
  });
})();
