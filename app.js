const map = L.map('map').setView([23.7, 121], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

const listEl = document.getElementById("list");
const searchEl = document.getElementById("search");

let allPlaces = [];
let markers = [];

fetch('places.json')
  .then(res => res.json())
  .then(places => {
    allPlaces = places;
    renderList(places);
  });

function renderList(places) {
  listEl.innerHTML = "";
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  places.forEach(p => {
    const marker = L.marker([p.lat, p.lng])
      .addTo(map)
      .bindPopup(`<strong>${p.name}</strong><br>${p.address || ""}`);

    markers.push(marker);

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <div class="name">${p.name}</div>
      <div class="tags">
        ${(p.tags || []).map(t => `#${t}`).join(" ")}
      </div>
      <div class="address">${p.address || ""}</div>
    `;

    div.onclick = () => {
      map.setView([p.lat, p.lng], 16);
      marker.openPopup();
    };

    listEl.appendChild(div);
  });

  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.2));
  }
}

/* 🔍 搜尋功能 */
searchEl.addEventListener("input", () => {
  const q = searchEl.value.trim().toLowerCase();

  const filtered = allPlaces.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.address || "").toLowerCase().includes(q) ||
    (p.tags || []).some(t => t.toLowerCase().includes(q))
  );

  renderList(filtered);
});

