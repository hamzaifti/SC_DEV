import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddTransactionComponent } from './add-transaction/add-transaction.component';
import { AuthGuard } from '../service/auth-guard.service';
import { ViewTransactionComponent } from './view-transaction/view-transaction.component';

const routes: Routes = [
  { path: 'add-transaction', component: AddTransactionComponent, canActivate: [AuthGuard] },
  { path: 'add-transaction/:id', component: AddTransactionComponent, canActivate: [AuthGuard] },
  { path: 'view-transaction', component: ViewTransactionComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionsRoutingModule { }
