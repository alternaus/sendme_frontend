export interface IFilterMessage {
  content?: string;
  contentType?: "plain_text" | "html";
  status?: string;
  sentAt?: string;
  recipientDetails?: string;
  countryCode?: string;
  messageType?: "SMS" | "WhatsApp" | string;
  page?: number;
  limit?: number;
  providerId?:string;
  campaignId?:string;
  contactId?:string;
  startDate?: string;
  endDate?: string;
}
