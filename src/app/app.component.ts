import { Component, OnInit } from '@angular/core';
import { PisteService } from './piste.service';
import { SpotifyService } from './spotify.service';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { SpotifyOauth2Service } from './spotify-oauth2.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  
  constructor(private sanitizer: DomSanitizer, private pisteService: PisteService, private spotifyService: SpotifyService, private spotifyAuthorization: SpotifyOauth2Service){}

  token = 'pas encore récup';

  username: string = ''; 

  embedURI: SafeResourceUrl = '';

  ngOnInit(): void {
    if(this.spotifyAuthorization.getAccessToken()){
      this.spotifyService.getMe().subscribe(userInfo => this.username = userInfo.display_name || '');
    }    
    this.embedURI = this.sanitizer.bypassSecurityTrustResourceUrl('https://open.spotify.com/embed?uri=spotify:track:2Foc5Q5nqNiosCNqttzHof')
  }

  playClick(): void {
    this.spotifyService.play();
    this.spotifyService.getCurrentSong().subscribe(currentTrack => console.log(currentTrack));
  }

  spotifyAuthorizationClick(): void {
    this.spotifyAuthorization.performAuthorizationFlow();
  }



  

}
