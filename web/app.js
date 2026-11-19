"use strict";
const DIRECTORY = "https://de1.api.radio-browser.info/json/stations/search";
const KEY = "flco:favorites:v1";
const $ = (id) => document.getElementById(id);
const status = (message) => { $("status").textContent = message; };
const clean = (value) => String(value || "").trim();
function safeStream(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.href : null;
  } catch { return null; }
}
function loadFavorites() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.filter(s => s && safeStream(s.url)).slice(0, 100) : [];
  } catch { return []; }
}
let favorites = loadFavorites();
function saveFavorites() {
  try { localStorage.setItem(KEY, JSON.stringify(favorites)); }
  catch { status("No se pudieron guardar los favoritos en este navegador."); }
}
function play(station) {
  const url = safeStream(station.url);
  if (!url) { status("Se necesita un enlace de audio HTTPS válido."); return; }
  $("now-playing").textContent = clean(station.name) || "Emisora";
  const player = $("player");
  player.pause();
  player.src = url;
  player.load();
  player.play().catch(() => status("Pulsa reproducir en el control de audio. Comprueba que el formato sea compatible."));
}
function stationRow(station, target, favoriteMode = false) {
  const li = document.createElement("li");
  const name = document.createElement("span");
  name.textContent = clean(station.name) || "Emisora sin nombre";
  li.append(name);
  const actions = document.createElement("div");
  actions.className = "actions";
  const listen = document.createElement("button");
  listen.type = "button";
  listen.textContent = "Escuchar";
  listen.addEventListener("click", () => play(station));
  actions.append(listen);
  const favorite = document.createElement("button");
  favorite.type = "button";
  favorite.textContent = favoriteMode ? "Quitar" : "☆ Guardar";
  favorite.addEventListener("click", () => {
    if (favoriteMode) favorites = favorites.filter(s => s.url !== station.url);
    else if (!favorites.some(s => s.url === station.url)) favorites.push(station);
    favorites = favorites.slice(-100);
    saveFavorites();
    renderFavorites();
  });
  actions.append(favorite);
  li.append(actions);
  target.append(li);
}
function renderFavorites() {
  const target = $("favorites");
  target.replaceChildren();
  if (!favorites.length) target.textContent = "Aún no hay favoritos.";
  favorites.forEach(station => stationRow(station, target, true));
}
let currentRequest;
$("search-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = clean($("query").value);
  if (!query) return;
  if (currentRequest) currentRequest.abort();
  currentRequest = new AbortController();
  const target = $("results");
  target.replaceChildren();
  status("Buscando emisoras...");
  try {
    const url = new URL(DIRECTORY);
    url.searchParams.set("name", query);
    url.searchParams.set("hidebroken", "true");
    url.searchParams.set("limit", "30");
    const response = await fetch(url, {signal: currentRequest.signal, headers: {"Accept": "application/json"}});
    if (!response.ok) throw new Error("Servicio no disponible");
    const stations = await response.json();
    if (!Array.isArray(stations)) throw new Error("Respuesta inesperada");
    const playable = stations.map(s => ({name: clean(s.name), url: safeStream(s.url_resolved || s.url)})).filter(s => s.url);
    playable.forEach(s => stationRow(s, target));
    status(playable.length ? `Encontradas ${playable.length} emisoras con URL HTTPS. La reproducción depende del formato.` : "No hay resultados compatibles; prueba otra búsqueda o añade una URL propia.");
  } catch (error) {
    if (error.name !== "AbortError") status("No se pudo consultar el directorio. Puedes introducir una URL de audio manualmente.");
  }
});
$("url-form").addEventListener("submit", event => {
  event.preventDefault();
  play({name: clean($("station-name").value), url: $("station-url").value});
});
$("player").addEventListener("error", () => status("No se puede reproducir este flujo. Puede estar caído o usar un formato no compatible."));
renderFavorites();
