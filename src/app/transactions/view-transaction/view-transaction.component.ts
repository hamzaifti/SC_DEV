import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { PagedRequestDto } from 'src/app/interface/PagedRequestDto';
import { UserDto } from 'src/app/interface/UserDto';
import { Transaction } from 'src/app/interface/transaction';
import { ActionRendererComponent } from 'src/app/renderer/action-renderer-transaction';
import { TransactionService } from 'src/app/service/transaction.service';
import { UserService } from 'src/app/service/user.service';
import { TransactionTypeEnum, mapTransactionType } from "../../enums/TransactionTypeEnum";
import { ColDef, GridReadyEvent, IServerSideDatasource } from "node_modules/ag-grid-community";
import { RowModelType, DomLayoutType } from 'ag-grid-community';
import { PagedResponseDto } from 'src/app/interface/PagedResponseDto';
import { NgxSpinnerService } from 'ngx-spinner';
import { TransactionType } from 'src/app/interface/transactionType';
import { RolesService } from 'src/app/service/roles.service';
import { IdentityRoles } from 'src/app/interface/IdentityRoles';
import { RolesEnum } from '../../enums/RolesEnum';
import { AgGridAngular } from 'ag-grid-angular';
import { CashSummaryReportDto } from 'src/app/interface/CashSummaryReportDto';
import { PendingReferenceDto } from 'src/app/interface/PendingReferenceDto';
@Component({
  selector: 'app-view-transaction',
  templateUrl: './view-transaction.component.html',
  styleUrls: ['./view-transaction.component.scss']
})
export class ViewTransactionComponent {

  @ViewChild('grid') grid!: AgGridAngular;
  domLayout: DomLayoutType = "normal";
  userData: UserDto = new UserDto();
  pagedRequestDto: PagedRequestDto = new PagedRequestDto();
  transactionListPaged: Transaction[] = [];
  frameworkComponents: any;
  paginationPageSizeSelector: number[] = [50,100,150,200];
  rowModelType: RowModelType = "serverSide";
  printEndDate: Date = new Date();
  printStartDate: Date = new Date(new Date().setDate(this.printEndDate.getDate() - 1));
  printModalVisible: boolean = false;
  transactionTypes: TransactionType[] = [];
  transactionListPrint: Transaction[] = [];
  cashSummaryReportList: CashSummaryReportDto[] = [];
  rolesList: IdentityRoles[] = [];
  pendingIouList: PendingReferenceDto[] = [];
  filterText: string = '';
  openingBalance: number = 0;
  closingBalance: number = 0;

  columnDefs: ColDef[] = [
    { headerName: 'Transaction Type', field: 'transactionType', minWidth: 200 },
    { headerName: 'Sector', field: 'role', minWidth: 200 },
    { headerName: 'Particulars', field: 'particular', minWidth: 400 },
    { headerName: 'Reciept No', field: 'recieptNo', minWidth: 200 },
    { headerName: 'Reciept / Deposit', field: 'reciept', minWidth: 200 },
    { headerName: 'Payment / Withdrawal', field: 'payment', minWidth: 200 },
    { headerName: 'Created By', field: 'createdByName', minWidth: 200 },
    { headerName: 'Created On', field: 'createdOn', minWidth: 250 },
    { headerName: 'Action', cellRenderer: 'actionCellRenderer', minWidth: 200 }
  ];

  constructor(private userService: UserService,
    private transactionService: TransactionService,
    private toastr: ToastrService,
    private location: Location,
    private rolesService: RolesService,
    private spinner: NgxSpinnerService
  ) {
    this.pagedRequestDto.pageSize = 50;
    this.frameworkComponents = {
      actionCellRenderer: ActionRendererComponent,
    };
  }

  ngOnInit(): void {
    this.userData = this.userService.getCurrentUserData();
  }

  onGridReady(params: GridReadyEvent<Transaction>) {
    var ds = this.gridDataSource();
    params.api.setGridOption('serverSideDatasource', ds); // replace dataSource with your datasource
    params.api.sizeColumnsToFit();
  }


