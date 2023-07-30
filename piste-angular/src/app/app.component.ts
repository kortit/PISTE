import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
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
  freestyle = false;

  userinfo: SpotifyApi.CurrentUsersProfileResponse | undefined;

  uri: SpotifyApi.CurrentlyPlayingResponse | undefined;

  inputPlayListErrorMessage: string = '';

  EmbedController: any

  playlistRef: string = '';

  playlistTitle = "";

  gameState: GameState = new GameState();

  gameTrackIds: string[] = [];
  alreadyPlayed: string[] = [];
  currentTrackId = ""

  blocked: boolean = false;

  playing = false;
  previousPositionCheck = 0;

  showTrackState: "NOT_LOADED" | "READY_TO_START" | "PLAYING" | "ANSWER" = "NOT_LOADED";

  expirationTimeout: NodeJS.Timeout | undefined;

  selectPlayerOptions: Map<string, boolean> = new Map();
  selectHotkeysOptions: Map<string, boolean> = new Map();
  lastPlayerToBuzz = -1;

  ngOnInit(): void {

    this.spotifyAuthorization.onLoginCallback( () => this.spotifyService.getMe().subscribe(userInfo => this.userinfo = userInfo));
    this.spotifyAuthorization.tryCodeExchange();

    if(this.spotifyAuthorization.isLoggedIn()){
      this.spotifyService.getMe().subscribe(userInfo => this.userinfo = userInfo);
    }

    this.preferenceService.preference.subscribe(preference => this.preference = preference);

    this.winRef.nativeWindow.onSpotifyIframeApiReady = (IFrameAPI: any) => {
      let element = document.getElementById('spotify-iframe');
      let options = {"height": 380};
      let callback = (EmbedController: any) => {
        this.EmbedController = EmbedController;
        EmbedController.addListener('playback_update', (e: any) => {
          let playingBefore = this.playing;
          // we switch to "playing" state when iframe indicates not paused and we detect actual progress in position e.data.isPaused=false and e.data.position > this.previousPositionCheck
          // we switch to not "playing" state when iframe indicates paused (progress is not reliable to indicate a real pause) e.data.isPaused=true
          if(e.data.isPaused){
            this.playing = false;
          }else{
            // on fait la vérification supplémentaire du progrés si on veuit changer l'état (si c'était déjà "playing", on reste)
            this.playing = this.playing || e.data.position > this.previousPositionCheck;
          }
          let changed = this.playing==playingBefore;
          if(changed){
            this.changeDetectorRef.detectChanges();
          }          
          if(e.data.isPaused && e.data.position==0){
            // force play at beginning of the track
            this.EmbedController.togglePlay();
          }
          this.previousPositionCheck = e.data.position;
        });
      };
      IFrameAPI.createController(element, options, callback);
    };

    this.gameService.gameState.subscribe(gameState => {
        this.gameState = gameState;
        this.selectPlayerOptions = this.gameService.getPlayerNamesWithAvailability();
        this.selectHotkeysOptions = this.gameService.geAvailableHotkeysWithAvailability();
    });

    // we prevent iframe from taking focus by resetting it on interval if it has focus.
    setInterval((_: any) => {
      if (document.activeElement?.tagName == "IFRAME") {
        (document.activeElement as HTMLElement).blur();
      }
    }, 250);

  }


  @HostListener('document:keydown', ['$event'])
  handleKeyboardEventPressed(event: KeyboardEvent) { 
    let playerBuzzer = this.gameState?.hotkeys.get(event.key?.toLocaleLowerCase());
    let blockedbefore = this.blocked;
    this.blocked = true;
    if(playerBuzzer && !blockedbefore && (this.playing || this.freestyle)){
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
        this.lastPlayerToBuzz = playerBuzzer;
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
          if(this.freestyle){
            event.preventDefault();
            this.deactivateAllPlayers();
            this.blocked = false;
            break;
          }
          if(this.showTrackState=="PLAYING"){
            // cas 1 : ça jouait et on affiche la réponse
            this.showTrackState = "ANSWER";
            this.deactivateAllPlayers();
            this.blocked = true;
          }
          else if(this.showTrackState=="READY_TO_START" || this.showTrackState=="ANSWER"){
            // cas 2 : on était sur l'affichage de la réponse (ou on n'avait pas commencé le jeu), on passe à la suite
            this.showTrackState = "PLAYING";
            this.deactivateAllPlayers();
            this.blocked = false;
            this.playing = false;
            this.nextTrack();
            this.refreshPlayerWithCurrentTrack();
          }
          event.preventDefault();          
          break;
      case "delete":
      case "del":
      case "supr":
      case "backspace":
      case "-":
        if(this.lastPlayerToBuzz>=0){
          this.gameService.incrementScore(this.lastPlayerToBuzz, -1);
        }        
        break;
      case "+":
          if(this.lastPlayerToBuzz>=0){
            this.gameService.incrementScore(this.lastPlayerToBuzz);
          }        
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

  logoutClick(): void {
    this.spotifyAuthorization.logout();
    this.userinfo = undefined;

  }

  onChangeDisplaySong(event: boolean): void {
    this.preferenceService.patchPreference({"displaySong": event});
  }
  onChangePlaySound(event: boolean): void {
    this.preferenceService.patchPreference({"playSounds": event});
  }
  onChangeShuffle(event: boolean): void {
    this.preferenceService.patchPreference({"shuffle": event});
  }
  onChangeBlingTestMode(event: boolean): void {
    
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

    if(this.playing){
      // If play is not paused when playlist is updated, we pause to prevent music playing in background
      this.EmbedController.togglePlay();
    }

    this.spotifyService.getPlaylist(playlistId).subscribe(playlist => {
      this.playlistTitle = playlist.name;
      this.gameTrackIds = playlist.tracks.items.map(track => track.track.id);
      // we start from no track and trackShown=true so that next step is to start first track
      this.showTrackState = "READY_TO_START";
    })

  }

  onPlayerNameSelected(name: any, playerIndex: number){
    this.gameService.changePlayerName(name, playerIndex);
  }

  onPlayerHotkeysSelected(hotkeys: string[], playerIndex: number){
    this.gameService.changePlayerHotkeys(hotkeys, playerIndex);
  }

  loadIframeFromSpotifyUri(uri: string, forcePlay = true){
    this.playing = false;
    this.EmbedController.loadUri(uri);
    if(forcePlay){
      this.EmbedController.play();
    }    
  }

  addPlayerClick(){
    this.gameService.addPlayer();
  }

  razScores(){
    this.gameService.razScores();
  }

  playSound(sound: string, volume = 1){
    let audio = new Audio();
    audio.src = "../assets/"+sound;
    audio.volume = volume;
    audio.load();
    audio.play();
  }

  resetFocus(){
    console.log("test")
  }

  private nextTrack(): void{
    if(!this.gameTrackIds){
      return;
    }
    let unplayedTracksIds = this.gameTrackIds.filter(id => this.alreadyPlayed.indexOf(id) < 0);
    if(unplayedTracksIds.length==0){
      // no more tracks => history reset and loop the playlist
      this.alreadyPlayed = [];
      return this.nextTrack();
    }
    const nextTrack = this.preference.shuffle ? unplayedTracksIds[Math.floor(Math.random() * unplayedTracksIds.length)] : unplayedTracksIds[0];
    this.alreadyPlayed.push(nextTrack);
    this.currentTrackId = nextTrack;
  }

  private refreshPlayerWithCurrentTrack(play = true): void{
    this.loadIframeFromSpotifyUri("spotify:track:"+this.currentTrackId, play);
  }



}
