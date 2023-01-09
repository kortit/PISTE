import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameState, PlayerState } from '../model/GameState';
import { Player } from '../model/Player';

export const PLAYER_BASE: Player[] = [
  {
    "name": "David1",
    "sounds": ["david1.mp4"],
    "index": 1,
    "hotkeys": ["a"]
  },
  {
    "name": "David2",
    "sounds": ["david1.mp4"],
    "index": 2,
    "hotkeys": ["z"]
  },
  {
    "name": "David3",
    "sounds": ["david1.mp4"],
    "index": 3,
    "hotkeys": ["e"]
  },
  {
    "name": "David4",
    "sounds": ["david1.mp4"],
    "index": 4,
    "hotkeys": ["r"]
  },
  {
    "name": "David5",
    "sounds": ["david1.mp4"],
    "index": 5,
    "hotkeys": ["t"]
  },
  {
    "name": "David6",
    "sounds": ["david1.mp4"],
    "index": 6,
    "hotkeys": ["y"]
  },
  {
    "name": "David7",
    "sounds": ["david1.mp4"],
    "index": 7,
    "hotkeys": ["u"]
  },
  {
    "name": "David8",
    "sounds": ["david1.mp4"],
    "index": 8,
    "hotkeys": ["i"]
  },
]
@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor() { }

  gameState: BehaviorSubject<GameState> = new BehaviorSubject(new GameState);

  setPlaylist(playlist: string){
    let gameState = this.gameState.value;
    this.gameState.next(gameState);
  }

  addPlayer(){
    console.log("add")
    let gameState = this.gameState.value;
    let existingPlayerName = Array.from(gameState.players.keys());
    for(let player of PLAYER_BASE){
      if(!existingPlayerName.includes(player.name)){
        let playerState = new PlayerState();
        playerState.name = player.name;
        playerState.score = 0;
        playerState.sounds = player.sounds;
        playerState.hotkeys = player.hotkeys;
        player.hotkeys.forEach(key => gameState.hotkeys.set(key, player.name));
        gameState.players.set(playerState.name, playerState);
        break;
      }
    }
    this.gameState.next(gameState);
  }

  incrementScore(playerName: string){
    let gameState = this.gameState.value;
    this.gameState.next(gameState);
  }

  blockPlayer(playerName: string, durationSec: number){
    let gameState = this.gameState.value;
    this.gameState.next(gameState);
  }

  unblockAllPlayers(){
    let gameState = this.gameState.value;
    this.gameState.next(gameState);
  }

  resetScores(){
    let gameState = this.gameState.value;
    this.gameState.next(gameState);
  }

}
