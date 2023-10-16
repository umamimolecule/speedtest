#!/bin/bash
DIR=$(dirname $0)
echo "======================"
echo "==!! LANSpeedTest !!=="
echo "======================"
echo "To answer yes type the letter (y) in lowercase and press ENTER."
echo "Default is no (N). Skip any components you already have or don't need."
echo "============="
#Detect Ubuntu Version
echo "============="
echo " Detecting Ubuntu Version"
echo "============="
getubuntuversion=$(lsb_release -r | awk '{print $2}' | cut -d . -f1)
echo "============="
echo " Ubuntu Version: $getubuntuversion"
echo "============="
echo "LANSpeedTest - Do you want to temporarily disable IPv6?"
echo "Sometimes IPv6 causes Ubuntu package updates to fail. Only do this if your machine doesn't rely on IPv6."
echo "(y)es or (N)o"
read -r disableIpv6
if [ "$disableIpv6" = "y" ] || [ "$disableIpv6" = "Y" ]; then
    sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
    sudo sysctl -w net.ipv6.conf.default.disable_ipv6=1
    sudo sysctl -w net.ipv6.conf.lo.disable_ipv6=1
fi
if [ "$getubuntuversion" = "18" ] || [ "$getubuntuversion" -gt "18" ]; then
    apt install sudo wget -y
    sudo apt install -y software-properties-common
    sudo add-apt-repository universe -y
fi
if [ "$getubuntuversion" = "16" ]; then
    sudo apt install gnupg-curl -y
fi

echo "Installing Node.js"
sh $DIR/nodejs-ubuntu.sh
if ! [ -x "$(command -v npm)" ]; then
    sudo apt install npm -y
fi

echo "Installing TypeScript"
sudo npm install typescript -g

# TODO: Build project
echo "Building project"
sudo npm i
sudo npm run build
sudo tsc

echo "Installing PM2"
sudo npm install pm2@latest -g

echo "Finished"
sudo chmod -R 755 .
touch install/installed.txt

echo "Starting LANSpeedTest and setting to start on boot"
sudo pm2 start build/server/index.js
sudo pm2 startup
sudo pm2 save
sudo pm2 list

echo "Install Completed"
echo "Open http://$(ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p'):8080 in your web browser."
