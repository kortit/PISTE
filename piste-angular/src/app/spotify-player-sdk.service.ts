import { Injectable } from '@angular/core';
import { SpotifyOauth2Service } from './services/spotify-oauth2.service';
import { WindowRef } from './WindowRef';
import { SpotifyService } from './services/spotify.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifyPlayerSDKService {

  player: Spotify.Player | undefined

  constructor(private spotifyService: SpotifyService, private spotifyAuthorization: SpotifyOauth2Service,
    private winRef: WindowRef){}
    
  initializePlayer(player_state_changed: (state: Spotify.PlaybackState) => void): void {
      this.winRef.nativeWindow.onSpotifyWebPlaybackSDKReady = () => {
        this.player = new Spotify.Player({
          name: 'Piste.buzz Player',
          getOAuthToken: cb => { cb(this.spotifyAuthorization.getAccessToken()); },
          volume: 0.4
        });

        this.player.addListener('ready', ({ device_id }) => {
          this.spotifyService.transferPlayback(device_id);
        });
        this.player.addListener('not_ready', ({ device_id }) => console.log('Device ID has gone offline', device_id));
        this.player.addListener('initialization_error', ({ message }) => console.error(message));
        this.player.addListener('authentication_error', ({ message }) => console.error(message));
        this.player.addListener('account_error', ({ message }) => console.error(message));
        this.player.addListener('player_state_changed', player_state_changed);
        this.player.connect();

      }
    
  }

  getPlayer() {
    return this.player;
  }
}
