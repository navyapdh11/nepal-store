#!/bin/sh
# Clear cached Windows node_modules before install
rm -rf node_modules package-lock.json
npm install
