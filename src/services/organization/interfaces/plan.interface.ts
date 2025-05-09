export interface IPlan {
  id:              number;
  name:            string;
  description:     string;
  contactLimit:    number;
  campaignLimit:   number;
  cost:            number;
  pricePerMessage: number;
  createdAt:       Date;
  updatedAt:       Date;
  deletedAt:       null;
}