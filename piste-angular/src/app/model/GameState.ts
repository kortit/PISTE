export class PlayerState{
    index: number=0;
    name: string = "";
    score: number = 0;
    sounds: string[] = [];
    hotkeys: string[] = [];
    active: boolean = false;
}

export class GameState {
    spotifyPlaylist: string = "";
    players: Map<number, PlayerState> = new Map();
    hotkeys: Map<string, number> = new Map();
}
