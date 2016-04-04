
const http = require('http');
const request = require('request');

http.createServer(function (req, res) {
  request('http://manaikhoroo.ub.gov.mn' + req.url, function (err, resp, body) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.write(body);
    res.end();
  });
}).listen(9000);
