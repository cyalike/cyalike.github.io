// 建立地圖（台灣視角，避免只看到北部）
const map = L.map('map').setView([23.7, 121], 7);

// 底圖
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

const list = document.getElementById("list");
const markers = [];

// 讀 places.json
fetch('places.json')
  .then(res => res.json())
  .then(places => {
    places.forEach(p => {
      // 📍 地圖標記（藍針）
      const marker = L.marker([p.lat, p.lng])
        .addTo(map)
        .bindPopup(`
          <strong>${p.name}</strong><br>
          ${p.address || ""}
        `);

      markers.push(marker);

      // 📋 右側清單卡片
      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        <strong>${p.name}</strong><br>
        <small>${p.address || ""}</small><br>
        ${p.tags ? `<small>🏷 ${p.tags.join("、")}</small>` : ""}
      `;

      // 點清單 → 地圖跳過去
      div.onclick = () => {
        map.setView([p.lat, p.lng], 16);
        marker.openPopup();
      };

      list.appendChild(div);
    });

    // 自動縮放
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  })
  .catch(err => {
    console.error("❌ places.json 讀取失敗", err);
  });
