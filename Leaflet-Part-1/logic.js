// Create the map
var map = L.map('map').setView([20, 0], 2);

// Add the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Define getColor function outside of data fetching scope
function getColor(depth) {
    return depth > 90 ? '#800026' :
           depth > 70 ? '#BD0026' :
           depth > 50 ? '#E31A1C' :
           depth > 30 ? '#FC4E2A' :
           depth > 10 ? '#FD8D3C' :
                        '#FFEDA0';
}

// Fetch the GeoJSON data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {

    function getRadius(magnitude) {
        return magnitude * 4;
    }

    function style(feature) {
        return {
            fillColor: getColor(feature.geometry.coordinates[2]),
            weight: 1,
            opacity: 1,
            color: 'black',
            fillOpacity: 0.8,
            radius: getRadius(feature.properties.mag)
        };
    }

    function onEachFeature(feature, layer) {
        if (feature.properties && feature.properties.place) {
            layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
        }
    }

    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
});

// Add legend
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend'),
        grades = [-10, 10, 30, 50, 70, 90],
        labels = [];

    div.innerHTML = '<strong>Depth (km)</strong><br>';
    // Loop through depth intervals to generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);
