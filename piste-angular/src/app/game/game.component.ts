///  <reference types="@types/spotify-web-playback-sdk"/>
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, isDevMode } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { GameState } from '../model/GameState';
import { Preference } from '../model/Preference';
import { GameService } from '../services/game.service';
import { PreferenceService } from '../services/preference.service';
import { SpotifyOauth2Service } from '../services/spotify-oauth2.service';
import { SpotifyService } from '../services/spotify.service';
import { WindowRef } from '../WindowRef';
import { version } from 'src/version';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyPlayerSDKService } from '../spotify-player-sdk.service';

@Component({
  selector: 'game-root',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy{

  constructor(private spotifyService: SpotifyService, private spotifyPlayerSDKService: SpotifyPlayerSDKService, private spotifyAuthorization: SpotifyOauth2Service,
    private preferenceService: PreferenceService, private gameService: GameService, private winRef: WindowRef, private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute, private router: Router){}


  devMode = isDevMode();

  version = version;
  preference: Preference = new Preference();
  playMode: "SPOTIFY" | "FREESTYLE" | "NAVIGATEUR" = "SPOTIFY";
  includeOnePiece = false;
  userinfo: SpotifyApi.CurrentUsersProfileResponse | undefined;

  uri: SpotifyApi.CurrentlyPlayingResponse | undefined;

  inputPlayListErrorMessage: string = '';

  EmbedController: any
  player: Spotify.Player | undefined
  lastKnownPlayerState: Spotify.PlaybackState | null | undefined;

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
      this.init();
  }

  ngOnDestroy() {
    console.log("Disconnecting local spotify player");
    this.player?.disconnect();
    this.EmbedController?.destroy();
  }

  init(){

    console.log("set oauthRedirectUrl to " +this.router.url);
    localStorage.setItem('oauthRedirectUrl', this.router.url);

    // DEV init
    let mode = this.route.snapshot.paramMap.get('mode');
    switch (mode?.toLowerCase()) {
      case 'navigateur'.toLowerCase():
        this.playMode = "NAVIGATEUR";
        break;
      case 'spotify'.toLowerCase():
        this.playMode = "SPOTIFY";
        break;
      case 'freestyle'.toLowerCase():
        this.playMode = "FREESTYLE";
        break;
    }
    if(this.devMode && this.playMode=="NAVIGATEUR"){
      this.playlistRef="https://open.spotify.com/playlist/37i9dQZF1DX0zyaFj8e28t";
      this.onPlaylistInput("https://open.spotify.com/playlist/37i9dQZF1DX0zyaFj8e28t");
    }

    if (this.playMode == 'SPOTIFY') {
      this.spotifyPlayerSDKService.initializePlayer( state => {
        console.log('Currently Playing', state.track_window.current_track);
        if (this.showTrackState == "READY_TO_START") {
          this.spotifyPlayerSDKService.getPlayer()?.pause();
        }
        if (this.showTrackState == "NOT_LOADED") {
          this.showTrackState = "READY_TO_START";
        }
        this.playlistTitle = state?.context.metadata?.name || "";
        this.lastKnownPlayerState = state;
        this.playing = !state?.paused;
        this.EmbedController.loadUri(state.track_window.current_track.uri);
      });
    }

    this.winRef.nativeWindow.onSpotifyIframeApiReady = (IFrameAPI: any) => {
      let element = document.getElementById('spotify-iframe');
      let options = {"height": 380};
      let callback = (EmbedController: any) => {
        const iframes : HTMLCollectionOf<HTMLIFrameElement> = document.getElementsByTagName("iframe");
        for (var i = 0; i < iframes.length; i++) {
          iframes[i].setAttribute("allow", "autoplay; clipboard-write; encrypted-media 'self' https://open.spotify.com https://embed-standalone.spotify.com; fullscreen; picture-in-picture");
        }
        this.EmbedController = EmbedController;
        
        if(this.playMode=='NAVIGATEUR'){
          console.log("setup frame listener");
          EmbedController.addListener('playback_update', (e: any) => {
            console.log("frame updated. New state:");
            console.log(e);
            let playingBefore = this.playing;
            // we switch to "playing" state when iframe indicates not paused and we detect actual progress in position e.data.isPaused=false and e.data.position > this.previousPositionCheck
            // we switch to not "playing" state when iframe indicates paused (progress is not reliable to indicate a real pause) e.data.isPaused=true
            if(e.data.isPaused){
              console.log("frame is paused");
              this.playing = false;
            }else{
              // on fait la vérification supplémentaire du progrés si on veuit changer l'état (si c'était déjà "playing", on reste)
              this.playing = this.playing || e.data.position > this.previousPositionCheck;
            }
            let changed = this.playing==playingBefore;
            if(changed){
              console.log("Switching playing to "+this.playing+" (was "+playingBefore+")");
              this.changeDetectorRef.detectChanges();
            }          
            if(e.data.isPaused && e.data.position==0){
              // force play at beginning of the track
              this.EmbedController.togglePlay();
            }
            this.previousPositionCheck = e.data.position;
          });
        }
        
      };
      IFrameAPI.createController(element, options, callback);
    };

    

    this.spotifyAuthorization.onLoginCallback( () => this.spotifyService.getMe().subscribe(userInfo => this.userinfo = userInfo));
    this.spotifyAuthorization.tryCodeExchange();
    
    if(this.spotifyAuthorization.isLoggedIn()){
      this.spotifyService.getMe().subscribe(userInfo => this.userinfo = userInfo);
    }

    this.preferenceService.preference.subscribe(preference => this.preference = preference);

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
    console.log("pressed "+event.key?.toLocaleLowerCase())
    let playerBuzzer = this.gameState?.hotkeys.get(event.key?.toLocaleLowerCase());
    let blockedbefore = this.blocked;
    this.blocked = true;
    if(playerBuzzer && !blockedbefore && (this.playing || this.playMode=='FREESTYLE')){
      // player buzzed
      this.pausePlay()
      let gamePlayer = this.gameState?.players.get(playerBuzzer);
      if(gamePlayer){
        gamePlayer.buzzer = "speaking";
        if(this.preference.playSounds){
          let sound = gamePlayer?.sounds[Math.floor(Math.random()*gamePlayer.sounds.length)];
          setTimeout(() => {
            this.playSound(sound)
          }, 600);          
        }        
        this.lastPlayerToBuzz = playerBuzzer;
      }
      if(this.expirationTimeout){
        clearTimeout(this.expirationTimeout);
      }
      if(this.preference.expirationTime){
        this.expirationTimeout = setTimeout(() => {
          if(gamePlayer && gamePlayer.buzzer=="speaking"){
            console.log("speaking expired");
            gamePlayer.buzzer = "expired";
            this.playSound("expiration.wav", 0.3);
          }        
        }, this.preference.expirationTime * 1000);
      }     
      
    }else{
      this.blocked = blockedbefore;
    }
    switch (event.key?.toLocaleLowerCase()) {
      case " ":  
        console.log("pressed space")
          event.preventDefault();
          this.togglePlay();
          this.deactivateAllPlayers();
          this.blocked = false;
          break;
      case "enter":  
          if(this.playMode=='FREESTYLE'){
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
            this.player?.nextTrack();
            //this.player?.resume();
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
  pausePlay(){
    if(this.playMode=='NAVIGATEUR' && this.playing){
      this.EmbedController.togglePlay();
    }
    if(this.playMode=='SPOTIFY'){
      this.spotifyService.pause();
    }
  }
  togglePlay(){
    console.log("toggle play");
    if(this.playMode=='NAVIGATEUR'){
      console.log("toggle play on frame");
      this.EmbedController.togglePlay();
    }
    if(this.playMode=='SPOTIFY'){
      console.log("toggle play on spotify")
      this.player?.togglePlay();
    }
  }

  nextPlay(){
    if(this.playMode=='NAVIGATEUR'){
      this.EmbedController.next();
    }
    if(this.playMode=='SPOTIFY'){
      this.player?.nextTrack();
    }
  }

  onModeChange(mode: string): void {
    console.log('navigate to '+'/play/'+mode.toLowerCase())
    this.router.navigate(['/play/'+mode.toLowerCase()]);
    location.reload();
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

  routeToTrain(){
    this.router.navigate(['/train']);
  }

  private nextTrack(): void{
    if(!this.gameTrackIds){
      return;
    }
    if(this.playMode!='NAVIGATEUR'){
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
