import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { UserDto } from '../interface/UserDto';
import { ResponseDto } from '../interface/ResponseDto';
import { LoginDto } from '../interface/LoginDto';
import { LoginResponseDto } from '../interface/LoginResponseDto';
import { Router } from '@angular/router';
import { CompanyValidationDto } from '../interface/CompanyValidationDto';
import { CompanyValidationResponseDto } from '../interface/CompanyValidationResponseDto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public isAuthenticated: boolean = (sessionStorage.getItem("SC_USER") && sessionStorage.getItem("SC_TOKEN")) ? true : false;

  appBaseUrl: string = environment.appBaseUrl;

  constructor(private http: HttpClient,
              private router: Router
            ) {}
  
  login(loginDto: LoginDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.appBaseUrl}Auth/Login`, loginDto);
  }

  setAuthentication(isAuthenticated: boolean): void{
    if(!isAuthenticated){
      sessionStorage.removeItem("SC_TOKEN");
      sessionStorage.removeItem("SC_USER")
    }
    this.isAuthenticated = isAuthenticated;
  }

  logout(): void{
    this.setAuthentication(false);
    this.router.navigate(['/']);
  }

  register(userDto: UserDto): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(`${this.appBaseUrl}Auth/Register`, userDto);
  }

  validateCompany(key: CompanyValidationDto): Observable<CompanyValidationResponseDto> {
    return this.http.post<CompanyValidationResponseDto>(`${this.appBaseUrl}Auth/ValidateCompany`, key);
  }



}
