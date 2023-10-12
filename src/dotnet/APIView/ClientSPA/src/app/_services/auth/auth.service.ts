import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  Observable, ReplaySubject, map, share } from 'rxjs';
import { AppVersion, UserProfile } from 'src/app/_models/auth_service_models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _userProfileObservable : Observable<UserProfile> | undefined;
  baseUrl : string =  environment.apiUrl + "auth";
  constructor(private http: HttpClient) { }

  isLoggedIn() : Observable<boolean> {
    return this.http.get(this.baseUrl, { withCredentials: true }).pipe(
      map((response : any) => {
        return response.isLoggedIn;
      }));
  }

  appVersion() : Observable<AppVersion> {
    return this.http.get<AppVersion>(this.baseUrl + "/appversion", { withCredentials: true });
  }

  getUserProfile() : Observable<UserProfile> {
    if (this._userProfileObservable){
      return this._userProfileObservable;
    }
    else
    {
      this._userProfileObservable = this.http.get<UserProfile>(this.baseUrl + "/profile", { withCredentials: true }).pipe(share());
      return this._userProfileObservable;
    }
  }
}
