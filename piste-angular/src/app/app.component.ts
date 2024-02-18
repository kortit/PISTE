import { Component } from "@angular/core";
import { SpotifyService } from "./services/spotify.service";
import { SpotifyOauth2Service } from "./services/spotify-oauth2.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {


  constructor(private spotifyService: SpotifyService, private spotifyAuthorization: SpotifyOauth2Service, private router: Router){}

  userinfo: SpotifyApi.CurrentUsersProfileResponse | undefined;


  ngOnInit(): void {
    this.spotifyAuthorization.onLoginCallback( () => this.spotifyService.getMe().subscribe((userInfo: SpotifyApi.CurrentUsersProfileResponse | undefined) => this.userinfo = userInfo));
    this.spotifyAuthorization.tryCodeExchange();
    let redirectUrl = localStorage.getItem('oauthRedirectUrl');
    if (redirectUrl) {
      console.log('redirecting to', redirectUrl);
      this.router.navigateByUrl(redirectUrl);
    }else{
      this.router.navigateByUrl("/play/navigateur");
    }
  }

}
