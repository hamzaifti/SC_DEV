import { IouReference } from "./IouReference";

export class PendingReferenceDto extends IouReference{
    balance: number = 0;
    role: string = '';
    transactionDate: Date | null = null;
}