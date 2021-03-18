import { ChatMessage } from '../../core/models/chat-message.model';
import { ChatClient } from '../../core/models/chat-client.model';

export interface WelcomeDto {
  clients: ChatClient[];
  client: ChatClient;
  messages: ChatMessage[];
}
