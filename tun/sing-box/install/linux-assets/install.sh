#!/bin/bash

if command -v sing-box &>/dev/null; then
    echo "sing-box is already installed!"
    exit 0
fi

if command -v apt-get &>/dev/null; then
    bash <(curl -fsSL https://sing-box.app/deb-install.sh)
elif command -v dnf &>/dev/null; then
    bash <(curl -fsSL https://sing-box.app/rpm-install.sh)
elif command -v pacman &>/dev/null; then
    bash <(curl -fsSL https://sing-box.app/arch-install.sh)
else
    echo "Unknown distribution"
fi
