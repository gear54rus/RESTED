#!/bin/bash
# Builds a release of RESTED-APS

FILES="dist main.js manifest.json"

echo
echo Packaging for Chrome

rm -fv manifest.json
ln -vs google-chrome/manifest.json
zip -qr RESTED-APS.zip $FILES

echo Done

echo
echo Packaging for Firefox

rm -fv manifest.json
ln -vs firefox/manifest.json
zip -qr RESTED-APS.xpi $FILES

echo Done

ls -hl RESTED-APS.*
