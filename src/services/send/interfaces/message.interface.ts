export enum MessageChannel {
  SMS = 'sms',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
}

export interface IBatchMessage {
  channel: MessageChannel;
  message: string;
  sendToAll?: boolean;
  contacts?: string[];
  country?: string;
  subject?: string; // Para emails
}

//Mantenemos la interfaz anterior para compatibilidad
export interface IMessage {
  message: string
  contacts?: string[]
  country?: string
}
