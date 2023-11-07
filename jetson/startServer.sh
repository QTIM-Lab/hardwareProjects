#!/bin/bash

# Function to start the server
start_server() {
    echo "Starting the server..."

    node ./db_webserver/db_webservice.js
}

# Function to set system time, used only on the Jetson Nano with an aarch64 architecture
set_system_time() {
    read -p "Enter the current date and time (YYYY-MM-DD HH:MM:SS): " user_time
    if [[ $user_time =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$ ]]; then
        echo "Setting system time..."
        sudo date -s "$user_time"
        echo "$(date) - Time set to $user_time by user." >> /var/log/time_log.txt
    else
        echo "Invalid date format. Please use the format YYYY-MM-DD HH:MM:SS."
    fi
}

# Check if we are on a Jetson Nano with aarch64 architecture
if [[ $(uname -n) == *"jetson"* ]] && [[ $(uname -m) == "aarch64" ]]; then
    echo "Jetson Nano with aarch64 architecture detected. Setting system time."
    set_system_time
else
    echo "This is not a Jetson Nano with aarch64 architecture. Skipping time setting."
fi

# Start the server regardless of the machine type
start_server
