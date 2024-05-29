import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { IdentityRoles } from '../interface/IdentityRoles';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  baseUrl: string = environment.appBaseUrl;

  constructor(private http: HttpClient) { }

  getAllRoles(): Observable<IdentityRoles[]>{
    return this.http.get<IdentityRoles[]>(`${this.baseUrl}Roles/GetAllRoles`);
  }

}
