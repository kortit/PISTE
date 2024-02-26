#define MyAppVersion "2.0.4"

[Setup]
AppName=PISTE
AppVersion={#MyAppVersion}
DefaultDirName={pf}\PISTE
OutputDir=InnoSetupOutput
OutputBaseFilename=piste-installer-{#MyAppVersion}
Compression=zip

[Files]
Source: "piste\*"; DestDir: "{app}"; Flags: recursesubdirs

[Icons]
Name: "{commonprograms}\PISTE"; Filename: "{app}\piste.exe"; WorkingDir: "{app}"; IconFilename: "{app}\favicon.ico"
Name: "{commondesktop}\PISTE"; Filename: "{app}\piste.exe"; WorkingDir: "{app}"; IconFilename: "{app}\favicon.ico"
