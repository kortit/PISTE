import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { SpotifyService } from '../services/spotify.service';
import { SpotifyOauth2Service } from '../services/spotify-oauth2.service';
import { PreferenceService } from '../services/preference.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyPlayerSDKService } from '../spotify-player-sdk.service';
import { WindowRef } from '../WindowRef';
import { Preference } from '../model/Preference';

@Component({
  selector: 'app-train',
  templateUrl: './train.component.html',
  styleUrls: ['./train.component.scss']
})
export class TrainComponent implements OnInit{

  constructor(private spotifyService: SpotifyService, private spotifyPlayerSDKService: SpotifyPlayerSDKService, private spotifyAuthorization: SpotifyOauth2Service,
    private preferenceService: PreferenceService, private winRef: WindowRef, private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute, private router: Router){}
    
  preference: Preference = new Preference();
  userinfo: SpotifyApi.CurrentUsersProfileResponse | undefined;
  currentlyPlayingFullTextSpeech = "";
  announceTimeout: any;
  skipTimeout: any;
  progressUpdateInterval: any;
  isPlaying = false;
  albumCover = "";
  progressValue = 0;
  progressMaxCall = 30000;
  progressMax = 100000;
  showAnswer = false;
  answerTitle = "";
  answerArtists = "";
  previousState: Spotify.PlaybackState | undefined;

  ngOnInit(): void {
    console.log("set oauthRedirectUrl to " +this.router.url);
    localStorage.setItem('oauthRedirectUrl', this.router.url);

    this.spotifyAuthorization.onLoginCallback( () => this.spotifyService.getMe().subscribe(userInfo => this.userinfo = userInfo));
    this.spotifyAuthorization.tryCodeExchange();
    if(this.spotifyAuthorization.isLoggedIn()){
      this.spotifyService.getMe().subscribe(userInfo => this.userinfo = userInfo);
    }

    this.preferenceService.preference.subscribe(preference => this.preference = preference);


    this.spotifyPlayerSDKService.initializePlayer((state: Spotify.PlaybackState) => {

      if(this.previousState != undefined && this.previousState.track_window.current_track.id != state.track_window.current_track.id){
        this.showAnswer = false;
      }
      this.previousState = state;
      console.log(state);
      this.isPlaying = !state.paused;
      this.albumCover = state.track_window.current_track.album.images[0].url;
      this.currentlyPlayingFullTextSpeech = this.buildTextToSpeechFromPlayerState(state);      
      this.answerTitle = state.track_window.current_track.name;
      this.answerArtists = state.track_window.current_track.artists.map(a => a.name).join(' + ');
       
      this.updateTimeouts(state);
      this.computeProgress(state);
      this.changeDetectorRef.detectChanges();  

    });
  }

  onChangeCallAtSec(event: number): void {
    this.preferenceService.patchPreference({"trainCallAtSec": event});
    this.spotifyPlayerSDKService.getPlayer()?.getCurrentState().then(state => {
      if(state!=null){
        this.updateTimeouts(state);
        this.computeProgress(state);
      }
    });
  }
  onChangeSkipAtSec(event: number): void {
    this.preferenceService.patchPreference({"trainSkipAtSec": event});
    this.spotifyPlayerSDKService.getPlayer()?.getCurrentState().then(state => {
      if(state!=null){
        this.updateTimeouts(state);
        this.computeProgress(state);
      }
    });
  }

  updateTimeouts(state: Spotify.PlaybackState){
    clearTimeout(this.announceTimeout);
    clearTimeout(this.skipTimeout);
    let announceIn = this.preference.trainCallAtSec>0 && this.preference.trainCallAtSec<=30 ? 
      this.preference.trainCallAtSec*1000 - state.position + 50 : -1;
    let skipIn = this.preference.trainSkipAtSec*1000 - state.position + 50;
    this.skipTimeout = setTimeout(() => {
      this.skipIfOk();
    }, skipIn);
    if(announceIn > 50 && state.paused == false){ 
      this.announceTimeout = setTimeout(() => {
        this.announceCurrentlyPlaying(false, () => {  
          this.spotifyPlayerSDKService.getPlayer()?.resume();
        });
      }, announceIn);
    }
  }

  computeProgress(state: Spotify.PlaybackState){
    this.progressValue = state.position;
    this.progressMax = this.preference.trainSkipAtSec>0 ? this.preference.trainSkipAtSec*1000 : state.duration;
    if(this.preference.trainCallAtSec>0 && this.preference.trainCallAtSec<=30){
      this.progressMaxCall = this.preference.trainCallAtSec*1000;
    }else{
      this.progressMaxCall = 0;
    }
    clearInterval(this.progressUpdateInterval);
    if(!state.paused){
      this.progressUpdateInterval = setInterval(() => {
        this.progressValue += 100;
        this.changeDetectorRef.detectChanges();
      }, 100);
    }
  }
  

  spotifyAuthorizationClick(): void {
    this.spotifyAuthorization.startAuthorizationFlow();
  }

  logoutClick(): void {
    this.spotifyAuthorization.logout();
    this.userinfo = undefined;
  }

  announceCurrentlyPlaying(atEnd=false, afterAnnonceCallback: () => void = () => {}){
    this.spotifyPlayerSDKService.getPlayer()?.pause();
    this.showAnswer = true;
    const utterance = new SpeechSynthesisUtterance((atEnd ? "C'était " : "") + this.currentlyPlayingFullTextSpeech);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.2;
    utterance.onend = afterAnnonceCallback;
    window.speechSynthesis.speak(utterance);
  }

  togglePlay(){ 
    this.spotifyPlayerSDKService.getPlayer()?.togglePlay();
  }
  prevSong(){ 
    this.spotifyPlayerSDKService.getPlayer()?.previousTrack();
  }
  nextSong(){ 
    this.spotifyPlayerSDKService.getPlayer()?.nextTrack();
  } 
  
  routeToGame(){
    this.router.navigate(['/play/navigateur']);
  }

  buildTextToSpeechFromPlayerState(state: Spotify.PlaybackState): string {  
    let artists = state.track_window.current_track.artists.map(a => "\""+a.name+"\"");
    let artistsListText = artists[0];
    if (artists.length > 1) {
      let allButLast = artists.slice(0, -1).join(', ');
      let last = artists.slice(-1);
      artistsListText = [allButLast, last].join(' et ');
    }
    return "\"" + state.track_window.current_track.name + "\" par " + artistsListText;
  }

  skipIfOk(){
    this.spotifyPlayerSDKService.getPlayer()?.getCurrentState().then(state => { 
      if(state==null || state?.paused == true || this.preference.trainSkipAtSec==0){
        return;
      }
      if(state.position > this.preference.trainSkipAtSec*1000){
        if(this.preference.trainCallAtSec>30){
          this.announceCurrentlyPlaying(true, () => {  
            this.spotifyPlayerSDKService.getPlayer()?.nextTrack();
          });
        }else{
          this.spotifyPlayerSDKService.getPlayer()?.nextTrack();
        }
      }
    });
  }

  getProgressBarBackground() {
    let percentIntermediatePoint = 100*this.progressMaxCall/this.progressMax;
    return `linear-gradient(to right, #9b4e15 ${percentIntermediatePoint}%, black ${percentIntermediatePoint}%)`;
  }
}
