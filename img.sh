#!/bin/bash

# Function to crop an image
crop_image() {
  local input_image="$1"
  local output_image="$2"
  local x="$3"
  local y="$4"
  local width="$5"
  local height="$6"

  # Use ImageMagick's convert command to crop the image
  magick convert "$input_image" -crop "${width}x${height}+${x}+${y}" "./public/assets/img/$output_image"
  echo "Cropped image saved as $output_image"
}

# Crop the first image
crop_image "image-map.png" "meteor-3.png" 150 150 200 400

# Crop the second image
crop_image "image-map.png" "meteor-2.png" 350 150 200 400

# Crop the third image
crop_image "image-map.png" "meteor-1.png" 550 150 200 200
