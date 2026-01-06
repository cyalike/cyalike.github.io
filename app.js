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

  if (places.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "這家還沒被我吃到 🤍";
    listEl.appendChild(empty);
    return;
  }

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

  const group = L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.2));
}

searchEl.addEventListener("input", () => {
  const q = searchEl.value.trim().toLowerCase();

  const filtered = allPlaces.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.address || "").toLowerCase().includes(q) ||
    (p.tags || []).some(t => t.toLowerCase().includes(q))
  );

  renderList(filtered);
});
