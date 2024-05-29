import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { IouReference } from '../interface/IouReference';
@Injectable({
  providedIn: 'root'
})
export class IouService {

  baseUrl: string = environment.appBaseUrl;

  constructor(private http: HttpClient) { }

  getIouReferences(): Observable<IouReference[]>{
    return this.http.get<IouReference[]>(`${this.baseUrl}Iou/GetIouReferences`);
  }

  getIouReferenceForTransaction(transactionId: number): Observable<IouReference>{
    return this.http.get<IouReference>(`${this.baseUrl}Iou/GetIouReferenceForTransaction/${transactionId}`);
  }

}
