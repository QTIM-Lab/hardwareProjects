#!/bin/bash

# Stop hostapd and dnsmasq services
sudo systemctl stop hostapd
sudo systemctl stop dnsmasq

# Backup current configurations
sudo cp /etc/dnsmasq.conf /etc/dnsmasq.conf.backup
sudo cp /etc/network/interfaces /etc/network/interfaces.backup

# Update network configuration for client mode
echo -e "auto lo\niface lo inet loopback\n\nauto wlan0\niface wlan0 inet dhcp\nwpa-ssid stego\nwpa-psk bubbasaurus" | sudo tee /etc/network/interfaces

# Restart networking service to apply changes
sudo systemctl restart networking
