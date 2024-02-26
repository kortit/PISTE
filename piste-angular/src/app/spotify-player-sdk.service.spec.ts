import { TestBed } from '@angular/core/testing';

import { SpotifyPlayerSDKService } from './spotify-player-sdk.service';

describe('SpotifyPlayerSDKService', () => {
  let service: SpotifyPlayerSDKService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyPlayerSDKService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
