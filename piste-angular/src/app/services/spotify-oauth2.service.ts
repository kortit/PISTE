import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';


const authCodeFlowConfig: AuthConfig = {
      tokenEndpoint: 'https://accounts.spotify.com/api/token',
      loginUrl: 'https://accounts.spotify.com/authorize',
      requireHttps: false,
      oidc: false,
      redirectUri: window.location.origin,
      clientId: 'a390827581254150accfba45ba921e39',
      responseType: 'code',
      scope: 'user-read-playback-state user-modify-playback-state user-read-playback-position app-remote-control streaming user-read-email',
      showDebugInformation: true,
      
};

@Injectable({
  providedIn: 'root'
})
export class SpotifyOauth2Service {

  constructor(private oauthService: OAuthService) { }

  startAuthorizationFlow(){
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.initCodeFlow();
    this.oauthService.tryLoginCodeFlow();
  }

  tryCodeExchange(){
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.tryLoginCodeFlow();
  }

  getAccessToken(){
    return this.oauthService.getAccessToken();
  }

  isLoggedIn(){
    return !!this.oauthService.getAccessToken();
  }
  
}
