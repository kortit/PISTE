import { Component, HostListener, OnInit } from '@angular/core';
import { GameState } from './model/GameState';
import { Preference } from './model/Preference';
import { GameService } from './services/game.service';
import { PreferenceService } from './services/preference.service';
import { SpotifyOauth2Service } from './services/spotify-oauth2.service';
import { SpotifyService } from './services/spotify.service';
import { WindowRef } from './WindowRef';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  constructor(private spotifyService: SpotifyService, private spotifyAuthorization: SpotifyOauth2Service, 
    private preferenceService: PreferenceService, private gameService: GameService, private winRef: WindowRef){}

  preference: Preference = new Preference();

  userinfo: SpotifyApi.CurrentUsersProfileResponse | undefined;

  uri: SpotifyApi.CurrentlyPlayingResponse | undefined;

  inputPlayListErrorMessage: string = '';

  EmbedController: any

  playlistRef: string = '';

  username: string | undefined; 

  gameState: GameState = new GameState();

  blocked: boolean = false;

  playing = false;

  ngOnInit(): void {
    this.spotifyAuthorization.tryCodeExchange(); 
    if(this.spotifyAuthorization.isLoggedIn()){
      this.spotifyService.getMe().subscribe(userInfo => this.userinfo = userInfo);
    }

    this.preferenceService.preference.subscribe(preference => this.preference = preference);

    this.winRef.nativeWindow.onSpotifyIframeApiReady = (IFrameAPI: any) => {
      let element = document.getElementById('spotify-iframe');
      let options = {};
      let callback = (EmbedController: any) => {
        this.EmbedController = EmbedController;
        EmbedController.addListener('playback_update', (e: any) => {
          if(this.playing==e.data.isPaused){
            console.log("now "+ (e.data.isPaused? "paused" : "playing"));
          }
          this.playing = !e.data.isPaused;
        });
      };
      IFrameAPI.createController(element, options, callback);
    };

    this.gameService.gameState.subscribe(gameState => {this.gameState = gameState, console.log("update")});
  }
/*
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEventDown(event: KeyboardEvent) { 
    event.preventDefault();
  }
*/
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEventPressed(event: KeyboardEvent) { 
    let playerBuzzer = this.gameState?.hotkeys.get(event.key?.toLocaleLowerCase());
    let blockedbefore = this.blocked;
    this.blocked = true;
    if(playerBuzzer && !blockedbefore){
      // player buzzed
      if(this.playing){
        console.log("toggle");
        this.EmbedController.togglePlay();
      }
      let player = this.gameState?.players.get(playerBuzzer);
      if(player){
        player.active = true;
        if(this.preference.playSounds){
          this.playSound(player.sounds[Math.floor(Math.random()*player.sounds.length)])
        }        
      }
    }else{
      this.blocked = blockedbefore;
    }
    switch (event.key?.toLocaleLowerCase()) {
      case " ":  
          console.log("toggle");
          event.preventDefault();
          this.EmbedController.togglePlay();
          this.deactivateAllPlayers();
          this.blocked = false;
          break;
      case "enter":  
          event.preventDefault();
          this.EmbedController.seek(1000000);     
          if(!this.playing){
            console.log("toggle before seek");
            this.EmbedController.togglePlay();
          }  
          this.deactivateAllPlayers();
          this.blocked = false;
          break;
      default:
          break;
    }
  }

  deactivateAllPlayers(){
    this.gameState.players.forEach(player => player.active = false);
  }

  removePlayer(playerIndex: number){
    this.gameService.removePlayer(playerIndex);
  }

  incrementScore(playerIndex: number){
    this.gameService.incrementScore(playerIndex);
  }
  decrementScore(playerIndex: number){
    this.gameService.incrementScore(playerIndex, -1);
  }

  spotifyAuthorizationClick(): void {
    this.spotifyAuthorization.startAuthorizationFlow();
  }

  onChangeDisplaySong(event: boolean): void {
    this.preferenceService.patchPreference({"displaySong": event});
  }
  onChangePlaySound(event: boolean): void {
    this.preferenceService.patchPreference({"playSounds": event});
  }

  onPlaylistInput(playlistRef: string): void {

    this.inputPlayListErrorMessage = "";
    let playlistId = '';

    // https://open.spotify.com/playlist/37i9dQZF1DXacPj7eARo6k?si=2021bc5b128341ed
    let regexpFullUrl = /playlist\/([A-Za-z0-9]{18,})\??/
    let id = playlistRef.match(regexpFullUrl);
    if(id && id[1]){
      playlistId=id[1]
    }
    // 37i9dQZF1DXacPj7eARo6k
    let regexpIdOnly = /^([A-Za-z0-9]{18,})\??$/
    id = playlistRef.match(regexpIdOnly);
    if(id && id[1]){
      playlistId=id[1]
    }

    if(!playlistId && playlistRef){
      this.inputPlayListErrorMessage = "Playlist Spotify non valide, donne l'URL de la playlist, par exemple https://open.spotify.com/playlist/37i9dQZF1DXacPj7eARo6k"
      return;
    }

    this.displayPlaylistIframe('spotify:playlist:'+playlistId)

  }

  displayPlaylistIframe(playlisturi: string){
    this.EmbedController.loadUri(playlisturi);
  }

  addPlayerClick(){
    this.gameService.addPlayer();
  }

  playSound(sound: string){
    let audio = new Audio();
    audio.src = "../assets/"+sound;
    audio.load();
    audio.play();
  }

}
