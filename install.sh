#!/bin/bash
# Ebook Reader installer — builds from source and installs it as a proper desktop app.
# For distros without .deb/.rpm support (Arch, CachyOS, etc.)
# Usage: ./install.sh

set -e

echo "==> Checking dependencies..."
for cmd in npm cargo; do
    if ! command -v "$cmd" &> /dev/null; then
        echo "Error: '$cmd' is required but not installed."
        exit 1
    fi
done

echo "==> Building Ebook Reader (release mode)..."
npm install
npm run tauri build

BIN_SRC="src-tauri/target/release/ebook-reader"
BIN_DEST="/usr/local/bin/ebook-reader"
ICON_SRC="src-tauri/icons/icon.png"
ICON_DEST="$HOME/.local/share/icons/ebook-reader.png"
DESKTOP_FILE="$HOME/.local/share/applications/ebook-reader.desktop"

if [ ! -f "$BIN_SRC" ]; then
    echo "Error: built binary not found at $BIN_SRC"
    echo "Check the actual binary name under src-tauri/target/release/ and update BIN_SRC in this script."
    exit 1
fi

echo "==> Installing binary to $BIN_DEST (requires sudo)..."
sudo cp "$BIN_SRC" "$BIN_DEST"
sudo chmod +x "$BIN_DEST"

echo "==> Installing icon..."
mkdir -p "$(dirname "$ICON_DEST")"
if [ -f "$ICON_SRC" ]; then
    cp "$ICON_SRC" "$ICON_DEST"
else
    echo "Warning: icon not found at $ICON_SRC, skipping (app will use a default icon)."
fi

echo "==> Creating desktop launcher entry..."
mkdir -p "$(dirname "$DESKTOP_FILE")"
cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Name=Ebook Reader
Comment=Ebook reading app
Exec=$BIN_DEST
Icon=ebook-reader
Terminal=false
Type=Application
Categories=Utility;Office;
StartupWMClass=ebook-reader
EOF

echo "==> Refreshing application database..."
update-desktop-database "$(dirname "$DESKTOP_FILE")" 2>/dev/null || true

echo ""
echo "✅ Ebook Reader installed successfully!"
echo "   - Run from terminal: ebook-reader"
echo "   - Or launch it from your app menu / launcher (rofi, wofi, etc.)"
echo ""
echo "To update later, just re-run this script after pulling the latest changes."