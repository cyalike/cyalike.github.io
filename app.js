const state = {
  places: [],
  markers: new Map(),
  currentTag: "",
  query: ""
};

const $ = (sel) => document.querySelector(sel);

function normalize(s) {
  return (s || "").toString().toLowerCase().trim();
}

function matches(place, q, tag) {
  const text = normalize(q);
  const tagOk = !tag || (place.tags || []).includes(tag);

  if (!text) return tagOk;

  const hay = [
    place.name,
    place.address,
    (place.tags || []).join(" "),
    place.notes
  ].map(normalize).join(" ");

  return tagOk && hay.includes(text);
}

function renderTagOptions(places) {
  const tags = new Set();
  places.forEach(p => (p.tags || []).forEach(t => tags.add(t)));

  const select = $("#tagFilter");
  const current = select.value;
  select.innerHTML = `<option value="">所有標籤</option>` +
    [...tags].sort((a,b)=>a.localeCompare(b, "zh-Hant")).map(t => `<option value="${t}">${t}</option>`).join("");

  select.value = current || "";
}

function placeCard(place) {
  const tags = (place.tags || []).map(t => `<span class="tag">${t}</span>`).join("");
  const rating = (place.rating != null) ? `⭐ ${place.rating}` : "";
  const visited = place.dateVisited ? `📅 ${place.dateVisited}` : "";
  const addr = place.address ? `📍 ${place.address}` : "";

  return `
    <div class="card" data-id="${place.id}">
      <h3>${place.name}</h3>
      <div class="meta">${[rating, visited].filter(Boolean).join(" ・ ")}</div>
      <div class="meta">${addr}</div>
      ${place.notes ? `<div class="meta">📝 ${place.notes}</div>` : ""}
      <div class="tags">${tags}</div>
    </div>
  `;
}

function popupHtml(place) {
  const tags = (place.tags || []).map(t => `<span class="tag">${t}</span>`).join("");
  const link = place.link ? `<div style="margin-top:8px"><a target="_blank" rel="noreferrer" href="${place.link}">開啟連結</a></div>` : "";
  const rating = (place.rating != null) ? `⭐ ${place.rating}` : "";
  const visited = place.dateVisited ? `📅 ${place.dateVisited}` : "";
  const addr = place.address ? `📍 ${place.address}` : "";

  return `
    <div style="min-width:220px">
      <div style="font-weight:700;font-size:16px;margin-bottom:6px">${place.name}</div>
      <div style="font-size:12px;opacity:.85">${[rating, visited].filter(Boolean).join(" ・ ")}</div>
      <div style="font-size:12px;opacity:.85;margin-top:4px">${addr}</div>
      ${place.notes ? `<div style="font-size:12px;opacity:.9;margin-top:6px">📝 ${place.notes}</div>` : ""}
      <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">${tags}</div>
      ${link}
    </div>
  `;
}

function filteredPlaces() {
  return state.places.filter(p => matches(p, state.query, state.currentTag));
}

function syncListAndMarkers(map) {
  const list = $("#list");
  const shown = filteredPlaces();

  $("#count").textContent = `${shown.length} / ${state.places.length}`;

  list.innerHTML = shown.map(placeCard).join("");

  // markers: show/hide
  for (const p of state.places) {
    const m = state.markers.get(p.id);
    if (!m) continue;
    const shouldShow = shown.some(x => x.id === p.id);
    if (shouldShow) {
      if (!map.hasLayer(m)) m.addTo(map);
    } else {
      if (map.hasLayer(m)) map.removeLayer(m);
    }
  }

  // click card -> fly to marker
  list.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const place = state.places.find(p => p.id === id);
      const marker = state.markers.get(id);
      if (!place || !marker) return;
      map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 16), { duration: 0.8 });
      marker.openPopup();
    });
  });
}

async function main() {
  const res = await fetch("places.json", { cache: "no-store" });
  const places = await res.json();

  // basic validation
  state.places = places
    .filter(p => p && p.id && p.name && typeof p.lat === "number" && typeof p.lng === "number")
    .map(p => ({ ...p, tags: Array.isArray(p.tags) ? p.tags : [] }));

  renderTagOptions(state.places);

  const defaultCenter = state.places.length
    ? [state.places[0].lat, state.places[0].lng]
    : [25.0339, 121.5645]; // fallback

  const map = L.map("map", { zoomControl: true }).setView(defaultCenter, 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // add markers
  for (const p of state.places) {
    const m = L.marker([p.lat, p.lng]).bindPopup(popupHtml(p));
    state.markers.set(p.id, m);
    m.addTo(map);
  }

  // fit bounds
  if (state.places.length >= 2) {
    const bounds = L.latLngBounds(state.places.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.2));
  }

  // search + tag filter
  $("#search").addEventListener("input", (e) => {
    state.query = e.target.value;
    syncListAndMarkers(map);
  });

  $("#tagFilter").addEventListener("change", (e) => {
    state.currentTag = e.target.value;
    syncListAndMarkers(map);
  });

  syncListAndMarkers(map);
}

main().catch(err => {
  console.error(err);
  alert("讀取 places.json 失敗：請檢查檔案格式或 GitHub Pages 是否已部署完成。");
});
