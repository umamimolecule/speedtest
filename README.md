# LANSpeedTest

Measures data transfer speed for your LAN. Install the server on one machine and connect to it from another machine on your network.

![](./images/screenshot.gif)

## Motivation

I wanted to verify the throughput of a new WiFi and LAN network without needing Internet access, in order to check the quality of each ethernet outlet and WiFi access point.

## Installing on Proxmox

Choose the following settings:

- 2GB disk size
- 1 core
- 512MB RAM

I uses Ubuntu 22.04 LXC template, the rest of this section assumes you'll be doing the same.

Install curl if needed:

```bash
sudo apt update
sudo apt upgrade
sudo apt install curl
```

Then install the server:

```bash
sh <(curl -s https://raw.githubusercontent.com/umamimolecule/speedtest/main/install/install.sh)
```

Browse to the URL displayed at the end of the script and test your LAN speed.