  gridDataSource(): IServerSideDatasource {
    return {
      getRows: (params: any) => {
        this.pagedRequestDto.startRow = params.request.startRow;
        this.pagedRequestDto.endRow = params.request.endRow;
        this.pagedRequestDto.filterText = this.filterText ? this.filterText.trim() : null;
        this.transactionService.getAllTransactionsPaged(this.pagedRequestDto).subscribe((res: PagedResponseDto<Transaction>) => {
          res.data = res.data.map(x => {
            x.createdOn = moment(x.createdOn).format('LLL');
            x.transactionType = mapTransactionType(Number(x.transactionType));
            x.payment = x.payment ? x.payment.toLocaleString('en-IN') : x.payment;
            x.reciept = x.reciept ? x.reciept.toLocaleString('en-IN') : x.reciept;
            return x;
          });
          this.transactionListPaged = res.data;

          params.success({
            rowData: res.data,
            rowCount: res.totalRows
          });
        },
          ({ err }) => {
            params.fail();
            this.toastr.error("Cannot fetch transactions", "Error");
          });

      }
    }
  }


  goBack(): void {
    this.location.back();
  }

  openPrintDialog(): void {
    this.printStartDate = new Date(new Date().setDate(new Date().getDate() - 1))
    this.printEndDate = new Date();
    this.printModalVisible = true;
  }

  customRoleSort = (a: IdentityRoles, b: IdentityRoles): number => {
    // Get the index of each role name in the RolesEnum enum
    const indexA = Object.values(RolesEnum).indexOf(a.name as any);
    const indexB = Object.values(RolesEnum).indexOf(b.name as any);

    // Compare the indices
    return indexA - indexB;
  };

  searchTransaction(): void {
    this.spinner.show();
    this.grid.api.refreshServerSide();
    this.spinner.hide();
  }

  appendCashSummaryInPrint(mainContainer: HTMLDivElement) {
    let headers = ['Sr.No', 'Narration', 'Precast Cash', 'P + C Cash', 'Total Cash in Hand'];
    let container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'space-between';

    for (var cashSummaryList of this.cashSummaryReportList) {

      let srNo = 1;
      let childContainer = document.createElement('div');
      childContainer.style.display = 'flex';
      childContainer.style.flexDirection = 'column';
      childContainer.style.alignItems = 'center';
      childContainer.style.textAlign = 'center';
      childContainer.style.width = '49%';


      let div = document.createElement('div');
      div.style.fontFamily = 'sans-serif';
      div.style.fontWeight = '600';
      div.style.marginBottom = '0.5rem';
      div.innerHTML = `CASH SUMMARY <br/> AT ${moment.utc(cashSummaryList.summaryDate).format("DD.MM.YYYY")}`;

      childContainer.appendChild(div);

      let tbl = document.createElement('table');
      tbl.style.marginBottom = '1rem';
      tbl.style.tableLayout = 'fixed';
      let tr = document.createElement('tr');
      for (var head of headers) {
        let th = document.createElement('th');
        th.innerHTML = head;
        if(head == 'Sr.No'){
          th.style.width = '10%';
        }
        if(head == 'Narration'){
          th.style.width = '23%';
        }
        tr.appendChild(th);
      }

      tbl.appendChild(tr);

      let sumCashInHand = 0;

      for (var cashSummary of cashSummaryList.cashSummaryList) {

        tr = document.createElement('tr');

        let td = document.createElement('td');
        td.innerHTML = srNo.toString();
        tr.appendChild(td);

        srNo++;

        for (var entry of Object.entries(cashSummary)) {
          let td = document.createElement('td');
          td.innerHTML = entry[1] ? entry[1].toLocaleString('en-IN') : '';
          tr.appendChild(td);

          if (entry[0].toLowerCase() == "totalcashinhand") {
            sumCashInHand += Number(entry[1] ? entry[1] : 0);
          }
        }
        tbl.appendChild(tr);
      }

      //appending cash in hand sum
      tr = document.createElement('tr');


      for (let i = 0; i < headers.length; i++) {
        let td = document.createElement('td');
        td.style.border = '1px solid transparent';
        if (i == headers.length - 1) {
          td.innerHTML = sumCashInHand ? `<div style='font-weight: 600; text-decoration: underline'>${sumCashInHand.toLocaleString('en-IN')}</div>` : '';
        }
        else {
          td.innerHTML = '';
        }
        tr.appendChild(td);
      }

      tbl.appendChild(tr);

      childContainer.appendChild(tbl);
      container.appendChild(childContainer);
    }


    mainContainer.appendChild(container);
  }


