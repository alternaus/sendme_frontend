export interface IRecharge {
  id:                number;
  paymentId:         number;
  organizationId:    number;
  currencyCode:      string;
  amount:            number;
  messageCount:      number;
  remainingAmount:   number;
  remainingMessages: number;
  status:            string;
  createdAt:         Date;
  updatedAt:         Date;
  deletedAt:         null;
}