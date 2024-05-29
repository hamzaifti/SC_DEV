import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { AddTransactionComponent } from './add-transaction/add-transaction.component';
import { SharedModule } from '../shared/shared.module';
import { ViewTransactionComponent } from './view-transaction/view-transaction.component';
import { AgGridAngular } from 'ag-grid-angular';
import { ActionRendererComponent } from '../renderer/action-renderer-transaction';
import 'ag-grid-enterprise';
@NgModule({
  declarations: [
    AddTransactionComponent,
    ViewTransactionComponent,
    ActionRendererComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TransactionsRoutingModule,
    AgGridAngular
  ]
})
export class TransactionsModule { }
