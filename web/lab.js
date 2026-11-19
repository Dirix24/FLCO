"use strict";
(function () {
  const $ = id => document.getElementById(id);
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
