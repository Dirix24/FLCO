"use strict";
(function () {
  const $ = id => document.getElementById(id);
  const player = $("player");
  const freq = $("fm-frequency");
  const state = $("fm-status");
  const tune = $("fm-tune");
  const stop = $("fm-stop");
  const available = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  let fmActive = false;

  function setFrequency(value) {
    const rounded = Math.round(Number(value) * 10) / 10;
    if (!Number.isFinite(rounded) || rounded < 87.5 || rounded > 108) return null;
    freq.value = rounded.toFixed(1);
    $("fm-frequency-label").textContent = rounded.toFixed(1) + " MHz";
    return rounded;
  }
  freq.addEventListener("input", () => setFrequency(freq.value));
  $("fm-down").addEventListener("click", () => setFrequency(Math.max(87.5, Number(freq.value) - 0.1)));
  $("fm-up").addEventListener("click", () => setFrequency(Math.min(108, Number(freq.value) + 0.1)));

  async function check() {
    if (!available) {
      state.textContent = "La recepción FM necesita ejecutar fm_server.py en el mismo equipo que el receptor RTL-SDR. GitHub Pages no puede controlar antenas directamente.";
      tune.disabled = true;
      return;
    }
    try {
      const response = await fetch("/api/fm/status", {cache: "no-store"});
      if (!response.ok) throw new Error();
      const data = await response.json();
      tune.disabled = !data.available;
      state.textContent = data.available
        ? "Servidor FM preparado. Conecta RTL-SDR y antena, elige frecuencia y pulsa Sintonizar."
        : "Faltan rtl_fm o ffmpeg. Instálalos y conecta el receptor RTL-SDR.";
    } catch {
      tune.disabled = true;
      state.textContent = "Inicia FLCO con python3 fm_server.py, no con http.server.";
    }
  }
  tune.addEventListener("click", () => {
    const value = setFrequency(freq.value);
    if (value === null) return;
    player.pause();
    player.src = "/api/fm/stream?freq=" + encodeURIComponent(value.toFixed(1));
    player.load();
    fmActive = true;
    $("now-playing").textContent = "FM " + value.toFixed(1) + " MHz";
    $("station-details").textContent = "Recepción local RTL-SDR · Sin Internet · La calidad depende de la antena y la señal.";
    $("dial-number").textContent = value.toFixed(1) + " MHz";
    $("dial-mode").textContent = "FM por antena";
    state.textContent = "Sintonizando FM " + value.toFixed(1) + " MHz…";
    player.play().catch(() => { state.textContent = "No se pudo reproducir. Comprueba el RTL-SDR, los permisos y el formato MP3 de ffmpeg."; });
  });
  stop.addEventListener("click", () => {
    player.pause();
    player.removeAttribute("src");
    player.load();
    fmActive = false;
    state.textContent = "Recepción FM detenida.";
  });
  document.addEventListener("flco:station", () => { fmActive = false; });
  $("offline-mode").addEventListener("click", () => { fmActive = false; });
  window.FLCOFM = {active: () => fmActive, step: delta => {
    const value = setFrequency(Math.max(87.5, Math.min(108, Number(freq.value) + delta * 0.1)));
    if (value !== null) tune.click();
  }};
  check();
})();
