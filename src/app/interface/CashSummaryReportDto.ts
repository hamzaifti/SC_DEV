import { CashSummaryDto } from "./CashSummaryDto";

export class CashSummaryReportDto {
  cashSummaryList: CashSummaryDto[] = [];
  summaryDate: Date = new Date();
}