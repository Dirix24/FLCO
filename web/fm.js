"use strict";
(function () {
  const $ = id => document.getElementById(id);
  const player = $("player");
  const freq = $("fm-frequency");
  const state = $("fm-status");
  const tune = $("fm-tune");
  const stop = $("fm-stop");
  const demo = $("fm-demo");
  const local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  let mode = "none";
  let context = null;
  let oscillator = null;
  let gain = null;
  let realAvailable = false;

  function setFrequency(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    const rounded = Math.round(Math.max(87.5, Math.min(108, number)) * 10) / 10;
    freq.value = rounded.toFixed(1);
    $("fm-frequency-label").textContent = rounded.toFixed(1) + " MHz";
    return rounded;
  }
  function stopTone() {
    if (oscillator) { try { oscillator.stop(); } catch {} oscillator.disconnect(); oscillator = null; }
    if (gain) { gain.disconnect(); gain = null; }
    if (context) { context.close().catch(() => {}); context = null; }
  }
  function stopCurrent(resetPlayer = false) {
    const wasReal = mode === "real";
    stopTone();
    mode = "none";
    if (resetPlayer && wasReal) {
      player.pause();
      player.removeAttribute("src");
      player.load();
    }
  }
  function display(label) {
    const value = setFrequency(freq.value);
    $("now-playing").textContent = label + " · " + value.toFixed(1) + " MHz";
    $("dial-number").textContent = value.toFixed(1) + " MHz";
    $("dial-mode").textContent = label;
  }
  function startDemo() {
    stopCurrent(true);
    document.dispatchEvent(new Event("flco:fm-play"));
    // Señal acústica local: NO hay captura RF ni estaciones reales.
    player.pause();
    player.removeAttribute("src");
    player.load();
    try {
      const AudioContextType = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextType) throw new Error("Web Audio no disponible");
      context = new AudioContextType();
      oscillator = context.createOscillator();
      gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 300 + (setFrequency(freq.value) - 87.5) * 25;
      gain.gain.value = 0.07;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      context.resume().catch(() => {});
      mode = "demo";
      display("SIMULACIÓN (sin antena)");
      $("station-details").textContent = "Tono generado en este dispositivo · Sin Internet · No es una emisora FM ni una señal de radio captada.";
      state.textContent = "SIMULACIÓN ACTIVA: cambia la frecuencia para oír otro tono. No se ha verificado recepción real.";
    } catch {
      stopCurrent();
      state.textContent = "No se pudo iniciar la simulación de audio en este navegador.";
    }
  }
  function startReal() {
    if (!realAvailable) { state.textContent = "Receptor real no disponible. Puedes usar la simulación."; return; }
    stopCurrent(true);
    document.dispatchEvent(new Event("flco:fm-play"));
    const value = setFrequency(freq.value);
    player.pause();
    player.src = "/api/fm/stream?freq=" + encodeURIComponent(value.toFixed(1));
    player.load();
    mode = "real";
    display("FM por antena");
    $("station-details").textContent = "RTL-SDR USB local · Recepción FM sin Internet (experimental).";
    state.textContent = "Intentando recibir FM real en " + value.toFixed(1) + " MHz…";
    player.play().catch(() => { state.textContent = "No se pudo reproducir FM. Comprueba el receptor RTL-SDR y ffmpeg."; });
  }
  function step(delta) {
    setFrequency(Number(freq.value) + delta * 0.1);
    if (mode === "demo") startDemo();
    else if (mode === "real") startReal();
  }
  freq.addEventListener("input", () => {
    setFrequency(freq.value);
    if (mode === "demo" && oscillator) {
      oscillator.frequency.value = 300 + (Number(freq.value) - 87.5) * 25;
      display("SIMULACIÓN (sin antena)");
    }
  });
  $("fm-down").addEventListener("click", () => step(-1));
  $("fm-up").addEventListener("click", () => step(1));
  tune.addEventListener("click", startReal);
  demo.addEventListener("click", startDemo);
  stop.addEventListener("click", () => {
    stopCurrent(true);
    state.textContent = "Sintonizador detenido.";
  });
  document.addEventListener("flco:station", () => stopCurrent());
  document.addEventListener("flco:offline-play", () => stopCurrent());
  player.addEventListener("play", () => { if (mode === "demo") stopCurrent(); });
  window.FLCOFM = {active: () => mode !== "none", step};
  async function check() {
    if (!local) {
      state.textContent = "Puedes probar la SIMULACIÓN sin antena ni Internet. La recepción real necesita el servidor local y un RTL-SDR.";
      return;
    }
    try {
      const response = await fetch("/api/fm/status", {cache: "no-store"});
      if (!response.ok) throw new Error("Servidor FM no disponible");
      const data = await response.json();
      realAvailable = !!data.available;
      tune.disabled = !realAvailable;
      state.textContent = realAvailable
        ? "Herramientas FM instaladas (no confirma antena ni recepción). También puedes probar la simulación."
        : "Sin receptor confirmado: prueba la simulación. Para FM real instala rtl_fm y ffmpeg.";
    } catch {
      state.textContent = "Modo simulación disponible. Para FM real inicia python3 fm_server.py.";
    }
  }
  check();
})();
