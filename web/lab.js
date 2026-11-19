"use strict";
// Laboratorio educativo: solo genera datos en memoria; no transmite radiofrecuencia.
(function () {
  const $ = id => document.getElementById(id);
  const canvas = $("signal-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  function generate(type, hz, count = 760, sampleRate = 16000) {
    const result = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const t = i / sampleRate;
      const carrier = Math.sin(2 * Math.PI * hz * t);
      if (type === "square") result[i] = carrier >= 0 ? 1 : -1;
      else if (type === "am") result[i] = (0.65 + 0.35 * Math.sin(2 * Math.PI * 8 * t)) * carrier;
      else if (type === "noise") result[i] = Math.random() * 2 - 1;
      else result[i] = carrier;
    }
    return result;
  }
  function draw(samples) {
    const width = canvas.width, height = canvas.height;
    ctx.fillStyle = "#0e192b";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#41516b";
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.strokeStyle = "#55b9e6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    samples.forEach((value, i) => {
      const x = i * width / (samples.length - 1);
      const y = height / 2 - value * height * 0.42;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
  $("generate-signal").addEventListener("click", () => {
    const hz = Number($("signal-frequency").value);
    if (!Number.isFinite(hz) || hz < 10 || hz > 2000) {
      $("signal-info").textContent = "Introduce una frecuencia entre 10 y 2000 Hz.";
      return;
    }
    const type = $("waveform").value;
    if (!["sine", "square", "am", "noise"].includes(type)) return;
    draw(generate(type, hz));
    $("signal-info").textContent = `Señal ${type} de prueba: ${hz} Hz; 760 muestras sintéticas a 16 kHz. No se transmite RF.`;
  });
  $("test-latency").addEventListener("click", async () => {
    const button = $("test-latency");
    button.disabled = true;
    $("latency-info").textContent = "Midiendo...";
    const times = [];
    try {
      for (let i = 0; i < 3; i++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const start = performance.now();
        try {
          const url = new URL("index.html", window.location.href);
          url.searchParams.set("_flco_test", String(Date.now()) + "_" + i);
          const response = await fetch(url, {cache: "no-store", signal: controller.signal});
          if (!response.ok) throw new Error("HTTP " + response.status);
          await response.arrayBuffer();
          times.push(performance.now() - start);
        } finally { clearTimeout(timeout); }
      }
      const mean = times.reduce((a, b) => a + b, 0) / times.length;
      $("latency-info").textContent = `Respuesta HTTP media: ${mean.toFixed(1)} ms (3 peticiones). Servidor: ${window.location.host}. No equivale a velocidad de Internet.`;
    } catch {
      $("latency-info").textContent = "No se pudo medir la respuesta del servidor.";
    } finally { button.disabled = false; }
  });
})();
