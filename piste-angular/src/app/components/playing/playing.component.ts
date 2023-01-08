import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-playing',
  templateUrl: './playing.component.html',
  styleUrls: ['./playing.component.scss']
})
export class PlayingComponent implements OnChanges{

  constructor(private sanitizer: DomSanitizer, private spotifyService: SpotifyService){}
  
  
  @Input() uri: string | undefined;

  embedURI: SafeResourceUrl | undefined;

  ngOnInit(): void {
    this.embedURI = this.uri ? this.sanitizer.bypassSecurityTrustResourceUrl('https://open.spotify.com/embed?uri='+this.uri) : undefined;
  }

  ngOnChanges(changes: SimpleChanges): void {
    let uri = changes['uri'].currentValue;
    this.embedURI = uri ? this.sanitizer.bypassSecurityTrustResourceUrl('https://open.spotify.com/embed?uri='+uri) : undefined
  }

}
