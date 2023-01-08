import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccessToken } from './model/AccessToken';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PisteService {

  constructor(private http: HttpClient) { }

  spotifyAccessTokens = new Map<string, string>();

  getAccessToken(account: string): Observable<string> {
    if(this.spotifyAccessTokens.get(account)){
      return of(this.spotifyAccessTokens.get(account) || 'fail');
    }
    var responseObservable = this.http.get<AccessToken>('http://localhost:8080/spotify-account/david/token')
      .pipe(map(tokenObject => tokenObject.accessToken));
    responseObservable.subscribe(token => this.spotifyAccessTokens.set(account, token))
    return responseObservable;

  }

}
