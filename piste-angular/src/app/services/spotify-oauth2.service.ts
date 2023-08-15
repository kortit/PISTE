import { Injectable } from '@angular/core';
import { AuthConfig, LoginOptions, OAuthEvent, OAuthService } from 'angular-oauth2-oidc';
import { Observer } from 'rxjs';


const authCodeFlowConfig: AuthConfig = {
      tokenEndpoint: 'https://accounts.spotify.com/api/token',
      loginUrl: 'https://accounts.spotify.com/authorize',
      requireHttps: false,
      oidc: false,
      redirectUri: window.location.origin,
      clientId: 'a390827581254150accfba45ba921e39',
      responseType: 'code',
      scope: 'streaming user-read-email user-read-private',
      showDebugInformation: true      
};

@Injectable({
  providedIn: 'root'
})
export class SpotifyOauth2Service {

  constructor(private oauthService: OAuthService) { }

  startAuthorizationFlow(){
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.initCodeFlow();
  }

  tryCodeExchange(){
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.tryLogin();
    this.oauthService.setupAutomaticSilentRefresh();
  }

  onLoginCallback(callback: () => void){
    this.oauthService.events.subscribe(event => {
      if(event.type == "token_received"){
        callback();
      }
    });
  }

  logout(){
    this.oauthService.logOut();
  }

  getAccessToken(){
    return this.oauthService.getAccessToken();
  }

  isLoggedIn(): boolean{
    return this.oauthService.hasValidAccessToken();
  }
  
}
