import { Moment } from "moment";

export class Transaction {
    id: number = 0;
    transactionType: number | string | null = null;
    role: string | null = null;
    particular: string | null = '';
    recieptNo: string | null = null;
    reciept: number | string | null = null;
    payment: number | string | null = null;
    balance: number | null = null;
    createdById: string = '';
    createdByName: string = '';
    createdOn: Date | string | Moment = new Date();
  }
  