export interface IRecharge {
  id:string;
  paymentId:string;
  organizationId:string;
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
