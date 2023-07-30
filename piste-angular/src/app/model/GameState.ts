export class PlayerState{
    index: number=0;
    name: string = "";
    score: number = 0;
    sounds: string[] = [];
    hotkeys: string[] = [];
    buzzer: "inactive" | "speaking" | "expired" = "inactive"; // inactive, speaking, expired
    recentChangeinScore= 0;
    recentChangeTimeout: NodeJS.Timeout | undefined;
}

export class GameState {
    spotifyPlaylist: string = "";
    players: Map<number, PlayerState> = new Map();
    hotkeys: Map<string, number> = new Map();
}
