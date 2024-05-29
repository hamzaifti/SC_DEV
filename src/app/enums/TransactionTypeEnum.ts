export enum TransactionTypeEnum {
  CashReceived = 1,
  Expenses_Payments = 2,
  IOU = 3,
  Bank = 4
}

export function mapTransactionType(type: number): string {
  switch (type) {
    case TransactionTypeEnum.CashReceived:
      return 'Cash Received';
    case TransactionTypeEnum.Expenses_Payments:
      return 'Expenses / Payments';
    case TransactionTypeEnum.IOU:
      return 'IOU';
      case TransactionTypeEnum.Bank:
        return 'Bank';
    default:
      return '';
  }
}