# Setup

## Requirement : node and npm installed on system
## Optional but nice : git bash, 7zip

## download npm packages
`npm install`

## If not already installed, install angular CLI
`npm install -g @angular/cli`

## Run local server
`ng serve`

# Packaging and distribution for windows from windows

## Build the .exe
`ng build`<br>
`npm run package`

## package portable distribution
`cd runtime_deps; npm install` no need to rerun this every time if dependencies have not changed<br>
`rm -rf piste; mkdir -p piste; cp -r piste.exe main.mjs runtime_deps/node_modules dist src/favicon.ico piste/`<br>
`7z a piste-portable-2.0.zip piste`

## To create a windows installer file, download InnoSetup, open the piste.iss file with InnoSetup, edit version number if required and compile. installer file is in InnoSetupOutput
Or from command line : `"C:/Program Files (x86)/Inno Setup 6/ISCC.exe" piste.iss`

