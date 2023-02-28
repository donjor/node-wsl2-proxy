# node-wsl-proxy

A simple HTTP proxy server that forwards requests to a Node.js server running on a WSL2 instance.

![ezgif-3-e7a324544a](https://user-images.githubusercontent.com/38745786/221817833-4abd1650-f1fa-4daa-a769-2973fc3e73df.gif)

## Why use node-wsl-proxy?

If you're running a Node.js server in WSL2 and want to access it from another machine on your network, you may run into issues due to the default network configuration. This should work for the default "NAT" mode as WSL2 instances are assigned a private IP address, and incoming connections from the network are not directly forwarded to them.

## Alternative Solution

Manually configure a static IP address for your WSL2 instance, which would allow you to connect to your Node.js server using that IP address. If you prefer to take this approach, you can find instructions online for how to configure a static IP address in WSL2.

## Clone/Install Dependencies

1. Clone this repository to your host machine.
2. Start your Node.js server inside your WSL2 instance.
3. In a terminal, navigate to the cloned repository.
4. Run `npm install` to install the required dependencies.

## Start

1. Start the proxy server by running the following command:

   `node proxy.js`

   This automatically detects wsl instances and node sever ports and prompts the user to select which instance and ports to use

2. In a web browser or other HTTP client, navigate to `http://localhost:<PROXY_PORT>/` or `http://<WINDOWS_LOCAL_IP>:<PROXY_PORT>/` to access your Node.js server running in the WSL2 instance.

   You shouldn't need to bind the WSL2 node server to `0.0.0.0` or `<WSL2_IP>` in order for this to work. Default config should be fine.

---

## Start (basic implementation with manual config)

I've updated this repo so that you don't have to manually enter the IP address of your WSL2 instance (as this seems to change on reboot), the port your Node.js server is listening on, and the port you want to listen on for incoming HTTP requests using `proxy.js`

If you have issues with this you can instead use `proxy-basic.js`

1. Start the proxy server by running the following command:

   `node proxy-basic.js`

   (if you have defined the variables in the proxy-basic.js file)

   ```js
   const addr = process.argv[2] || "172.24.76.254"; // the IP of your WSL2 instance
   const target_port = process.argv[3] || 7070; // the port your node.js server is listening on
   const port = process.argv[4] || 6969; // the port you want to listen on for incoming HTTP requests
   ```

   or

   `node proxy-basic.js <WSL2_IP> <WSL2_PORT> <PROXY_PORT>`

   where `<WSL2_IP>` is the IP address of your WSL2 instance, `<WSL2_PORT>` is the port your Node.js server is listening on in the WSL2 instance, and `<PROXY_PORT>` is the port you want to listen on for incoming HTTP requests on the host machine.

## Finding Your WSL2 IP Address (needed for proxy-basic.js)

in your WSL2 instance, run the following command:

`ip addr show eth0 | grep 'inet\b' | awk '{print $2}' | cut -d/ -f1`

this will return the IP address of your WSL2 instance.

`172.23.08.34`

if this doesn't work because the network adapter isn't on eth0, you can also run the following command:
`ip addr show`
look for the address listed after `inet`. Example:

```bash
6: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether .......
    inet 172.23.08.34/20 brd ....... scope global eth0
       valid_lft forever preferred_lft forever
    inet6 ......... scope link
       valid_lft forever preferred_lft forever
```

in this example the WSL2 IP address is `172.23.08.34`

---

## Opening Ports

To access the Node.js server running on the WSL2 instance, you may need to open the appropriate ports in Windows Firewall and/or in the UFW firewall on the WSL2 instance.

### Windows Firewall

1. Open Windows Firewall with Advanced Security.

2. Click `Inbound Rules` and then `New Rule`.

3. Choose the `Port` option and click `Next`.

4. Select the appropriate protocol and enter the port number.

5. Choose the `Allow the connection` option and click `Next`.

6. Select the appropriate network profiles and click `Next`.

7. Enter a name and description for the rule and click `Finish`.

### UFW Firewall (if enabled)

1. Open the terminal on your WSL2 instance.

2. Run the following command to allow incoming connections on the appropriate port:

`sudo ufw allow <port_number>/tcp`

Replace `<port_number>` with the port number that your Node.js server is listening on.
