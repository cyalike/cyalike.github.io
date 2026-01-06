// 建立地圖
const map = L.map('map').setView([25.033, 121.5654], 12);

// 底圖
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

const list = document.getElementById("list");
const markers = [];

// 從 places.json 讀資料
fetch('places.json')
  .then(res => res.json())
  .then(places => {
    places.forEach(p => {
      // 👉 用預設藍針
      const marker = L.marker([p.lat, p.lng])
        .addTo(map)
        .bindPopup(p.name);

      markers.push(marker);

      const div = document.createElement("div");
      div.className = "item";
      div.textContent = p.name;

      div.onclick = () => {
        map.setView([p.lat, p.lng], 16);
        marker.openPopup();
      };

      list.appendChild(div);
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  })
  .catch(err => {
    console.error("places.json 讀取失敗", err);
  });
