import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { UserDto } from '../interface/UserDto';
import { UserService } from '../service/user.service';
import { TransactionService } from '../service/transaction.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ResponseDto } from '../interface/ResponseDto';
import { Router, RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-button-renderer',
  template: `
    <div class='flex w-full'>
      <button (click)='navigateToEdit(params)' class='grid-action-button' *ngIf='!showEdit' type='button'><i class='fa fa-eye'></i></button>
      <button (click)='navigateToEdit(params)' class='grid-action-button' *ngIf='showEdit' type='button'><i class='fa fa-pencil'></i></button>
      <button (click)='deleteTransaction(params)' *ngIf='showEdit'  class='grid-action-button'><i class='fa fa-trash'></i></button>
    </div>
      `
})
export class ActionRendererComponent implements ICellRendererAngularComp {

  params: any;
  userData: UserDto = new UserDto;
  showEdit: boolean = false;

  constructor(private userService: UserService,
    private transactionService: TransactionService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.userData = this.userService.getCurrentUserData();
  }

  agInit(params: any): void {
    this.params = params;
    this.showEdit = params.data.createdById == this.userData.id || environment.masterUserId.split(",").indexOf(this.userData.id) != -1;
  }

  refresh(params?: any): boolean {
    return true;
  }

  deleteTransaction(param: any): void {
    this.spinner.show();
    this.transactionService.deleteTransaction(param.data.id).subscribe((res: ResponseDto) => {
      this.spinner.hide();
      this.toastr.success("", res.message);
      this.params.api.refreshServerSide();
    },
      ({ err }) => {
        this.spinner.hide();
        this.toastr.error("", err.message);
      });
  }

  navigateToEdit(param: any){
    this.router.navigate(['/transaction','add-transaction', param.data.id]);
  }

}
