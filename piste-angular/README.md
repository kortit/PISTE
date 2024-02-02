# Setup

## Requirement : node and npm installed on system

## download npm packages
npm install

## If not already installed, install angular CLI
npm install -g @angular/cli

## To package app to .exe, If not already installed, install electron-packager
npm install electron-packager -g

## Run local server
ng serve

## Build and package app as .exe
ng build --base-href ./
electron-packager . --platform=win32 --arch=x64

