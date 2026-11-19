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
      if (source) { try { source.disconnect(); } catch (_) {} source = null; analyser = null; }
      if (!analyser) {
        const stream=player.captureStream();
        if (!stream.getAudioTracks().length) throw new Error("No audio tracks available");
        source=context.createMediaStreamSource(stream);
        analyser=context.createAnalyser();
        analyser.fftSize=2048;
        analyser.smoothingTimeConstant=.75;
        source.connect(analyser);
      }
      active=true;
      draw();
    } catch (_) {
      $("live-info").textContent="No hay muestras de audio accesibles para dibujar. Prueba a pulsar reproducir primero y luego Ver ondas, o abre un archivo local. No se generan ondas falsas.";
    }
  });
  $("stop-visualizer").addEventListener("click", () => {
    active=false;cancelAnimationFrame(animation);
    if (source) {source.disconnect();source=null;analyser=null;}
    $("live-info").textContent="Gráfico detenido; la radio puede continuar sonando.";
  });
})();
