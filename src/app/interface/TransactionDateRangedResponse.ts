import { CashSummaryReportDto } from "./CashSummaryReportDto";
import { PendingReferenceDto } from "./PendingReferenceDto";
import { Transaction } from "./transaction";

export class TransactionDateRangedResponse{
    transactions: Transaction[] = [];
    openingBalance: number = 0;
    closingBalance: number = 0;
    cashSummaryReportList: CashSummaryReportDto[] = [];
    pendingIouList: PendingReferenceDto[] = []
}