  appendPendingIous(mainContainer: HTMLElement): void {

    if (!this.pendingIouList || this.pendingIouList.length == 0) {
      return;
    }

    let div = document.createElement('div');
    div.innerHTML = "Pending IOU's"
    div.style.marginTop = '1rem';
    div.style.width = '100%';
    div.style.textAlign = 'center';
    div.style.fontWeight = '600';
    div.style.fontSize = '1.2rem';

    mainContainer.appendChild(div);

    let tbl = document.createElement('table');
    tbl.style.marginTop = '1rem';
    let tr = document.createElement('tr');

    let fields = ['Particular', 'Date', 'Paver', 'Precast', 'FSD Shop'];

    let showFsd = true;

    //in case no iou for fsd shop no need to show it, only paver and precast are compulsory
    if (!this.pendingIouList.some(x => x.role.toLowerCase().includes('fsd'))) {
      fields = fields.filter(x => x != 'FSD Shop');
      showFsd = false;
    }

    for (var data of fields) {
      let th = document.createElement('th');
      th.innerHTML = data;
      tr.appendChild(th);
    }

    tbl.appendChild(tr);

    let paverSum = 0;
    let precastSum = 0;
    let fsdSum = 0;

    for (var iou of this.pendingIouList) {
      tr = document.createElement('tr');

      for (var data of fields) {

        let td = document.createElement('td');

        switch (data) {
          case 'Particular':
            td.innerHTML = iou.iouName ?? '';
            break;
          case 'Date':
            td.innerHTML = moment(iou.transactionDate).format('DD-MMM-YYYY');
            break;
          case 'Paver':
            td.innerHTML = iou.role.toLocaleLowerCase().includes('paver') ? iou.balance.toLocaleString('en-IN') : '';
            paverSum += iou.role.toLocaleLowerCase().includes('paver') ? iou.balance : 0;
            break;
          case 'Precast':
            td.innerHTML = iou.role.toLocaleLowerCase().includes('precast') ? iou.balance.toLocaleString('en-IN') : '';
            precastSum += iou.role.toLocaleLowerCase().includes('precast') ? iou.balance : 0;
            break;
          case 'FSD Shop':
            td.innerHTML = iou.role.toLocaleLowerCase().includes('fsd') ? iou.balance.toLocaleString('en-IN') : '';
            fsdSum += iou.role.toLocaleLowerCase().includes('fsd') ? iou.balance : 0;
            break;
        }

        tr.appendChild(td);

      }

      tbl.appendChild(tr);
    }

    //appending sum

    tr = document.createElement('tr');

    for (var i = 0; i < 2; i++) {
      let td = document.createElement('td');
      td.style.fontWeight = '600';
      td.style.textDecoration = 'underline';
      td.innerHTML = i == 0 ? 'Total' : '';
      tr.appendChild(td);
    }

    let td = document.createElement('td');
    td.style.fontWeight = '600'
    td.style.textDecoration = 'underline';
    td.innerHTML = paverSum.toLocaleString(('en-IN'));
    tr.appendChild(td);

    td = document.createElement('td');
    td.style.fontWeight = '600'
    td.style.textDecoration = 'underline';
    td.innerHTML = precastSum.toLocaleString(('en-IN'));
    tr.appendChild(td);

    if (showFsd) {
      td = document.createElement('td');
      td.style.fontWeight = '600'
      td.style.textDecoration = 'underline';
      td.innerHTML = fsdSum.toLocaleString(('en-IN'));
      tr.appendChild(td);
    }

    tbl.appendChild(tr);


    mainContainer.appendChild(tbl);

  }


