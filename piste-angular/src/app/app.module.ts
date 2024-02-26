import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OAuthModule } from 'angular-oauth2-oidc';
import { ControlsComponent } from './components/controls/controls.component';
import { PlayingComponent } from './components/playing/playing.component';
import { PlayerComponent } from './components/player/player.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { WindowRef } from './WindowRef';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { GameComponent } from './game/game.component';
import { RouteReuseStrategy } from '@angular/router';
import { NoReuseStrategy } from './routeReuseStrategy';
import { CardsComponent } from './cards/cards.component';
import { TrainComponent } from './train/train.component';

@NgModule({
  declarations: [
    AppComponent,
    PlayingComponent,
    ControlsComponent,
    PlayerComponent,
    GameComponent,
    CardsComponent,
    TrainComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    OAuthModule.forRoot(),
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSliderModule,
    MatSelectModule,
    FormsModule
  ],
  providers: [WindowRef, { provide: RouteReuseStrategy, useClass: NoReuseStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
