import { IouReference } from "./IouReference";
import { Transaction } from "./transaction";

export interface SaveTransactionDto{
    transactionObj: Transaction,
    iouReferenceObj: IouReference | null
}