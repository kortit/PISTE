import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
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
    private preferenceService: PreferenceService, private gameService: GameService, private winRef: WindowRef, private changeDetectorRef: ChangeDetectorRef){}

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

  expirationTimeout: NodeJS.Timeout | undefined;

  selectPlayerOptions: Map<string, boolean> = new Map();
  selectHotkeysOptions: Map<string, boolean> = new Map();

  ngOnInit(): void {
    this.spotifyAuthorization.tryCodeExchange(); 
    if(this.spotifyAuthorization.isLoggedIn()){
      this.spotifyService.getMe().subscribe(userInfo => this.userinfo = userInfo);
    }

    this.preferenceService.preference.subscribe(preference => this.preference = preference);

    this.winRef.nativeWindow.onSpotifyIframeApiReady = (IFrameAPI: any) => {
      let element = document.getElementById('spotify-iframe');
      let options = {"height": 500};
      let callback = (EmbedController: any) => {
        this.EmbedController = EmbedController;
        EmbedController.addListener('playback_update', (e: any) => {
          let changed = this.playing==e.data.isPaused;
          this.playing = !e.data.isPaused;
          if(changed){
            this.changeDetectorRef.detectChanges();
          }          
          if(e.data.isPaused && e.data.position==0){
            // force play at beginning of the track
            this.EmbedController.togglePlay();
          }
        });
      };
      IFrameAPI.createController(element, options, callback);
    };

    this.gameService.gameState.subscribe(gameState => {
        this.gameState = gameState;
        this.selectPlayerOptions = this.gameService.getPlayerNamesWithAvailability();
        this.selectHotkeysOptions = this.gameService.geAvailableHotkeysWithAvailability();
    });
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
        this.EmbedController.togglePlay();
      }
      let player = this.gameState?.players.get(playerBuzzer);
      if(player){
        player.buzzer = "speaking";
        if(this.preference.playSounds){
          this.playSound(player.sounds[Math.floor(Math.random()*player.sounds.length)])
        }        
        
      }
      if(this.expirationTimeout){
        clearTimeout(this.expirationTimeout);
      }
      if(this.preference.expirationTime){
        this.expirationTimeout = setTimeout(() => {
          if(player && player.buzzer=="speaking"){
            console.log("speaking expired");
            player.buzzer = "expired";
            this.playSound("expiration.wav", 0.3);
          }        
        }, this.preference.expirationTime * 1000);
      }     
      
    }else{
      this.blocked = blockedbefore;
    }
    switch (event.key?.toLocaleLowerCase()) {
      case " ":  
          event.preventDefault();
          this.EmbedController.togglePlay();
          this.deactivateAllPlayers();
          this.blocked = false;
          break;
      case "enter":  
          event.preventDefault();
          this.EmbedController.seek(1000000);   
          this.deactivateAllPlayers();
          this.blocked = false;
          break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        this.gameService.incrementScore(parseInt(event.key?.toLocaleLowerCase()));
        break;
      default:
        break;
    }
  }

  deactivateAllPlayers(){    
    this.gameState.players.forEach(player => player.buzzer = "inactive");
    this.blocked = false;
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

  onPlayerNameSelected(name: any, playerIndex: number){
    this.gameService.changePlayerName(name, playerIndex);
  }

  onPlayerHotkeysSelected(hotkeys: string[], playerIndex: number){
    this.gameService.changePlayerHotkeys(hotkeys, playerIndex);
  }

  displayPlaylistIframe(playlisturi: string){
    this.EmbedController.loadUri(playlisturi);
  }

  addPlayerClick(){
    this.gameService.addPlayer();
  }

  playSound(sound: string, volume = 1){
    let audio = new Audio();
    audio.src = "../assets/"+sound;
    audio.volume = volume;
    audio.load();
    audio.play();
  }

}
