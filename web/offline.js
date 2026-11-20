"use strict";
(function () {
  const $ = id => document.getElementById(id);
  const DB_NAME = "flco-offline-radio-v1";
  const STORE = "tracks";
  let dbPromise;
  let tracks = [];
  let activeIndex = -1;
  let offlineMode = false;
  let objectUrl = null;
  const player = $("player");
  const info = $("offline-info");

  function database() {
    if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB no disponible"));
    if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, {keyPath: "id", autoIncrement: true});
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }
  async function transaction(mode, action) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      const request = action(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.onerror = () => reject(tx.error);
    });
  }
  function connection() {
    $("connection-state").textContent = navigator.onLine ? "Con conexión" : "Sin conexión";
  }
  addEventListener("online", connection);
  addEventListener("offline", connection);
  connection();

  $("back-button").addEventListener("click", () => {
    if (history.length > 1) history.back();
    else { window.scrollTo({top: 0, behavior: "smooth"}); $("query").focus(); }
  });

  function revoke() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  async function refresh() {
    tracks = await transaction("readonly", store => store.getAll());
    const list = $("offline-stations");
    list.replaceChildren();
    if (!tracks.length) {
      list.textContent = "No hay canales guardados. Importa archivos de audio para crear tu radio sin Internet.";
      return;
    }
    tracks.forEach((track, index) => {
      const li = document.createElement("li");
      const tune = document.createElement("button");
      tune.type = "button";
      tune.className = "channel-number";
      tune.textContent = String(index + 1);
      tune.setAttribute("aria-label", "Sintonizar canal local " + (index + 1));
      tune.addEventListener("click", () => playLocal(index));
      const name = document.createElement("span");
      name.textContent = track.name;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Eliminar";
      remove.addEventListener("click", async () => {
        if (activeIndex === index && offlineMode) {
          player.pause();
          player.removeAttribute("src");
          player.load();
          revoke();
          activeIndex = -1;
        }
        try { await transaction("readwrite", store => store.delete(track.id)); await refresh(); info.textContent = "Canal eliminado."; }
        catch { info.textContent = "No se pudo eliminar el canal."; }
      });
      li.append(tune, name, remove);
      list.append(li);
    });
  }
  function playLocal(index) {
    if (!tracks.length) { info.textContent = "Primero guarda algún archivo de audio."; return; }
    activeIndex = (index + tracks.length) % tracks.length;
    const track = tracks[activeIndex];
    if (!track.blob) { info.textContent = "El archivo no está disponible."; return; }
    offlineMode = true;
    player.pause();
    revoke();
    objectUrl = URL.createObjectURL(track.blob);
    player.src = objectUrl;
    player.load();
    $("now-playing").textContent = track.name;
    $("station-details").textContent = "Canal local " + (activeIndex + 1) + " de " + tracks.length + " · Audio guardado en este navegador · Sin Internet";
    $("dial-number").textContent = "CANAL " + (activeIndex + 1);
    $("dial-mode").textContent = "Radio sin Internet";
    info.textContent = "Modo radio sin Internet · Usa Anterior y Siguiente para sintonizar.";
    player.play().catch(() => { info.textContent = "Canal preparado. Pulsa reproducir."; });
  }
  $("offline-file").addEventListener("change", async () => {
    const files = [...$("offline-file").files];
    let saved = 0;
    for (const file of files) {
      if (!file.type.startsWith("audio/")) continue;
      try {
        await transaction("readwrite", store => store.add({name: file.name, blob: file, added: Date.now()}));
        saved++;
      } catch {
        info.textContent = "Almacenamiento lleno o no disponible. Se guardaron " + saved + " archivos.";
        break;
      }
    }
    $("offline-file").value = "";
    try { await refresh(); if (saved) { info.textContent = saved + " archivo(s) guardado(s) para escuchar sin Internet."; if (activeIndex < 0) playLocal(tracks.length - saved); } }
    catch { info.textContent = "El navegador no permite guardar archivos sin conexión."; }
  });
  $("offline-mode").addEventListener("click", () => playLocal(activeIndex < 0 ? 0 : activeIndex));
  document.addEventListener("flco:station", () => { offlineMode = false; revoke(); });
  window.FLCOOffline = {
    active: () => offlineMode,
    step: delta => playLocal((activeIndex < 0 ? 0 : activeIndex + delta))
  };
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
  refresh().catch(() => { info.textContent = "El almacenamiento local no está disponible en este navegador."; });
})();
