import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TransactionType } from '../interface/transactionType';
import { environment } from 'src/environments/environment.development';
import { Transaction } from '../interface/transaction';
import { ResponseDto } from '../interface/ResponseDto';
import { PagedRequestDto } from '../interface/PagedRequestDto';
import { PagedResponseDto } from '../interface/PagedResponseDto';
import { TransactionDateRangedResponse } from '../interface/TransactionDateRangedResponse';
import { Moment } from 'moment';
import { SaveTransactionDto } from '../interface/SaveTransactionDto';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  baseUrl: string = environment.appBaseUrl;

  constructor(private http: HttpClient) { }

  getTranscationType(): Observable<TransactionType[]>{
    return this.http.get<TransactionType[]>(`${this.baseUrl}Transaction/GetTransactionTypes`);
  }

  saveTranscation(key: SaveTransactionDto): Observable<ResponseDto>{
    return this.http.post<ResponseDto>(`${this.baseUrl}Transaction/SaveTransaction`, key);
  }

  getAllTransactionsPaged(key: PagedRequestDto): Observable<PagedResponseDto<Transaction>>{
    return this.http.post<PagedResponseDto<Transaction>>(`${this.baseUrl}Transaction/GetAllTransactionsPaged`, key);
  }

  getTransactionById(id: number): Observable<Transaction>{
    return this.http.get<Transaction>(`${this.baseUrl}Transaction/GetTransactionById/${id}`);
  }

  deleteTransaction(id: number): Observable<ResponseDto>{
    return this.http.delete<ResponseDto>(`${this.baseUrl}Transaction/DeleteTransaction/${id}`);
  }

  getTransactionByDateRange(startDate: Date | Moment, endDate: Date | Moment): Observable<TransactionDateRangedResponse>{
    return this.http.get<TransactionDateRangedResponse>(`${this.baseUrl}Transaction/GetTransactionByDateRange?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
  }

}
