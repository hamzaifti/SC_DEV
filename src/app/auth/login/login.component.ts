import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApplicationUser } from 'src/app/interface/ApplicationUser';
import { LoginDto } from 'src/app/interface/LoginDto';
import { LoginResponseDto } from 'src/app/interface/LoginResponseDto';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm !: FormGroup;
  @ViewChild('passwordField') passwordField !: ElementRef<HTMLInputElement>;
  @ViewChild('passwordEye') passwordEye !: ElementRef<HTMLElement>;

  constructor(private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    })

    if(this.authService.isAuthenticated){
      this.router.navigate(['/home']);
    }
  }

  login() {
    let loginDto: LoginDto = {
      email: this.loginForm.controls['email'].value,
      password: this.loginForm.controls['password'].value,
      rememberMe: false
    }

    if (!loginDto.email || !loginDto.password) {
      this.toastr.error("Email or Password is missing", "Invalid Credentials");
      return;
    }

    this.spinner.show();

    this.authService.login(loginDto).subscribe((res: LoginResponseDto) => {
      this.spinner.hide();
      this.authService.setAuthentication(res.success);
      if (res.success) {
        this.toastr.success("", res.message);
        sessionStorage.setItem("SC_TOKEN", res.token);
        let user: ApplicationUser = {
          id: res.user.id,
          name: res.user.name, 
          email: res.user.email,
          roles: res.roles
        }
        sessionStorage.setItem("SC_USER", JSON.stringify(user))
        this.router.navigate(['/home']);
      }
      else {
        this.toastr.error("", res.message);
      }
    },
      ({ err }) => {
        this.spinner.hide();
        this.toastr.error(err.message, "Error")
      });

  }


  togglePassVisibility(): void {
    if(this.passwordField.nativeElement.type == 'password'){
      this.passwordField.nativeElement.type = 'text';
      this.passwordEye.nativeElement.classList.remove('fa-eye');
      this.passwordEye.nativeElement.classList.add('fa-eye-slash');
    }
    else{
      this.passwordField.nativeElement.type = 'password';
      this.passwordEye.nativeElement.classList.remove('fa-eye-slash');
      this.passwordEye.nativeElement.classList.add('fa-eye');
    }
  }



}
