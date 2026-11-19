document.addEventListener("DOMContentLoaded", () => {
    const datasets = [
        ["pointTable", "waypoint.json", "Point"],
        ["polygonTable", "polygon.json", "Polygon"],
        ["polylineTable", "polyline.json", "LineString"]
    ];
    for (const [id, url, type] of datasets) {
        const table = document.getElementById(id);
        const body = table && table.tBodies[0];
        if (!body) continue;
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error("HTTP " + response.status);
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data.features)) throw new Error("GeoJSON features missing");
                for (const feature of data.features) {
                    if (!feature || !feature.geometry || feature.geometry.type !== type) continue;
                    const row = body.insertRow();
                    row.insertCell().textContent = (feature.properties && feature.properties.name) || "—";
                    row.insertCell().textContent = JSON.stringify(feature.geometry.coordinates);
                    row.insertCell().textContent = type;
                }
                if (!body.rows.length) {
                    const cell = body.insertRow().insertCell();
                    cell.colSpan = 3;
                    cell.textContent = "Tidak ada data " + type;
                }
            })
            .catch(error => {
                body.textContent = "";
                const cell = body.insertRow().insertCell();
                cell.colSpan = 3;
                cell.textContent = "Gagal memuat " + url + ": " + error.message;
            });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    if (typeof ol === "undefined") {
        document.getElementById("map").textContent = "Pustaka OpenLayers gagal dimuat.";
        return;
    }
    const map = new ol.Map({
        target: "map",
        layers: [new ol.layer.Tile({source: new ol.source.OSM()})],
        view: new ol.View({
            center: ol.proj.fromLonLat([99.05754142360259, 2.3342472445465083]),
            zoom: 14
        })
    });
    const datasets = [
        ["polygon.json", "Polygon", new ol.style.Style({stroke: new ol.style.Stroke({color: "black", width: 3}), fill: new ol.style.Fill({color: "rgba(0,0,0,0.1)"})})],
        ["polyline.json", "LineString", new ol.style.Style({stroke: new ol.style.Stroke({color: "blue", width: 2})})],
        ["waypoint.json", "Point", new ol.style.Style({image: new ol.style.Circle({radius: 5, fill: new ol.style.Fill({color: "red"})})})]
    ];
    for (const [url, type, style] of datasets) {
        const source = new ol.source.Vector({url, format: new ol.format.GeoJSON()});
        map.addLayer(new ol.layer.Vector({
            source,
            style: feature => feature.getGeometry() && feature.getGeometry().getType() === type ? style : undefined
        }));
    }
});
