import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { UserDto } from '../interface/UserDto';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  baseUrl: string = environment.appBaseUrl;

  constructor(private http: HttpClient) { }

  getUserRoles(): Observable<string[]>{
    return this.http.get<string[]>(`${this.baseUrl}User/GetUserRoles`);
  }

  getCurrentUserData(): UserDto{
    return JSON.parse(sessionStorage.getItem("SC_USER") ?? '') as UserDto
  }

  checkBankPermission(): Observable<boolean>{
    return this.http.get<boolean>(`${this.baseUrl}User/CheckBankPermission`);
  }

}
