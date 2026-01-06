// 🗺️ 建立地圖（預設中心：台北）
const map = L.map('map').setView([25.033, 121.5654], 12);

// 底圖
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// 📍 嘗試使用自訂 marker icon（marker.png 不存在也不會壞）
let markerOptions = {};
markerOptions.icon = L.icon({
  iconUrl: 'marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const list = document.getElementById("list");
const markers = [];

// 🔹 從 places.json 讀資料
fetch('places.json')
  .then(res => res.json())
  .then(places => {
    places.forEach(p => {
      // 地圖標記
      const marker = L.marker([p.lat, p.lng], markerOptions)
        .addTo(map)
        .bindPopup(p.name);

      markers.push(marker);

      // 右側清單
      const div = document.createElement("div");
      div.className = "item";
      div.textContent = p.name;

      div.onclick = () => {
        map.setView([p.lat, p.lng], 16);
        marker.openPopup();
      };

      list.appendChild(div);
    });

    // 自動縮放到所有店家
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  })
  .catch(err => {
    console.error("讀取 places.json 失敗", err);
  });
;
