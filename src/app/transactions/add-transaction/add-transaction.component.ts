import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TransactionTypeEnum } from 'src/app/enums/TransactionTypeEnum';
import { IouReference } from 'src/app/interface/IouReference';
import { ResponseDto } from 'src/app/interface/ResponseDto';
import { SaveTransactionDto } from 'src/app/interface/SaveTransactionDto';
import { UserDto } from 'src/app/interface/UserDto';
import { Transaction } from 'src/app/interface/transaction';
import { TransactionType } from 'src/app/interface/transactionType';
import { IouService } from 'src/app/service/iou.service';
import { RolesService } from 'src/app/service/roles.service';
import { TransactionService } from 'src/app/service/transaction.service';
import { UserService } from 'src/app/service/user.service';
import { environment } from 'src/environments/environment.development';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.scss']
})
export class AddTransactionComponent {

  transactionTypeList: TransactionType[] = [];

  rolesList: string[] = [];

  userData: UserDto = new UserDto();

  transaction: Transaction = new Transaction();

  isEdit: boolean = false;

  iouReferenceArr: IouReference[] = [];

  iouReferenceObj: IouReference | null = null;

  currentTransId: number | null = null;

  referenceId: string | null = null;


  isMasterUser: boolean = false;

  constructor(private transactionService: TransactionService,
    private toastr: ToastrService,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private location: Location,
    private rolesService: RolesService,
    private iouService: IouService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    console.log(this.isMasterUser);
    this.spinner.show();
    this.getUserData();
    this.getTransactionType();
    this.route.paramMap.subscribe(params => {
      let id = params.get('id');
      if (id) {
        this.currentTransId = Number(id);
        this.isEdit = true;
        this.getTransactionById(Number(id));
      }
    });
    this.getIouReference();
  }

  getIouReference(): void {
    this.iouService.getIouReferences().subscribe((res) => {

      if (!this.isEdit) {
        res = res.filter(x => !x.isDeleted);
      }

      this.iouReferenceArr = res.map(x => {
        x.modifiedName = x.iouName + " -> " + x.iouId;
        return x;
      });

      let newIou = new IouReference();
      newIou.iouId = '-1';
      newIou.iouName = "New IOU";
      newIou.modifiedName = "New IOU";

      this.iouReferenceArr.unshift(newIou);

      this.getIouByTransactionId(Number(this.currentTransId));
    },
      ({ error }) => {
        this.toastr.error(error.message, "Error");
      });

  }

  goBack(): void {
    this.location.back();
  }

  getUserData(): void {
    this.userData = this.userService.getCurrentUserData();
    this.isMasterUser = environment.masterUserId.split(",").indexOf(this.userData.id) != -1;
  }

  getTransactionType(): void {
    this.transactionService.getTranscationType().subscribe((res) => {
      this.transactionTypeList = res;
      this.checkBankPermission();
      if (this.userData.id == this.transaction.createdById || !this.isEdit) {
        this.getUserRoles();
      }
    },
      ({ err }) => {
        this.spinner.hide();
        this.toastr.error("Cannot fetch transaction types", "Error");
      })
  }

  getIouByTransactionId(transactionId: number) {
    this.iouService.getIouReferenceForTransaction(transactionId).subscribe((res) => {
      if (res) {
        this.iouReferenceObj = this.iouReferenceArr.find(x => x.iouId == res.iouId) ?? null;
        if (this.iouReferenceObj) {
          this.iouReferenceObj.modifiedName = `${res.iouName} -> ${res.iouId}`;
        }
      }
    },
      ({ error }) => {
        this.toastr.error('', "Cannot Get Reference");
      })
  }

  getTransactionById(id: number): void {
    this.getAllRoles();
    this.transactionService.getTransactionById(id).subscribe((res) => {
      this.transaction = res;
      if (this.isEdit) {
        this.transaction.createdOn = new Date(res.createdOn as Date);
      }
    },
      ({ err }) => {
        this.spinner.hide();
        this.toastr.error("Cannot Get Transaction", "Error");
      });

  }

