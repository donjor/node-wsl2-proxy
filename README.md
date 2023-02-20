# node-wsl-proxy

A simple HTTP proxy server that forwards requests to a Node.js server running on a WSL2 instance.

## Why?

If you're running a Node.js server in WSL2 and want to access it from another machine on your network, you may run into issues due to the default network configuration. WSL2 can run in two network modes: a default "NAT" mode and a "bridge" mode. In "NAT" mode, WSL2 instances are assigned a private IP address, and incoming connections from the network are not directly forwarded to them. In "bridge" mode, WSL2 instances are assigned a unique IP address on the host machine's network and can accept incoming connections directly.

One solution could be is to manually configure a static IP address for your WSL2 instance, which would allow you to connect to your Node.js server using that IP address. If you prefer to take this approach, you can find instructions online for how to configure a static IP address in WSL2.

Another option is to use the proxy solution provided by this repository, which allows you to access your Node.js server in WSL2 without having to configure a static IP address. However, keep in mind that opening up ports on your Windows firewall and your WSL2 instance's firewall may be necessary for this solution to work.

## Usage

1. Clone this repository to your host machine.
2. Start your Node.js server inside your WSL2 instance.
3. In a terminal, navigate to the cloned repository.
4. Run `npm install` to install the required dependencies.
5. Start the proxy server by running the following command:

   `node server.js <WSL2_IP> <WSL2_PORT> <PROXY_PORT>`

   where `<WSL2_IP>` is the IP address of your WSL2 instance, `<WSL2_PORT>` is the port your Node.js server is listening on in the WSL2 instance, and `<PROXY_PORT>` is the port you want to listen on for incoming HTTP requests on the host machine.

   Alternatively, you can define these variables in the server.js file

   ```json
   const addr = "172.16.0.0"; // the IP of your WSL2 instance
   const target_port = 4444; // the port your node.js server is listening on
   const port = 5555; // the port you want to listen on for incoming HTTP requests
   ```

   and start the proxy server by running the following command:
   `node server.js`

6. In a web browser or other HTTP client, navigate to `http://localhost:<PROXY_PORT>/` to access your Node.js server running in the WSL2 instance.

   Alternatively, you can navigate to `http://<WINDOWS_LOCAL_IP>:<PROXY_PORT>/` to access your Node.js server running in the WSL2 instance from another machine on your network.

   You shouldn't need to bind the WSL2 node server to `0.0.0.0` or `<WSL2_IP>` in order for this to work. Default config should be fine.

## Finding Your WSL2 IP Address

in your WSL2 instance, run the following command:
`ip addr show eth0`
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
