import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameState, PlayerState } from '../model/GameState';
import { Player } from '../model/Player';

export const PLAYER_SOUNDS: Map<string, string[]> = 
  new Map([
    ["David", ["david_1.wav", "david_2.wav", "david_3.wav"]],
    ["Benjam", ["benjam_1.wav", "benjam_2.wav", "benjam_3.wav"]],
    ["Le Saumon", ["le_saumon_1.wav", "le_saumon_2.wav", "le_saumon_3.wav", "le_saumon_4.wav", "le_saumon_5.wav"]],
    ["Lebron James", ["lebron_1.wav", "lebron_2.wav", "lebron_3.wav", "lebron_4.wav", "lebron_5.wav"]],
    ["Neo", ["neo_1.wav", "neo_2.wav", "neo_3.wav"]],
    ["Les Bleus", ["les_bleus_1.wav"]],
    ["La Dream Team", ["la_dream_team_1.wav"]],
    ["les Saumons", ["les_saumons_1.wav", "les_saumons_2.wav", "les_saumons_3.wav", "les_saumons_4.wav", "les_saumons_5.wav", ]],
  ]);


export const HOTKEYS: string[] = ["a","z","e","r","t","y","u","i","o","p",
                                  "q","s","d","f","g","h","j","k","l","m",
                                  "w","x","c","v","b","n"];


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
    let gameState = this.gameState.value;
    let existingPlayerNames = Array.from(gameState.players.values()).map(p => p.name);
    let existingPlayerIndex = Array.from(gameState.players.values()).map(p => p.index);
    let existingPlayerHotkeys = Array.from(gameState.players.values()).flatMap(p => p.hotkeys);
    let availableName = Array.from(PLAYER_SOUNDS.keys()).filter(p => !existingPlayerNames.includes(p))[0];
    let availableIndex = existingPlayerIndex.length==0 ? 1 : Math.max(...existingPlayerIndex) + 1;
    let availableHotkeys = HOTKEYS.filter(h => !existingPlayerHotkeys.includes(h));
    let availableHotkey = availableHotkeys.length == 0 ? "" : availableHotkeys[0];
    let playerState = new PlayerState();
    playerState.name = availableName;
    playerState.index = availableIndex;
    playerState.score = 0;
    playerState.sounds = PLAYER_SOUNDS.get(availableName) || [];
    playerState.hotkeys = [availableHotkey];
    playerState.hotkeys.forEach(key => gameState.hotkeys.set(key, playerState.index));
    gameState.players.set(playerState.index, playerState);
    this.gameState.next(gameState);
  }

  removePlayer(playerIndex: number){
    let gameState = this.gameState.value;
    let playerToRemove = gameState.players.get(playerIndex);
    if(!playerToRemove){
      return;
    }
    gameState.players.delete(playerIndex);
    playerToRemove.hotkeys.forEach(h => gameState.hotkeys.delete(h));
    this.gameState.next(gameState);
  }

  changePlayerName(newName: string, playerIndex: number){
    let gameState = this.gameState.value;
    let playerToAlter = gameState.players.get(playerIndex);
    if(!playerToAlter){
      return;
    }
    playerToAlter.name = newName;
    playerToAlter.sounds = PLAYER_SOUNDS.get(playerToAlter.name) || [];
    this.gameState.next(gameState);
  }

  changePlayerHotkeys(newHotkeys: string[], playerIndex: number){
    let gameState = this.gameState.value;
    let playerToAlter = gameState.players.get(playerIndex);
    if(!playerToAlter){
      return;
    }
    playerToAlter.hotkeys = newHotkeys;
    gameState.hotkeys.forEach((value: number, key: string) => {
      if(value==playerIndex){
        gameState.hotkeys.delete(key);
      }
    });
    newHotkeys.forEach(h => gameState.hotkeys.set(h, playerIndex));
    this.gameState.next(gameState);
  }

  getPlayerNamesWithAvailability(){
    let playingPlayerNames = Array.from(this.gameState.value.players.values()).map(player => player.name);
    return new Map(Array.from(PLAYER_SOUNDS.keys()).map(p => [p, !playingPlayerNames.includes(p)]));
  }

  geAvailableHotkeysWithAvailability(){
    let activeHotkeys = Array.from(this.gameState.value.hotkeys.keys());
    return new Map(HOTKEYS.map(p => [p, !activeHotkeys.includes(p)]));
  }

  incrementScore(playerIndex: number, increment:number = 1){
    let gameState = this.gameState.value;
    let player = gameState.players.get(playerIndex);
    if(player){
      player.score += increment;
    }
    this.gameState.next(gameState);
  }

  resetScores(){
    let gameState = this.gameState.value;
    this.gameState.next(gameState);
  }

}
