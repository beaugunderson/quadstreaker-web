/*global URI, gmapGreyStyle, google, GeoJSON, $*/

var COLORS = {
  1: 'blue',
  2: 'green',
  3: 'yellow',
  4: 'orange',
  5: 'red'
};

var map;
var bounds;

function squareFromExtents(extents) {
  var coordinates = [
    new google.maps.LatLng(extents[1], extents[0]),
    new google.maps.LatLng(extents[3], extents[0]),
    new google.maps.LatLng(extents[3], extents[2]),
    new google.maps.LatLng(extents[1], extents[2])
  ];

  return coordinates;
}

function addGeometries(container, options) {
  if (!container[options.type]) {
    return;
  }

  Object.keys(container[options.type]).forEach(function (key) {
    var styles = {
      //strokeColor: COLORS[container[key].heat_level],
      strokeColor: COLORS[container.user[options.type][key].level],
      strokeOpacity: options.strokeOpacity || 0.8,
      strokeWeight: options.weight || 1,
      //fillColor: COLORS[container[key].heat_level],
      fillColor: options.filled !== false ?
        COLORS[container.user[options.type][key].level] : 'none',
      fillOpacity: 0.4
    };

    if (options.type === 'Quad' || options.type === 'SuperQuad') {
      var polygon = new google.maps.Polygon(styles);

      polygon.setPaths(squareFromExtents(container[options.type][key].extent));
      polygon.setMap(map);
    } else {
      if (!container[options.type][key].geoJSON.type) {
        console.log('geoJSON without type:', options.type, key);

        return;
      }

      var geometry = new GeoJSON(container[options.type][key].geoJSON, styles);

      if (geometry.type === 'Error') {
        console.log('Error parsing GeoJSON:', options.type, key,
          geometry.message);

        console.log(container[options.type][key].geoJSON);

        return;
      }

      // For each MultiPolygon, get the first path and iterate its points to
      // extend the bounds of the map
      geometry.forEach(function (g) {
        var points = g.getPaths().getArray()[0];

        points.forEach(function (point) {
          bounds.extend(point);
        });

        g.setMap(map);
      });
    }
  });
}

$(function () {
  var mapOptions = {
    zoom: 4,
    center: new google.maps.LatLng(41.85, -87.65),
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    },
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: gmapGreyStyle
  };

  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  bounds = new google.maps.LatLngBounds();

  var uri = new URI(location.href);
  var query = uri.query(true);

  var userId = query.userId || 3428;

  $.getJSON('proxy.py?userId=' + userId, function (data) {
    data = data.parameters[0];

    addGeometries(data, { type: 'Hood', weight: 0.5, strokeOpacity: 0.5,
      filled: false });
    addGeometries(data, { type: 'City', strokeOpacity: 0.5, filled: false });
    addGeometries(data, { type: 'SuperCity', strokeOpacity: 0.5,
      filled: false });

    addGeometries(data, { type: 'Quad', weight: 0.25 });
    addGeometries(data, { type: 'SuperQuad', weight: 0.5 });

    $('#loading').hide();

    map.fitBounds(bounds);
  });
});
