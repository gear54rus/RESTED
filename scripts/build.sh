#!/bin/bash
# Builds a release of RESTED-APS
# Can read pem from file or stdin

PEM=$1
TMPFILE="RESTED-APS.pem"
SHRED=false

if test $# -ne 1; then
  echo Awaiting input of key
  while read i; do
    echo $(printf "\n$i") >> $TMPFILE
  done
  SHRED=true
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FILES="dist main.js manifest.json"

echo
echo Packaging for Chrome

rm -fv manifest.json
ln -vs google-chrome/manifest.json
bash $DIR/mkcrx.sh $DIR "${PEM:-$TMPFILE}" || exit 1
zip -qr RESTED-APS.zip $FILES

echo Done

echo
echo Packaging for Opera

cp -v RESTED-APS.crx RESTED-APS.nex

echo Done

echo
echo Packaging for Firefox

rm -fv manifest.json
ln -vs firefox/manifest.json
zip -qr RESTED-APS.xpi $FILES

echo Done

ls -hl RESTED-APS.*

if [ $SHRED == true ]; then
  echo Shredding temp file
  shred -u $TMPFILE
  echo Shredded $TMPFILE
fi

