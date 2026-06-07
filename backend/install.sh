#!/bin/bash
rm -rf node_modules package-lock.json
npm install --no-fund --no-audit --loglevel=error > install.log 2>&1