  printReport(): void {

    let headers = [
      { headerName: 'Particulars', field: 'particular' },
      { headerName: 'Reciept No', field: 'recieptNo' },
      { headerName: 'Reciept', field: 'reciept' },
      { headerName: 'Payment', field: 'payment' },
      { headerName: 'Balance', field: 'balance' },
    ];


    let mainContainer = document.createElement('div');

    var maintbl = document.createElement('table')

    this.appendCashSummaryInPrint(mainContainer);

    var tr = document.createElement('tr');

    var th = document.createElement('th');
    th.colSpan = headers.length;

    th.innerHTML = `
    <div style='display: flex; width: 100%; align-items: center'>
    <img src='../assets/images/sc_logo.png' style='width: 4rem; object-fit: cover; height: 100% margin-right: auto'; />
    <div style='margin-left: auto; margin-right: auto '>
    Transactions Detail
    </div>
    <div style: 'margin-left: auto'>${moment(this.printStartDate).format('LL')} - ${moment(this.printEndDate).format('LL')}</div>
    </div>
    `;
    th.style.textAlign = 'center';
    tr.appendChild(th);

    maintbl.appendChild(tr);

    tr = document.createElement('tr');

    //appending headers
    for (var heading of headers) {
      let th = document.createElement('th');
      th.innerHTML = heading.headerName;
      tr.appendChild(th);
    }

    maintbl.appendChild(tr);

    tr = document.createElement('tr');

    //appending opening balance

    for (var heading of headers) {
      if (heading.field.toLowerCase() == 'particular') {
        let td = document.createElement('td');
        td.innerHTML = 'Opening Balance';
        td.classList.add('balance-cell');
        tr.appendChild(td);
      }
      else if (heading.field.toLowerCase() == 'balance') {
        let td = document.createElement('td');
        td.innerHTML = this.openingBalance?.toLocaleString('en-IN');
        td.classList.add('balance-cell');
        tr.appendChild(td);
      }
      else {
        let td = document.createElement('td');
        td.classList.add('balance-cell');
        tr.appendChild(td);
      }
    }

    maintbl.appendChild(tr);

    this.rolesList = this.rolesList.sort(this.customRoleSort);

    //appending types of transaction
    for (var type of this.transactionTypes) {
      if (type.transactionValue == TransactionTypeEnum.Bank) {
        continue;
      }
      tr = document.createElement('tr');
      let td = document.createElement('td');
      td.colSpan = headers.length;
      td.innerHTML = type.transactionType;
      td.classList.add('transaction-type');
      tr.appendChild(td);

      maintbl.appendChild(tr);


      let totalReciept = 0;
      let totalPayment = 0;

      for (var roles of this.rolesList) {

        if (roles.name.toLowerCase() == 'bank') {
          continue;
        }

        //appending sectors

        tr = document.createElement('tr');
        let td = document.createElement('td');
        td.innerHTML = roles.name
        td.style.fontWeight = '600';
        tr.appendChild(td);

        for (var i = 0; i < headers.length - 1; i++) {
          let td = document.createElement('td');
          tr.appendChild(td);
        }

        maintbl.appendChild(tr);


        //appending values for types
        let transactions = this.transactionListPrint.filter(x => x.transactionType == type.transactionValue && x.role?.toLowerCase() == roles.name.toLowerCase());

        //in case no record for sector  
        if (transactions.length == 0) {
          tr = document.createElement('tr');
          let td = document.createElement('td');
          td.colSpan = headers.length;
          td.classList.add('empty-row');
          tr.appendChild(td);
          maintbl.appendChild(tr);
        }

        //appending transactions
        for (var data of transactions) {
          tr = document.createElement('tr');

          for (var i = 0; i < headers.length; i++) {

            let td = document.createElement('td');
            td.innerHTML = (data as any)[headers[i].field];
            if (headers[i].field.toLowerCase() == 'reciept') {
              td.innerHTML = (data as any)[headers[i].field] ? (data as any)[headers[i].field]?.toLocaleString('en-IN') : '';
              totalReciept += Number(data.reciept);
            }
            else if (headers[i].field.toLowerCase() == 'payment') {
              td.innerHTML = (data as any)[headers[i].field] ? (data as any)[headers[i].field]?.toLocaleString('en-IN') : '';
              totalPayment += Number(data.payment);
            }
            else {
              //dont put value of balance
              td.innerHTML = headers[i].field.toLowerCase() == 'balance' ? '' : (data as any)[headers[i].field];
            }
            tr.appendChild(td);
          }

          maintbl.appendChild(tr);
        }

        maintbl.appendChild(tr);

      }

      //appending total transaction type wise
      tr = document.createElement('tr');

      for (var heading of headers) {
        let td = document.createElement('td');
        if (heading.field.toLowerCase() == 'reciept') {
          td.innerHTML = !totalReciept ? '' : totalReciept.toLocaleString('en-IN');
        }
        else if (heading.field.toLowerCase() == 'payment') {
          td.innerHTML = !totalPayment ? '' : totalPayment.toLocaleString('en-IN');
        }
        else {
          td.innerHTML = ''
        }
        td.style.fontWeight = '600';
        td.classList.add('empty-row')
        tr.appendChild(td);
      }

      maintbl.appendChild(tr);

    }

    //appending closing Balance

    tr = document.createElement('tr');

    for (var heading of headers) {
      let td = document.createElement('td');
      td.classList.add('balance-cell');
      if (heading.field.toLowerCase() == 'particular') {
        td.innerHTML = 'Closing Balance Physical Cash In Hand'
      }
      else if (heading.field.toLowerCase() == 'balance') {
        td.innerHTML = this.closingBalance?.toLocaleString('en-IN');
      }

      tr.appendChild(td);

      maintbl.appendChild(tr);

    }

    mainContainer.appendChild(maintbl);

    this.appendPendingIous(mainContainer);


    //configuring styles
    let style = `<style>

    table, th, td {
      border: 1px solid black;
      border-collapse: collapse;
      font-family: arial;
      font-size: 0.8rem;
    }

    table{
      width: 100%;
    }

    th, td{
      padding: 0.5rem;
    }

    td.transaction-type{
      background: #e4e4e7;
      font-weight: 600;
    }

    td.empty-row{
      height: 2rem;
    }

    .balance-cell{
      font-weight: 600;
      text-decoration: underline;
    }

    @media print {
      @page {
        margin: 0;
      }
      body {
        -webkit-print-color-adjust: exact !important;
      }
    }

    </style>`


    setTimeout(() => {

      //print Report
      const WindowPrt: any = window.open('', '_blank');
      WindowPrt.document.write(style);
      WindowPrt.document.write(mainContainer.innerHTML);
      WindowPrt.document.title = 'Report';
      setTimeout(() => {
        WindowPrt.focus();
        WindowPrt.print();
        WindowPrt.close();
      }, 500);

    }, 200);

  }

