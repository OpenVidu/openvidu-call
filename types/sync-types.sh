#!/bin/bash

HEADER="/**\n * This type file is autogenerated. Do not modify this file manually. For any changes, please update the '/openvidu-call/types' directory.\n */\n\n"
SOURCE_DIR="src"

FRONTEND_DIR="../frontend/projects/shared-call-components/src/lib/typings/ce"
BACKEND_DIR="../backend/src/typings/ce"
TYPES_DIR="../../openvidu-call-pro/types/src/ce"

add_headers() {
  find "$SOURCE_DIR" -type f -name "*.ts" | while read -r file; do
    if ! grep -q "This type file is autogenerated" "$file"; then
      echo -e "$HEADER$(cat "$file")" > "$file"
    fi
  done
}

remove_headers() {
  find "$SOURCE_DIR" -type f -name "*.ts" | while read -r file; do
    sed -i -e '/\/\*\*/,/\*\//d' -e '/^$/d' "$file"
  done
}

if [[ $1 == "ce" ]]; then
    TARGET_DIRS=("$FRONTEND_DIR" "$BACKEND_DIR")
elif [[ $1 == "pro" ]]; then
  TARGET_DIRS=("$TYPES_DIR")
else
  echo "No argument provided. Copying to both CE and PRO"
  TARGET_DIRS=("$FRONTEND_DIR" "$BACKEND_DIR" "$TYPES_DIR")
fi


echo "Adding autogenerated comments to files..."
add_headers


echo "Copying files to target directories..."
for TARGET_DIR in "${TARGET_DIRS[@]}"; do
  mkdir -p "$TARGET_DIR"
  cp -rT "$SOURCE_DIR" "$TARGET_DIR"
done

echo "Restoring original files..."
remove_headers

echo "Types have been synced successfully."
