#!/bin/bash
# Execute from the root of the git repo
# Must be kept up-to-date with .gitignore

OUT="RESTED-APS-src.zip"

zip -qr $OUT . \
  -x '.git/*' '.idea/*' 'node_modules/*' 'RESTED-APS.*' 'manifest.json' \
  'dist/background.js' 'dist/content.js' 'dist/rested-aps.js' 'coverage/*'

stat $OUT
