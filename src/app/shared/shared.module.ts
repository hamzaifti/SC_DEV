import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {MultiSelectModule} from 'primeng/multiselect';
import {DropdownModule} from 'primeng/dropdown';
import { NumericOnlyDirective } from '../directive/numeric-only.directive';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  declarations: [NumericOnlyDirective],
  imports: [
    CommonModule
  ],
  exports:[
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MultiSelectModule,
    DropdownModule,
    NumericOnlyDirective,
    DialogModule,
    CalendarModule
  ]
})
export class SharedModule { }
