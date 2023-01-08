import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preference } from '../model/Preference';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  constructor() { }
  
  preferenceSubject: BehaviorSubject<Preference> = new BehaviorSubject<Preference>(new Preference());
  preference: Observable<Preference> = this.preferenceSubject.asObservable();

  updatePreference(preference: Preference): void {
    this.preferenceSubject.next(preference);
  }

  patchPreference(preference: any): void {
    let newPreference = Object.assign(this.preferenceSubject.value, preference);
    this.updatePreference(newPreference);
  }
  
}
