const http = require("http");
const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer({});

// Command line arguments
const addr = process.argv[2]; // the IP of your WSL2 instance
const target_port = process.argv[3]; // the port your node.js server is listening on
const port = process.argv[4]; // the port you want to listen on for incoming HTTP requests

// Hardcoded
// const addr = "172.16.0.0"; // the IP of your WSL2 instance
// const target_port = 4444; // the port your node.js server is listening on
// const port = 5555; // the port you want to listen on for incoming HTTP requests

const target = "http://" + addr + ":" + target_port;
console.log("Proxying requests to ", target);

const server = http.createServer((req, res) => {
  proxy.web(req, res, { target });
});

server.listen(port); // the port you want to listen on for incoming HTTP requests
console.log("Proxy server listening on " + port);
