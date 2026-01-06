// 你可以在這裡新增店家（之後要接 places.json 也可以）
const places = [
  { name: "阿宗麵線", lat: 25.044, lng: 121.507, note: "西門町" },
  { name: "永康牛肉麵", lat: 25.033, lng: 121.529, note: "大安區" },
  { name: "阜杭豆漿", lat: 25.0419, lng: 121.5250, note: "善導寺" }
];

// 建立地圖（預設中心：台北）
const map = L.map('map', { zoomControl: true }).setView([25.033, 121.5654], 12);

// 底圖（OpenStreetMap）
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

const listEl = document.getElementById("list");
const markers = [];

// 產生清單 + 標記
places.forEach((p) => {
  const marker = L.marker([p.lat, p.lng]).addTo(map).bindPopup(`<b>${p.name}</b><br>${p.note || ""}`);
  markers.push(marker);

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="name">${p.name}</div>
    <div class="meta">${p.note || ""}</div>
  `;

  // 點清單 -> 地圖飛過去 + 開 popup
  card.addEventListener("click", () => {
    map.setView([p.lat, p.lng], 16, { animate: true });
    marker.openPopup();
  });

  listEl.appendChild(card);
});

// 讓地圖一開始能看到全部點
if (places.length >= 2) {
  const group = L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.2));
} else if (places.length === 1) {
  map.setView([places[0].lat, places[0].lng], 16);
}

