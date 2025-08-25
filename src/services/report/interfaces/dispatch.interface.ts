// Respuesta individual del dispatch
export interface ICampaignDispatch {
  id: number;
  campaignId: number;
  sentAt: string;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  notes: string;
  providerId: number;
  createdAt: string;
  updatedAt: string;
  campaign: {
    id: number;
    name: string;
    description: string;
  };
  provider: {
    id: number;
    name: string;
  };
  status: string;
  processingTimeMs: number | null;
  systemTimezone: string;
  eligibleContacts: number | null;
  totalContacts: number | null;
  errors: unknown[];
  // Campos calculados para mostrar en la tabla
  recipientDetails?: string;
}
