import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CompanyValidationDto } from 'src/app/interface/CompanyValidationDto';
import { IdentityRoles } from 'src/app/interface/IdentityRoles';
import { ResponseDto } from 'src/app/interface/ResponseDto';
import { UserDto } from 'src/app/interface/UserDto';
import { AuthService } from 'src/app/service/auth.service';
import { RolesService } from 'src/app/service/roles.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm !: FormGroup;
  rolesList: IdentityRoles[] = [];



  constructor(private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private rolesService: RolesService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.initializeForm();
    this.getAllRoles();
  }

  initializeForm(): void {
    this.registerForm = new FormGroup({
      companyKey: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      roles: new FormControl('', [Validators.required])
    });
  }

  getAllRoles(): void {
    this.rolesService.getAllRoles().subscribe((res) => {
      this.rolesList = res;
      this.spinner.hide();
    },
      ({ err }) => {
        this.spinner.hide();
        this.toastr.error("Error", "Cannot get roles");
      })
  }

  onSubmit(): void {
    this.spinner.show();
    let key = new CompanyValidationDto();
    key.companyKey = this.registerForm.controls['companyKey'].value
    this.authService.validateCompany(key).subscribe((comapnyRes) => {

      if (!comapnyRes.success) {
        this.spinner.hide();
        this.toastr.error("", comapnyRes.message);
        return;
      }

      let userDto: UserDto = {
        id: '',
        companyId: comapnyRes.companyId,
        name: this.registerForm.controls['name'].value,
        email: this.registerForm.controls['email'].value,
        password: this.registerForm.controls['password'].value,
        roles: this.registerForm.controls['roles'].value
      }

      if (userDto.password != this.registerForm.controls['confirmPassword'].value) {
        this.spinner.hide();
        this.toastr.error("Passwords do no match, please try again.", "Password Match Error");
        this.registerForm.controls['password'].setValue('');
        this.registerForm.controls['confirmPassword'].setValue('');
        return;
      }
      this.authService.register(userDto).subscribe((res: ResponseDto) => {
        this.spinner.hide();
        if (res.success) {
          this.toastr.success("", res.message);
          this.registerForm.reset();
        }
        else {
          this.toastr.error(res.message, "User Registration Error");
        }
      },
        ({ err }) => {
          this.spinner.hide();
          this.toastr.error(err.message, "User Registration Error");
        });

    },
      ({ err }) => {
        this.spinner.hide();
        this.toastr.error(err.message, "User Registration Error");
      })
  }

}
