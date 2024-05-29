import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { RolesService } from './service/roles.service';
import { AuthService } from './service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SC_Dev';
  userName:string = "";

  constructor(private authService: AuthService,
              private router: Router
            ) {}

  ngAfterViewChecked(): void{
    this.userName = sessionStorage.getItem("SC_USER") ? JSON.parse(sessionStorage.getItem("SC_USER") ?? '').name : ""
  }

  isLoginOrRegisterPage(): boolean {
    return this.router.url.split("/")[1] == '' || this.router.url.includes('/login') || this.router.url.includes('/register');
  }

  logout(): void{
    this.authService.logout();
  }
}
