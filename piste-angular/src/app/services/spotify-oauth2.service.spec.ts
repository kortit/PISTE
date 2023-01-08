import { TestBed } from '@angular/core/testing';

import { SpotifyOauth2Service } from './spotify-oauth2.service';

describe('SpotifyOauth2Service', () => {
  let service: SpotifyOauth2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyOauth2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
