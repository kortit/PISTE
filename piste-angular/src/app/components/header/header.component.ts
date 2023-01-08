import { Component, Input } from '@angular/core';
import { PisteService } from 'src/app/services/piste.service';
import { SpotifyOauth2Service } from 'src/app/services/spotify-oauth2.service';
import { SpotifyService } from 'src/app/services/spotify.service';
import { Output, EventEmitter } from '@angular/core';
import { Preference } from 'src/app/model/Preference';
import { PreferenceService } from 'src/app/services/preference.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  
  constructor(private preferenceService: PreferenceService, private spotifyService: SpotifyService, private spotifyAuthorization: SpotifyOauth2Service){}

  @Input() username: string | undefined; 

  displaySong: boolean = true;

  ngOnInit(): void {
    this.preferenceService.preference.subscribe(preference => this.displaySong = preference.displaySong)
  }

  spotifyAuthorizationClick(): void {
    this.spotifyAuthorization.startAuthorizationFlow();
  }

  onChangeDisplaySong(event: boolean): void {
    this.preferenceService.patchPreference({"displaySong": event});
  }
  
}
