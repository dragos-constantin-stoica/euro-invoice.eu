var http = require("http");

/*
//URL should be a parameter
let url = 'http://localhost:8090/ok'
http.get(url, res => {

    let rawData = ''

    res.on('data', chunk => {
        rawData += chunk
    })

    res.on('end', () => {
	console.log(`STATUS: ${res.statusCode}`)
	const parsedData = JSON.parse(rawData)
    	console.log(parsedData)
	process.exit(0)
    })

}).on("error", (err) => {
  console.log("Error: " + err.message);
  process.exit(1);
});
*/


var http = require("http");
var options = {
  host: "localhost",
  path: "/ok",
  port: "8090",
  timeout: 2000,
};

var request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode == 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on("error", function (err) {
  console.log("ERROR");
  process.exit(1);
});

request.end();

