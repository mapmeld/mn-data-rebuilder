const fs = require('fs');

const request = require('request');

request('http://manaikhoroo.ub.gov.mn/en/index.php', function (err, response, body) {
  if (err) {
    throw err;
  }

  var features = [];

  var districts = body.split('if($(this).find(".color-checkbox").attr("data") == "pop-density") {')[2].split('.color-checkbox')[0].split('addDistrictColor(');
  // first is empty
  // last is the function itself
  function loadDistrict(d) {
    if (d >= districts.length) {
      return fs.writeFile('output.geojson', JSON.stringify({
        type: 'FeatureCollection',
        features: features
      }), function (err) {
        if (err) {
          throw err;
        }
        console.log('done');
      });
    }

    var districtID = districts[d].split(',')[0] * 1;
    var color = districts[d].split('\'')[1];
    //console.log(districtID + ' = ' + color);
    request('http://manaikhoroo.ub.gov.mn/en/marker.php?page=sectionBorder&section=' + districtID, function (err, response, body) {
      var ring = [];
      var jb;
      try {
        jb = JSON.parse(body).coordinate;
      } catch (e) {
        console.log('error: ' + districtID + ' - ' + color);
        return loadDistrict(d + 1);
      }
      for (var c = 0; c < jb.length; c++) {
        ring.push([ (1 * jb[c][1]).toFixed(6), (1 * jb[c][0]).toFixed(6) ]);
      }
      ring.push(ring[0].concat([]));

      features.push({
        type: 'Feature',
        properties: { color: color },
        geometry: {
          type: 'Polygon',
          coordinates: [ring]
        }
      });
      //return console.log(JSON.stringify(features));
      if (d % 10 === 0) {
        console.log(d + ' / ' + (districts.length - 1));
      }
      loadDistrict(d + 1);
    });
  }
  loadDistrict(1);
});
