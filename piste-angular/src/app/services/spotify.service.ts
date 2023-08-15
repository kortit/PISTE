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

  constructor(private pisteService: PisteService, private http: HttpClient, private spotifyAuthorization: SpotifyOauth2Service){}

  public play(){
    this.spotify.setAccessToken(this.spotifyAuthorization.getAccessToken());
    this.spotify.play();
  }

  public pause(){
    this.spotify.setAccessToken(this.spotifyAuthorization.getAccessToken());
    this.spotify.pause();
  }

  public next(){
    this.spotify.setAccessToken(this.spotifyAuthorization.getAccessToken());
    this.spotify.skipToNext();
  }

  public getMe(): Observable<SpotifyApi.CurrentUsersProfileResponse>{
    this.spotify.setAccessToken(this.spotifyAuthorization.getAccessToken());
    return from(this.spotify.getMe());
  }

  public getCurrentSong(): Observable<SpotifyApi.CurrentlyPlayingResponse>{
    this.spotify.setAccessToken(this.spotifyAuthorization.getAccessToken());
    return from(this.spotify.getMyCurrentPlayingTrack());
  }

  public getPlaylist(id: string): Observable<SpotifyApi.SinglePlaylistResponse>{
    this.spotify.setAccessToken(this.spotifyAuthorization.getAccessToken());
    return from(this.spotify.getPlaylist(id));
  }

  public transferPlayback(deviceId: string): Observable<void>{
    this.spotify.setAccessToken(this.spotifyAuthorization.getAccessToken());
    return from(this.spotify.transferMyPlayback([deviceId]));
  }

}
