const http = require("http");
const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer({});

// Command line arguments
const addr = process.argv[2] || "172.24.76.254"; // the IP of your WSL2 instance
const target_port = process.argv[3] || 7070; // the port your node.js server is listening on
const port = process.argv[4] || 6969; // the port you want to listen on for incoming HTTP requests

const target = "http://" + addr + ":" + target_port;
console.log("Proxying requests to ", target);

const server = http.createServer((req, res) => {
  proxy.web(req, res, { target });
});

server.listen(port); // the port you want to listen on for incoming HTTP requests
console.log("Proxy server listening on " + port);
