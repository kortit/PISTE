export class PlayerState{
    name: string = "";
    score: number = 0;
    sounds: string[] = [];
    hotkeys: string[] = [];
    active: boolean = false;
}

export class GameState {
    spotifyPlaylist: string = "";
    players: Map<string, PlayerState> = new Map();
    hotkeys: Map<string, string> = new Map();
}
