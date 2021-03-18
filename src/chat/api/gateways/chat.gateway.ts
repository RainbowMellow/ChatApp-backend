import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from '../../core/services/chat.service';
import { WelcomeDto } from '../dtos/welcome.dto';
import { Inject } from '@nestjs/common';
import {
  IChatService,
  IChatServiceProvider,
} from '../../core/primary-ports/chat.service.interface';
import { ChatMessage } from '../../core/models/chat-message.model';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(IChatServiceProvider) private chatService: IChatService,
  ) {}

  @WebSocketServer() server;

  @SubscribeMessage('message')
  async handleChatEvent(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const chatMessage = await this.chatService.newMessage(
      message,
      client.id,
      new Date(),
    );
    this.server.emit('newMessage', chatMessage);
  }

  @SubscribeMessage('name')
  async handleNameEvent(
    @MessageBody() name: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const chatClient = await this.chatService.newClient(client.id, name);
      const chatClients = await this.chatService.getClients();
      const welcome: WelcomeDto = {
        clients: chatClients,
        messages: await this.chatService.getMessages(),
        client: chatClient,
      };
      client.emit('welcome', welcome);
      this.server.emit('clients', chatClients);
    } catch (e) {
      client.error(e.message);
    }
  }

  @SubscribeMessage('isTyping')
  async handleTypingEvent(
    @MessageBody() isTyping: boolean,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      console.log('typing', isTyping);
      const chatClient = await this.chatService.updateTyping(
        isTyping,
        client.id,
      );
      if (chatClient) {
        console.log(chatClient);

        this.server.emit('clientTyping', chatClient);
      }
    } catch (e) {
      client.error(e.message);
    }
  }

  async handleConnection(client: Socket, ...args: any[]): Promise<any> {
    console.log('Client Connect', client.id);
    client.emit('allMessages', this.chatService.getMessages());
    this.server.emit('clients', await this.chatService.getClients());
  }

  async handleDisconnect(client: Socket): Promise<any> {
    await this.chatService.deleteClient(client.id);
    this.server.emit('clients', await this.chatService.getClients());
    console.log('Client Disconnect', client.id);
  }
}
