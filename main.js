//1- انشاء الخريطة
var map = L.map('map').setView([30.00, 30.444], 8);
map.zoomControl.setPosition('bottomright');
// انواع الخرابط
var EsriWorldImagery = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{
  attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics"
}).addTo(map);
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
var cartoDark = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles © Esri"
  }
);
var Topographic = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles © Esri"
  }
);
////////////////////////////////////////////////////////////////////////// الرسم/////////////////////////////////////////
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
  edit: { featureGroup: drawnItems }
});
map.addControl(drawControl);
map.on("draw:created", function (e) {
  var layer = e.layer;
  layer.bindPopup(`<p>
    ${JSON.stringify(layer.toGeoJSON())}
    </p>`)
    console.log(layer);
    
  drawnItems.addLayer(layer);
});
// /////////////////////////////////////////// export KML///////////////////////////////////////////////////////////////////
// زر التصدير (باستخدام tokml)
document.getElementById('exportKml').addEventListener('click', function () {
  if (!drawnItems || drawnItems.getLayers().length === 0) {
    alert('لا يوجد رسومات للتصدير.');
    return;
  }

  // 1) اخراج GeoJSON من العناصر المرسومة
  var geojson = drawnItems.toGeoJSON();

  // 2) تحويل GeoJSON إلى KML (مكتبة tokml)
  // tokml متاحة عبر CDN عند تضمينها في HTML
  try {
    var kml = tokml(geojson, {
      name: 'name',      // يمكنك تغيير الحقول المربوطة
      description: 'description',
      area :"area"
    });

    // 3) تحميل الملف
    var blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'drawn_features.kml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert('حدث خطأ أثناء تحويل البيانات إلى KML.');
  }
});
// 2-Layers Control (التحكم في الطبقات)
var baseMaps =
{
    "Esri_satallite": EsriWorldImagery,
    "Open street Map": osm,
    "Carto Dark": cartoDark,
    "Esri Topographic" :Topographic
};
L.control.layers(baseMaps).addTo(map);
// scale map
L.control.scale().addTo(map);

///////////////////////////////////// search coordinates////////////////////////////////////////////////////////////////////
// تعريف المتغير 
var searchMarker ;
function goToLocation() {
  var lat = parseFloat(document.getElementById("lat").value);
  var lon = parseFloat(document.getElementById("lon").value);

  if (isNaN(lat) || isNaN(lon)) {
    alert("⚠️ من فضلك أدخل إحداثيات صحيحة (Latitude و Longitude).");
    return;
  }

  // لو فيه Marker قديم احذفه
  if (searchMarker) {
    map.removeLayer(searchMarker);
  }

  // حرك الخريطة للموقع المطلوب
  map.setView([lat, lon], 15);

  // أضف Marker في الموقع
  searchMarker = L.marker([lat, lon]).addTo(map)
    .bindPopup(`📍 الموقع المطلوب:<br>Latitude: ${lat}<br>Longitude: ${lon}`)
    .openPopup();
}

// 5️⃣ ربط الزر بالوظيفة
document.getElementById("CordBtSearch").addEventListener("click", function (e) {
  e.preventDefault();
  goToLocation();
});

