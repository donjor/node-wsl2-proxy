const http = require("http");
const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer({});
const { execSync } = require("child_process");
const readlineSync = require("readline-sync");

function findWSLInstances() {
  const output = execSync("wsl -l -v").toString();
  const lines = output.trim().split("\n");
  const instances = lines
    .slice(1)
    .map((line) => {
      const [, name, state, version] = line.trim().split(/\s+/);
      return { name, state, version };
    })
    .filter((instance) => instance.name);

  console.log("Found the following WSL instances:");
  instances.forEach((instance, index) => {
    console.log(`${index + 1}: ${instance.name} (${instance.state})`);
  });
  return instances;
}

function selectWSLInstance(instances) {
  let selection;
  if (instances.length === 1) {
    console.log(
      `Only one instance found. Selecting ${instances[0].name} automatically.`
    );
    selection = 0;
  } else {
    selection = readlineSync.questionInt("Select an instance: ") - 1;
    if (selection < 0 || selection >= instances.length) {
      throw new Error("Invalid selection");
    }
  }

  const instanceName = instances[selection].name.replace(/\u0000/g, ""); //remove null characters
  return instanceName;
}

function selectNodePort(ports) {
  const defaultSelectionIndex = ports.findIndex((port) => port < 10000);
  const defaultSelection = ports[defaultSelectionIndex] || -1;
  var q = `Select a port by index (e.g. 1) or by explicitly typing the port (e.g. 3000): `;
  if (defaultSelection != -1) {
    q = `Select a port by index (e.g. 1) or by explicitly typing the port | (default ${defaultSelection}): `;
  }

  let selection;
  if (ports.length === 1) {
    console.log(`Only one port found. Selecting ${ports[0]} automatically.`);
    selection = 0;
  } else {
    const selectionStr = readlineSync.question(q);

    if (selectionStr != null && selectionStr != "") {
      selection = parseInt(selectionStr, 10) - 1;
      if (ports.includes(selectionStr)) {
        console.log("Found port in list");
        return selection + 1;
      } else {
        if (selection < 0 || selection >= ports.length) {
          throw new Error("Invalid selection");
        }
      }
    } else if (defaultSelection != -1) {
      selection = defaultSelectionIndex;
    } else {
      throw new Error("Invalid selection");
    }

    const port = ports[selection];
    return port;
  }
}

function getWSLIP(instanceName) {
  const cmd = `wsl -d ${instanceName.toString().trim()} hostname -I`;
  const addr = execSync(cmd).toString().trim();
  console.log(`Selected instance: ${instanceName} (${addr})`);
  return addr;
}

function findNodePorts(instanceName) {
  const output = execSync(
    `wsl -d ${instanceName} ss -tunlp | findstr /C:"node" /C:"LISTEN"`
  ).toString();
  const lines = output.trim().split("\n");
  const ports = lines
    .map((line) => {
      const [, port] = line.match(/:(\d+)\s/);
      return port;
    })
    .filter((port) => port);

  console.log("Found the following Node ports:");
  ports.forEach((port, index) => {
    console.log(`${index + 1}: ${port}`);
  });

  return ports;
}

function selectProxyPort() {
  const defaultSelection = 6969;
  var q = `Select a port for the proxy server | (default 6969): `;
  const selectionStr = readlineSync.question(q);
  if (selectionStr != null && selectionStr != "") {
    return parseInt(selectionStr, 10);
  } else {
    return defaultSelection;
  }
}

function startProxy(ipAddress, WSLIP, target_port, port) {
  const target = "http://" + WSLIP + ":" + target_port;
  console.log("Proxying requests to", target);

  const server = http.createServer((req, res) => {
    proxy.web(req, res, { target });
  });

  server.listen(port); // the port you want to listen on for incoming HTTP requests
  console.log("Proxy server address: http://" + ipAddress + ":" + port);
}

function getIP(callback) {
  const { networkInterfaces } = require("os");

  const nets = networkInterfaces();
  const results = Object.create(null); // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  // If you only want the first IP address, you can return the first result here
  callback(results[Object.keys(results)[0]][0]);

  // Otherwise, you can pass the entire results object back
  // callback(results);
}
const instances = findWSLInstances();

const instanceName = selectWSLInstance(instances);

const WSLIP = getWSLIP(instanceName);

const ports = findNodePorts(instanceName);
// console.log("Found the following node ports:", ports);

const target_port = selectNodePort(ports);
// console.log(`Selected port: ${target_port}`);

const port = selectProxyPort();

getIP((ipAddress) => {
  startProxy(ipAddress, WSLIP, target_port, port);
});
