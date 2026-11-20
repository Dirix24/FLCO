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
let stationList = [];
let activeStationIndex = -1;
function saveFavorites() {
  try { localStorage.setItem(KEY, JSON.stringify(favorites)); }
  catch { status("No se pudieron guardar los favoritos en este navegador."); }
}
function play(station) {
  const url = safeStream(station.url);
  if (!url) { status("Se necesita un enlace de audio HTTPS válido."); return; }
  $("now-playing").textContent = clean(station.name) || "Emisora";
  const index = stationList.findIndex(s => s.url === station.url);
  activeStationIndex = index;
  document.dispatchEvent(new CustomEvent("flco:station", {detail:{index, name:clean(station.name), url}}));
  const player = $("player");
  player.pause();
  player.src = url;
  player.load();
  const info = $("station-details");
  if (info) info.textContent = [clean(station.category) || "Categoría no confirmada",clean(station.country),clean(station.codec) ? "Códec: " + station.codec : "",station.bitrate ? "Bitrate declarado: " + station.bitrate + " kbps" : "" ].filter(Boolean).join(" · ") || "Emisora en línea.";
  player.play().catch(() => status("Pulsa reproducir en el control de audio. Comprueba que el formato sea compatible."));
}
function stationRow(station, target, favoriteMode = false, number = null) {
  const li = document.createElement("li");
  const name = document.createElement("span");
  name.textContent = clean(station.name) || "Emisora sin nombre";
  const details = document.createElement("div");
  details.className = "station-details";
  details.append(name);
  const metadata = [clean(station.category), clean(station.country)].filter(Boolean).join(" · ");
  if (metadata) { const small = document.createElement("small"); small.textContent = metadata; details.append(small); }
  if (number !== null) { const channel = document.createElement("button"); channel.type = "button"; channel.className = "channel-number"; channel.textContent = String(number); channel.setAttribute("aria-label", "Escuchar canal " + number + ": " + (station.name || "Emisora")); channel.addEventListener("click", () => play(station)); li.append(channel); }
  li.append(details);
  const actions = document.createElement("div");
  actions.className = "actions";
  const listen = document.createElement("button");
  listen.type = "button";
  listen.textContent = "Escuchar";
  listen.addEventListener("click", () => play(station));
  actions.append(listen);
  const favorite = document.createElement("button");
  favorite.type = "button";
  favorite.classList.add("favorite-star");
  favorite.dataset.stationUrl = station.url;
  function updateFavoriteState(button) {
    const saved = favorites.some(item => item.url === station.url);
    button.classList.toggle("is-favorite", saved);
    button.textContent = saved ? "★ Guardada" : "☆ Guardar";
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", saved ? "Quitar de favoritos" : "Guardar en favoritos");
  }
  updateFavoriteState(favorite);
  favorite.addEventListener("click", () => {
    const wasSaved = favorites.some(item => item.url === station.url);
    if (wasSaved) favorites = favorites.filter(item => item.url !== station.url);
    else favorites.push(station);
    favorites = favorites.slice(-100);
    saveFavorites();
    renderFavorites();
    document.querySelectorAll(".favorite-star").forEach(button => {
      const saved = favorites.some(item => item.url === button.dataset.stationUrl);
      button.classList.toggle("is-favorite", saved);
      button.textContent = saved ? "★ Guardada" : "☆ Guardar";
      button.setAttribute("aria-pressed", String(saved));
      button.setAttribute("aria-label", saved ? "Quitar de favoritos" : "Guardar en favoritos");
      if (!wasSaved && saved && button.dataset.stationUrl === station.url) {
        button.classList.remove("favorite-flash");
        void button.offsetWidth;
        button.classList.add("favorite-flash");
      }
    });
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
// Interpretación local y explícita de términos habituales; sin IA ni envío de ubicación.
const COUNTRIES = [
  ["españa", "Spain"], ["espana", "Spain"], ["spain", "Spain"],
  ["méxico", "Mexico"], ["mexico", "Mexico"], ["argentina", "Argentina"],
  ["colombia", "Colombia"], ["chile", "Chile"], ["perú", "Peru"],
  ["peru", "Peru"], ["venezuela", "Venezuela"], ["ecuador", "Ecuador"],
  ["uruguay", "Uruguay"], ["bolivia", "Bolivia"], ["paraguay", "Paraguay"],
  ["cuba", "Cuba"], ["estados unidos", "United States"], ["usa", "United States"],
  ["francia", "France"], ["portugal", "Portugal"], ["alemania", "Germany"]
];
const TOPICS = [
  {words: ["noticias", "noticia", "informativos", "informacion", "actualidad"], tags: ["news", "talk"] , label: "Noticias"},
  {words: ["deportes", "deporte", "futbol", "fútbol", "sports"], tags: ["sports", "sport"], label: "Deportes"},
  {words: ["musica", "música", "musical"], tags: ["music"], label: "Música"},
  {words: ["rock"], tags: ["rock"], label: "Rock"},
  {words: ["jazz"], tags: ["jazz"], label: "Jazz"},
  {words: ["clasica", "clásica"], tags: ["classical"], label: "Clásica"},
  {words: ["pop"], tags: ["pop"], label: "Pop"},
  {words: ["electronica", "electrónica"], tags: ["electronic"], label: "Electrónica"}
];
const normalize = s => clean(s).toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function interpretQuery(query) {
  let rest = normalize(query).replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  let country = "";
  const countryMatch = [...COUNTRIES].sort((a,b) => b[0].length-a[0].length)
    .find(([word]) => new RegExp("(^| )" + normalize(word) + "( |$)").test(rest));
  if (countryMatch) {
    country = countryMatch[1];
    rest = rest.replace(new RegExp("(^| )" + normalize(countryMatch[0]) + "(?= |$)"), " ").trim();
  }
  let topic = null;
  for (const entry of TOPICS) {
    const found = entry.words.find(word => new RegExp("(^| )" + normalize(word) + "( |$)").test(rest));
    if (found) {
      topic = entry;
      rest = rest.replace(new RegExp("(^| )" + normalize(found) + "(?= |$)"), " ").trim();
      break;
    }
  }
  rest = rest.replace(/^(de|del|en|la|el|las|los)\s+/, "").trim();
  return {country, topic, name: rest};
}
function category(station) {
  const tags = normalize(station.tags || "").split(",").map(s=>s.trim());
  if (tags.some(t => ["news","talk","noticias","informacion"].includes(t))) return "Noticias";
  if (tags.some(t => ["sports","sport","deportes","football"].includes(t))) return "Deportes";
  if (tags.some(t => ["music","musica","pop","rock","jazz","classical","electronic","dance"].includes(t))) return "Música";
  return "Sin categoría confirmada";
}
let currentRequest;
$("search-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = clean($("query").value);
  if (!query) return;
  if (currentRequest) currentRequest.abort();
  const request = new AbortController();
  currentRequest = request;
  const target = $("results");
  target.replaceChildren();
  status("Buscando emisoras...");
  const {country, topic, name} = interpretQuery(query);
  try {
    // Radio Browser permite filtrar por país y etiqueta; probamos etiquetas alternativas.
    const tags = topic ? topic.tags : [""];
    const unique = new Map();
    for (const tag of tags) {
      const url = new URL(DIRECTORY);
      if (country) url.searchParams.set("country", country);
      if (tag) url.searchParams.set("tag", tag);
      if (name) url.searchParams.set("name", name);
      url.searchParams.set("hidebroken", "true");
      url.searchParams.set("limit", "100");
      url.searchParams.set("order", "votes");
      url.searchParams.set("reverse", "true");
      const response = await fetch(url, {signal: request.signal, headers: {"Accept": "application/json"}});
      if (!response.ok) throw new Error("Servicio no disponible");
      const stations = await response.json();
      if (!Array.isArray(stations)) throw new Error("Respuesta inesperada");
      for (const s of stations) {
        const url = safeStream(s.url_resolved || s.url);
        if (!url) continue;
        const station = {name: clean(s.name), url, country: clean(s.country), tags: clean(s.tags), category: category(s), codec: clean(s.codec), bitrate: Number(s.bitrate) || 0};
        if (!unique.has(url)) unique.set(url, station);
      }
      if (unique.size >= 30) break;
    }
    if (request !== currentRequest) return;
    const playable = [...unique.values()].slice(0, 30);
    stationList = playable;
    activeStationIndex = -1;
    playable.forEach((s,i) => stationRow(s, target, false, i+1));
    const description = [topic?.label, country || null, name || null].filter(Boolean).join(" · ") || query;
    status(playable.length ? `${playable.length} emisoras para «${description}». Las categorías proceden de etiquetas del directorio y pueden ser inexactas.` : "No hay emisoras HTTPS para esta búsqueda. Prueba otro país, género o nombre.");
  } catch (error) {
    if (error.name !== "AbortError" && request === currentRequest) status("No se pudo consultar el directorio. Prueba de nuevo o introduce una URL propia.");
  }
});
$("url-form").addEventListener("submit", event => {
  event.preventDefault();
  play({name: clean($("station-name").value), url: $("station-url").value});
});
$("player").addEventListener("error", () => status("No se puede reproducir este flujo. Puede estar caído o usar un formato no compatible."));
renderFavorites();

window.FLCOStations = {step(delta) {if (!stationList.length) {status("Busca primero emisoras para cambiar de canal.");return;} const next=(activeStationIndex+delta+stationList.length)%stationList.length;play(stationList[next]);}, current(){return activeStationIndex;}};


/* Exploración mundial y radios online próximas: la ubicación nunca se pide automáticamente. */
function stationFromDirectory(entry) {
  const url = safeStream(entry.url_resolved || entry.url);
  if (!url) return null;
  return {name: clean(entry.name), url, country: clean(entry.country),
    tags: clean(entry.tags), category: category(entry), codec: clean(entry.codec),
    bitrate: Number(entry.bitrate) || 0};
}
function displayDirectory(rows, label) {
  const unique = new Map();
  for (const entry of rows) {
    const station = stationFromDirectory(entry);
    if (station && !unique.has(station.url)) unique.set(station.url, station);
  }
  stationList = [...unique.values()].slice(0, 60);
  activeStationIndex = -1;
  const target = $("results");
  target.replaceChildren();
  stationList.forEach((station, index) => stationRow(station, target, false, index + 1));
  status(stationList.length
    ? stationList.length + " emisoras online · " + label + ". No es recepción FM por antena."
    : "No se encontraron emisoras online HTTPS para " + label + ".");
}
async function exploreWorld() {
  if (currentRequest) currentRequest.abort();
  const request = new AbortController();
  currentRequest = request;
  status("Consultando emisoras de todo el mundo…");
  const country = clean($("world-country").value);
  const genre = $("world-genre").value;
  const url = new URL(DIRECTORY);
  if (country) url.searchParams.set("country", country);
  if (genre) url.searchParams.set("tag", genre);
  url.searchParams.set("hidebroken", "true");
  url.searchParams.set("limit", "100");
  url.searchParams.set("order", "votes");
  url.searchParams.set("reverse", "true");
  try {
    const response = await fetch(url, {signal: request.signal});
    if (!response.ok) throw new Error("Directorio no disponible");
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error("Respuesta inválida");
    if (request !== currentRequest) return;
    displayDirectory(rows, [country || "todos los países", genre || "todos los géneros"].join(" · "));
  } catch (error) {
    if (error.name !== "AbortError" && request === currentRequest)
      status("No se pudo cargar el directorio mundial. Comprueba la conexión.");
  }
}
$("world-radios").addEventListener("click", exploreWorld);
$("apply-world-filters").addEventListener("click", exploreWorld);

function distanceKm(lat1, lon1, lat2, lon2) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.min(1, Math.sqrt(a)));
}
$("nearby-radios").addEventListener("click", () => {
  if (!navigator.geolocation) {
    status("Este navegador no permite consultar la ubicación. Puedes buscar por país.");
    return;
  }
  status("Solicitando ubicación para buscar emisoras online próximas…");
  navigator.geolocation.getCurrentPosition(async position => {
    if (currentRequest) currentRequest.abort();
    const request = new AbortController();
    currentRequest = request;
    const lat = position.coords.latitude, lon = position.coords.longitude;
    const url = new URL(DIRECTORY);
    url.searchParams.set("geo_lat", String(lat));
    url.searchParams.set("geo_long", String(lon));
    url.searchParams.set("geo_distance", "150000");
    url.searchParams.set("hidebroken", "true");
    url.searchParams.set("limit", "500");
    try {
      status("Buscando radios online con ubicación publicada…");
      const response = await fetch(url, {signal: request.signal});
      if (!response.ok) throw new Error("Directorio no disponible");
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error("Respuesta inválida");
      if (request !== currentRequest) return;
      const nearby = rows.map(entry => {
        const latitude = Number(entry.geo_lat), longitude = Number(entry.geo_long);
        if (entry.geo_lat === null || entry.geo_long === null ||
            !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
        return {entry, distance: distanceKm(lat, lon, latitude, longitude)};
      }).filter(item => item && item.distance <= 150).sort((a,b) => a.distance - b.distance);
      displayDirectory(nearby.map(item => item.entry), "emisoras publicadas a menos de 150 km");
    } catch (error) {
      if (error.name !== "AbortError" && request === currentRequest)
        status("No se pudieron consultar radios cercanas. Prueba la búsqueda por país.");
    }
  }, error => {
    status(error.code === 1 ? "Ubicación denegada. Puedes buscar por país."
      : "No se pudo obtener la ubicación. Puedes buscar por país.");
  }, {enableHighAccuracy: false, timeout: 12000, maximumAge: 300000});
});
