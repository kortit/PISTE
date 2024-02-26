import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preference } from '../model/Preference';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  constructor() {
    this.loadPreference();
   }
  
  preferenceSubject: BehaviorSubject<Preference> = new BehaviorSubject<Preference>(new Preference());
  preference: Observable<Preference> = this.preferenceSubject.asObservable();

  loadPreference(): void {
    let preference = localStorage.getItem('piste-preferences');
    if(preference){
      this.preferenceSubject.next(JSON.parse(preference));
    }
  }

  updatePreference(preference: Preference): void {
    this.preferenceSubject.next(preference);
  }

  patchPreference(preference: any): void {
    let newPreference = Object.assign(this.preferenceSubject.value, preference);
    localStorage.setItem('piste-preferences', JSON.stringify(newPreference));
    this.updatePreference(newPreference);
  }
  
}
