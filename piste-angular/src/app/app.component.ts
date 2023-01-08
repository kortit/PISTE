import { Component, HostListener, OnInit } from '@angular/core';
import { Preference } from './model/Preference';
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

  constructor(private spotifyService: SpotifyService, private spotifyAuthorization: SpotifyOauth2Service, private preferenceService: PreferenceService, private winRef: WindowRef){}

  preference: Preference = new Preference();

  userinfo: SpotifyApi.CurrentUsersProfileResponse | undefined;

  uri: SpotifyApi.CurrentlyPlayingResponse | undefined;

  uriPlayList = "spotify:playlist:37i9dQZF1DXacPj7eARo6k";

  EmbedController: any

  playlistRef: string = '';

  ngOnInit(): void {
    this.spotifyAuthorization.tryCodeExchange(); 
    if(this.spotifyAuthorization.isLoggedIn()){
      this.spotifyService.getMe().subscribe(userInfo => this.userinfo = userInfo);
    }
    this.preferenceService.preference.subscribe(preference => this.preference = preference);
    this.refreshCurrentlyPlaying();

    this.winRef.nativeWindow.onSpotifyIframeApiReady = (IFrameAPI: any) => {
      let element = document.getElementById('spotify-iframe');
      let options = {};
      let callback = (EmbedController: any) => {this.EmbedController = EmbedController};
      IFrameAPI.createController(element, options, callback);
    };
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    switch (event.key?.toLocaleLowerCase()) {
      case "a":
      case "b":  
          this.spotifyService.pause();
          break;
      case " ":  
          this.EmbedController.togglePlay();
          break;
      default:
          console.log("'"+event.key?.toLocaleLowerCase()+"' pressed");
          break;
    }
  }

  onPlaylistInput(playlistRef: string): void {
    // https://open.spotify.com/playlist/37i9dQZF1DXacPj7eARo6k?si=2021bc5b128341ed
    let regexp = /playlist\/([A-Za-z0-9])+\??/g
    let id = playlistRef.match(regexp);
    if(id){
      console.log(id);
    }else{
      console.log("pas ok");
    }
  }

  displayPlaylistIframe(playlisturi: string){
    this.EmbedController.loadUri('spotify:playlist:7makk4oTQel546B0PZlDM5');
  }

  nextClick(): void{
    this.spotifyService.next();
    setTimeout(() => {
      this.refreshCurrentlyPlaying();
    }, 700);
    setTimeout(() => {
      this.refreshCurrentlyPlaying();
    }, 2000);
  }

  refreshCurrentlyPlaying(){
    //this.spotifyService.getCurrentSong().subscribe(track => this.currentlyPlaying = track);
  }

}
