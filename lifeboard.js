/*global URI, gmapGreyStyle, google, GeoJSON, $*/

var COLORS = {
  1: 'blue',
  2: 'green',
  3: 'yellow',
  4: 'orange',
  5: 'red'
};

var map;

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

    var geometry = new GeoJSON(container[options.type][key].geoJSON, styles);

    geometry.forEach(function (g) {
      g.setMap(map);
    });
  });
}

$(function () {
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(47.622364, -122.203674),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: gmapGreyStyle
  };

  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  var uri = new URI(location.href);
  var query = uri.query(true);

  var userId = query.userId || 3428;

  $.getJSON('/quadstreaker/proxy.py?userId=' + userId, function (data) {
    data = data.parameters[0];

    addGeometries(data, { type: 'Hood', weight: 0.5, strokeOpacity: 0.5,
      filled: false });
    addGeometries(data, { type: 'City', strokeOpacity: 0.5, filled: false });
    addGeometries(data, { type: 'SuperCity', strokeOpacity: 0.5,
      filled: false });

    addGeometries(data, { type: 'Quad', weight: 0.25 });
    addGeometries(data, { type: 'SuperQuad', weight: 0.5 });
  });
});
