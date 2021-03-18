import { ChatClient } from './chat-client.model';

export interface ChatMessage {
  sender?: ChatClient;
  senderName?: string;
  message: string;
  timeSent: Date;
}
