# Setup

## Requirement : node and npm installed on system
## Optional but nice : git bash, 7zip

## download npm packages
`npm install`

## If not already installed, install angular CLI
`npm install -g @angular/cli`

## To package app to .exe, If not already installed, install electron-packager
`npm install -g electron-packager`

## Run local server
`ng serve`

# Packaging and distribution for windows from windows

## Build the .exe
`ng build`<br>
`electron-packager . piste --platform=win32 --arch=x64 --icon=src/favicon.ico --ignore=InnoSetupOutput --ignore=.angular --ignore=.vscode --ignore=piste-portable --overwrite`

## package portable distribution
`cp -r piste-win32-x64 piste`<br>
`7z a piste-portable-1.0.zip piste`

## To create a windows installer file, download InnoSetup, open the piste.iss file with InnoSetup, edit version number if required and compile. installer file is in InnoSetupOutput
Or from command line : `"C:/Program Files (x86)/Inno Setup 6/ISCC.exe" piste.iss`