  checkBankPermission(): void {
    this.userService.checkBankPermission().subscribe((permitted: boolean) => {
      if (this.isEdit && this.userData.id == this.transaction.createdById && !permitted) {
        this.transactionTypeList = this.transactionTypeList.filter(x => x.transactionValue != TransactionTypeEnum.Bank);
      }
      else if (!permitted && !this.isEdit) {
        this.transactionTypeList = this.transactionTypeList.filter(x => x.transactionValue != TransactionTypeEnum.Bank);
      }
    },
      ({ err }) => {
        this.toastr.error("Cannot fetch bank permission", "Error");
      })
  }

  onIouReferenceSelection(): void {
    if (this.iouReferenceObj?.iouId == '-1') {
      this.referenceId = uuidv4();
    }
  }

  getUserRoles(): void {
    this.userService.getUserRoles().subscribe((res) => {
      this.rolesList = res.filter(x => x != 'Bank');
      this.spinner.hide();
    },
      ({ err }) => {
        this.spinner.hide();
        this.toastr.error("Cannot fetch roles", "Error")
      })
  }

  getAllRoles(): void {
    this.rolesService.getAllRoles().subscribe((res) => {
      this.rolesList = res.filter(x => x.name != 'Bank').map(x => x.name);
      this.spinner.hide();
    },
      ({ err }) => {
        this.spinner.hide();
        this.toastr.error("Cannot fetch roles", "Error")
      })
  }

  onChangeTransactionType(): void {
    this.transaction.recieptNo = null;
    this.transaction.reciept = null;
    this.transaction.payment = null;
    this.iouReferenceObj = null;
  }

  onSubmit(): void {
    this.spinner.show();
    this.transaction.createdById = this.userData.id;
    this.transaction.createdByName = this.userData.name ?? '';
    this.transaction.createdOn = new Date(this.transaction.createdOn as Date);
    if (!this.isEdit) {
      this.transaction.createdOn.setHours(new Date().getHours());
      this.transaction.createdOn.setMinutes(new Date().getMinutes());
      this.transaction.createdOn.setSeconds(new Date().getSeconds());
      this.transaction.createdOn.setMilliseconds(new Date().getMilliseconds());
    }
    let createdOnTemp = this.transaction.createdOn;
    this.transaction.createdOn = moment(this.transaction.createdOn).utcOffset(0, true);
    if (this.transaction.particular == null) {
      this.transaction.particular = '';
    }
    if (this.transaction.recieptNo?.toString().trim().length == 0) {
      this.transaction.recieptNo = null;
    }
    if (this.transaction.reciept?.toString().trim().length == 0) {
      this.transaction.reciept = null;
    }
    if (this.transaction.payment?.toString().trim().length == 0) {
      this.transaction.payment = null;
    }
    if (this.transaction.payment?.toString().trim().length == 0) {
      this.transaction.payment = null;
    }
    if (this.transaction.transactionType == TransactionTypeEnum.Bank) {
      this.transaction.role = '';
    }

    if (this.iouReferenceObj?.iouId == '-1') {
      this.iouReferenceObj.iouId = this.referenceId;
      this.iouReferenceObj.iouName = this.transaction.particular;
    }

    let SaveTransactionDto: SaveTransactionDto = {
      transactionObj: this.transaction,
      iouReferenceObj: this.iouReferenceObj
    }

    this.transactionService.saveTranscation(SaveTransactionDto).subscribe((res: ResponseDto) => {
      this.spinner.hide();
      this.toastr.success(res.message, "Success");
      this.transaction.createdOn = createdOnTemp ?? new Date();
      if (!this.isEdit) {
        this.transaction.particular = '';
        this.transaction.payment = null;
        this.transaction.balance = null;
        this.transaction.recieptNo = null;
        this.transaction.reciept = null;
        this.iouReferenceObj = null;
      }
      this.getIouReference();
    },
      (err: ResponseDto) => {
        this.spinner.hide();
        this.toastr.error(err.message, "Error")
      })
  }

}
