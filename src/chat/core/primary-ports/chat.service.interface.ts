import { ChatMessage } from '../models/chat-message.model';
import { ChatClient } from '../models/chat-client.model';
import { Observable } from 'rxjs';

export const IChatServiceProvider = 'IChatServiceProvider';
export interface IChatService {
  newMessage(
    message: string,
    senderId: string,
    timeSent: Date,
  ): Promise<ChatMessage>;

  newClient(id: string, name: string): Promise<ChatClient>;

  getClients(): Promise<ChatClient[]>;

  getMessages(): Promise<ChatMessage[]>;

  deleteClient(id: string): Promise<void>;

  updateTyping(isTyping: boolean, id: string): Promise<ChatClient>;
}
