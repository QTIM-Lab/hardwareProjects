#!/bin/bash

# Stop networking service temporarily
sudo systemctl stop networking

# Restore configurations from backup
sudo cp /etc/dnsmasq.conf.backup /etc/dnsmasq.conf
sudo cp /etc/network/interfaces.backup /etc/network/interfaces

# Start hostapd and dnsmasq services
sudo systemctl start hostapd
sudo systemctl start dnsmasq

# Restart networking service to apply changes
sudo systemctl restart networking
