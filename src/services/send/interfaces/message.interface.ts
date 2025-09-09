import { MessageChannel, SmsMessageType } from '../constants/message.constants'

export interface IBatchMessage {
  channel: MessageChannel;
  message: string;
  sendToAll?: boolean;
  contacts?: string[];
  country?: string;
  subject?: string;
  messageType?: SmsMessageType;
}

export interface IMessage {
  message: string
  contacts?: string[]
  country?: string
}
