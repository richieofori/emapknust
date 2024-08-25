// Initialize the map
var map = L.map("map").setView([6.677137129, -1.571757783], 15);

// google satelite map
googleSat = L.tileLayer("http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
  maxZoom: 20,
  subdomains: ["mt0", "mt1", "mt2", "mt3"],
});

// open street map
osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// KNUST tms map
kms = L.tileLayer("https://knust-tms.intdeltas.com/tms/{z}/{x}/{y}.png", {
  tms: true,
  opacity: 1,
  attribution: "Geomatic Eng., KNUST, 2024",
  minZoom: 2,
  maxZoom: 22,
});

var baseMaps = {
  "Open Street Map": osm,
  "Google Satelite": googleSat,
  "KNUST TMS": kms
};

L.control.layers(baseMaps).addTo(map)

// Function to get color based on noise level
function getColor(noiseLevel) {
  if (noiseLevel > 70) {
    return "red";
  } else if (noiseLevel > 60) {
      return "orange";
 } else if (noiseLevel > 50) {
    return "yellow";
  } else {
    return "green";
  }
}

// Custom cluster icon creation function
function createCustomClusterIcon(cluster) {
  var childCount = cluster.getChildCount();

  var c = " marker-cluster-";
  if (childCount < 10) {
    c += "small";
  } else if (childCount < 100) {
    c += "medium";
  } else {
    c += "large";
  }

  return new L.DivIcon({
    html: '<div class="custom-cluster-icon">' + childCount + "</div>",
    className: "custom-cluster" + c,
    iconSize: new L.Point(40, 40),
  });
}

// Create a marker cluster group with the custom cluster icon
var markers = L.markerClusterGroup({
  iconCreateFunction: createCustomClusterIcon,
});

// Load GeoJSON data
$.getJSON("\afternoon.geojson", function (data) {
  L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      var noiseLevel = feature.properties["noise Level"];
      var location = feature.properties.location;
      var color = getColor(noiseLevel);

      var customIcon = L.divIcon({
        className: "custom-marker-icon",
        html: "", // Empty content because we want to style it with CSS
        iconSize: [30, 30],
        iconAnchor: [10, 10],
      });

      var marker = L.marker(latlng, {
        icon: customIcon,
      }).bindPopup(
           "<h3>" + location + "</h3>"  + "<br>Noise Level: " + noiseLevel + " dB"
      );

      // Add inline CSS for background color
      marker.on("add", function () {
        this._icon.style.backgroundColor = color;
      });

      return marker;
    },
  }).addTo(markers);
});

// Add the marker cluster group to the map
map.addLayer(markers);

// Add the legend to the map
var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "legend");
  var grades = [0, 50, 60, 70];
  var labels = ["< 50 dB", "50-60 dB", "60-70 dB", "> 70 dB"];

  div.innerHTML += "<strong>Noise Level</strong><br>";

  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' +
      getColor(grades[i] + 1) +
      '"></i> ' +
      grades[i] +
      (grades[i + 1] ? "&ndash;" + grades[i + 1] + " dB<br>" : "+ dB");
      "<br>";
  }

  // div.innerHTML +=
  //   '<i style="background:' + getColor(70) + '"></i> ';

  return div;
};

legend.addTo(map);

L.Control.geocoder().addTo(map);

const panelRight = L.control
  .sidepanel("panelID", {
    panelPosition: "right",
    hasTabs: false,
    tabsPosition: "top",
    pushControls: true,
    darkMode: true,
    startTab: "tab-5",
  })
  .addTo(map);

// Initialize the sidebar
        var sidebar = L.control.sidebar({
            autopan: true,       // whether to move the map when opening the sidebar
            closeButton: true,   // whether to add a close button to the pane
            container: 'sidebar', // the DOM container or ID of a predefined sidebar
            position: 'left',    // left or right
        }).addTo(map);

        // Open the sidebar on the "home" tab
        // sidebar.open('home');

