#define MyAppVersion "1.0.5"

[Setup]
AppName=PISTE
AppVersion={#MyAppVersion}
DefaultDirName={pf}\PISTE
OutputDir=InnoSetupOutput
OutputBaseFilename=piste-installer-{#MyAppVersion}

[Files]
Source: "piste-win32-x64\*"; DestDir: "{app}"; Flags: recursesubdirs

[Icons]
Name: "{commonprograms}\PISTE"; Filename: "{app}\piste.exe"; WorkingDir: "{app}"
Name: "{commondesktop}\PISTE"; Filename: "{app}\piste.exe"; WorkingDir: "{app}"
