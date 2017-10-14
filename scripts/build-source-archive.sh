#!/bin/bash
# Execute from the root of the git repo

rm -rf node_modules RESTED-APS.* dist/rested-aps* coverage
cd ..
zip -r -9 RESTED-APS/RESTED-APS.src.zip RESTED-APS
cd RESTED-APS