// ️⃣ زر المسح
document.getElementById("CordBtClear").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("lat").value = "";
  document.getElementById("lon").value = "";
  if (searchMarker) {
    map.removeLayer(searchMarker);
  }
});
// الاحداثيات  تظهر علي الخريطة
map.on('mousemove', function(e) {
  let lat = e.latlng.lat.toFixed(7);
  let lng = e.latlng.lng.toFixed(7);
  $(".coordinates").html(`latitude : ${lat} , longitude : ${lng}`);
});
// ////////////////////////////////////////////////////////////////////تحميل ملف GeoJSON من داخل المشروع/////////////////////
fetch('./zmams.json')
  .then(response => response.json())
  .then(data => {
    var geojsonLayer = L.geoJSON(data, {
      onEachFeature: function (feature, layer) {
        if (feature.properties) {
          //[ جدول Bootstrap]
          var popupContent = `<div style="width:1000px; max-width:100%;">`;
          popupContent += `<table class="table table-bordered table-sm text-center mb-0">`;
          popupContent += '<thead class="table-striped-columns table-primary"><tr>';
          // رؤوس الجدول
          for (var key in feature.properties) {
            popupContent += `<th>${key}</th>`;
          }
          popupContent += '</tr></thead>';
          // بيانات الصف
          popupContent += '<tbody class=""><tr>';
          for (var key in feature.properties) {
            popupContent += `<td>${feature.properties[key]}</td>`;
          }
          popupContent += '</tr></tbody></table></div>';

          layer.bindPopup(popupContent, {
            maxWidth: 900,  // التحكم في عرض الـ Popup
            minWidth: 200,
            autoPanPadding: [20, 20]
          });
        }
      },
      style: {
        color: '#ff0000c7',
        weight: 2,
        fillOpacity: 0.4
      }
    }).addTo(map);

    // تركيز الخريطة على البيانات
    map.fitBounds(geojsonLayer.getBounds());
  })
  .catch(error => console.error(' خطأ في تحميل ملف GeoJSON:', error));

  // /////////////////////////////////////////////////////////////////////////////////عرض البيانات////////////////////////////////////////////////







  // ///////////////////////////////////////////   converter  ///////////////////////////////////////////////////////////////////////////////////

const faddanM2 = 4200.83;
const qeratM2 = faddanM2 / 24;
const sahmM2 = qeratM2 / 24;
document.getElementById("calcBtn2").onclick = function () {
    const inputText = document.getElementById("result2").value.trim();
    const tableBody = document.querySelector("#resultTable tbody");


    // تقسيم القيم (سواء كانت مفصولة بفواصل أو في سطور)
    const values = inputText.split(/[\n,،]+/).map(v => v.trim()).filter(v => v !== "");

    // لو مفيش قيم صحيحة
    if (values.length === 0) {
        alert("لم يتم إدخال أي قيم صحيحة");
        return;
    }

    // مسح الجدول القديم
    tableBody.innerHTML = "";

    values.forEach((val, index) => {
        const meters = Number(val);

        const row = document.createElement("tr");

        if (isNaN(meters)) {
            row.innerHTML = `<td>${index + 1}</td><td colspan="4" class="text-danger">⚠️ "${val}" ليست قيمة رقمية</td>`;
            tableBody.appendChild(row);
            return;
        }

        const faddan = Math.floor(meters / faddanM2);
        const remFaddan = meters % faddanM2;
        const qerat = Math.floor(remFaddan / qeratM2);
        const remQerat = remFaddan % qeratM2;
        const sahm = (remQerat / sahmM2).toFixed(2);

        row.innerHTML = `
      <td>${index + 1}</td>
      <td>${meters.toLocaleString()}</td>
      <td>${faddan}</td>
      <td>${qerat}</td>
      <td>${sahm}</td>
    `;
        tableBody.appendChild(row);
    });
    document.getElementById("downloadExcel").classList.remove("d-none");

};
// تحميل النتايج

document.getElementById('downloadExcel').onclick = function () {

    const table = document.getElementById("resultTable");
    const rows = table.querySelectorAll("tbody tr");
    const wb = XLSX.utils.table_to_book(table, { sheet: "النتائج" });
    XLSX.writeFile(wb, "التحويل_من_المتر.xlsx");

};

// مسح النتايج

document.getElementById("clearBtn2").onclick = function () {
    document.getElementById("result2").value = "";
    document.querySelector("#resultTable tbody").innerHTML = `
    <tr>
      <td colspan="5" class="text-muted">النتائج ستظهر هنا بعد الحساب...</td>
    </tr>`;
    document.getElementById("downloadExcel").classList.add("d-none");
};
var map = L.map('map', {
    center: [51.505, -0.09],
    zoom: 13
});
