import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PisteService } from './piste.service';
import SpotifyWebApi from 'spotify-web-api-js';
import { from, Observable } from 'rxjs';
import { SpotifyOauth2Service } from './spotify-oauth2.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  spotify = new SpotifyWebApi();

  constructor(private pisteService: PisteService, private http: HttpClient, private spotifyAuth: SpotifyOauth2Service){}

  public play(){
    this.spotify.setAccessToken(this.spotifyAuth.getAccessToken());
    this.spotify.play();
  }

  public getMe(): Observable<SpotifyApi.CurrentUsersProfileResponse>{
    this.spotify.setAccessToken(this.spotifyAuth.getAccessToken());
    return from(this.spotify.getMe());
  }

  public getCurrentSong(): Observable<SpotifyApi.CurrentlyPlayingResponse>{
    this.spotify.setAccessToken(this.spotifyAuth.getAccessToken());
    return from(this.spotify.getMyCurrentPlayingTrack());
  }

}
