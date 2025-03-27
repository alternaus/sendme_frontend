export interface IFilterMessage {
  content?: string;
  contentType?: "plain_text" | "html";
  status?: string;
  sentAt?: string; // ISO 8601
  recipientDetails?: string;
  countryCode?: string;
  messageType?: "SMS" | "WhatsApp" | string;
  page?: number;
  limit?: number;
  providerId?: number;
  campaignId?: number;
  contactId?: number;
  startDate?: string;
  endDate?: string;
}