  invokePrint(): void {

    if (this.printEndDate < this.printStartDate) {
      this.toastr.error("Start date should be lower then end date", "Error");
      return;
    }

    this.spinner.show();

    this.rolesService.getAllRoles().subscribe((rolesRes) => {
      this.rolesList = rolesRes;
      this.transactionService.getTranscationType().subscribe((typeRes) => {
        this.transactionTypes = typeRes;
        this.openingBalance = 0; this.closingBalance = 0;
        this.transactionService.getTransactionByDateRange(moment(this.printStartDate).utcOffset(0, true), moment(this.printEndDate).utcOffset(0, true)).subscribe((res) => {
          this.transactionListPrint = res.transactions;
          this.cashSummaryReportList = res.cashSummaryReportList;
          this.pendingIouList = res.pendingIouList;
          this.openingBalance = res.openingBalance;
          this.closingBalance = res.closingBalance;
          this.printReport();
          this.printModalVisible = false;
          this.spinner.hide();
        },
          ({ err }) => {
            this.spinner.hide();
            this.toastr.error("Cannot Get Transactions", "Error");
          })

      },
        ({ err }) => {
          this.spinner.hide();
          this.toastr.error("Cannot Get Transactions Types", "Error");
        });
    },
      ({ err }) => {
        this.spinner.hide();
        this.toastr.error("Cannot Get Sectors", "Error");
      })

  }

}
