import { Injectable } from '@nestjs/common';
import { ChatClient } from '../models/chat-client.model';
import { ChatMessage } from '../models/chat-message.model';
import { IChatService } from '../primary-ports/chat.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatClientEntity } from '../../infrastructure/data-source/entities/client.entity';
import { getConnection, Repository } from 'typeorm';
import { ChatMessageEntity } from '../../infrastructure/data-source/entities/message.entity';

@Injectable()
export class ChatService implements IChatService {
  constructor(
    @InjectRepository(ChatClientEntity)
    private clientRepository: Repository<ChatClientEntity>,
    @InjectRepository(ChatMessageEntity)
    private messageRepository: Repository<ChatMessageEntity>,
  ) {}

  async newMessage(
    message: string,
    senderId: string,
    timeSent: Date,
  ): Promise<ChatMessage> {
    const clientDb = await this.clientRepository.findOne({ id: senderId });
    const chatClient: ChatClient = JSON.parse(JSON.stringify(clientDb));

    let chatMessage = this.messageRepository.create();
    chatMessage.message = message;
    chatMessage.sender = chatClient;
    chatMessage.timeSent = timeSent;
    chatMessage = await this.messageRepository.save(chatMessage);

    return chatMessage;
  }

  async newClient(id: string, name: string): Promise<ChatClient> {
    const clientDb = await this.clientRepository.findOne({ name: name });
    if (!clientDb) {
      let client = this.clientRepository.create();
      client.id = id;
      client.name = name;
      client = await this.clientRepository.save(client);

      return { id: '' + client.id, name: client.name };
    }
    if (clientDb.id === id) {
      return { id: clientDb.id, name: clientDb.name };
    } else {
      throw new Error('NickName already used!');
    }
  }

  async getClients(): Promise<ChatClient[]> {
    const clientList = await this.clientRepository.find();
    const chatClients: ChatClient[] = JSON.parse(JSON.stringify(clientList));
    return chatClients;
  }

  async getMessages(): Promise<ChatMessage[]> {
    const messageList = await this.messageRepository.find({
      join: {
        alias: 'message',
        innerJoinAndSelect: { client: 'message.sender' },
      },
    });
    const chatMessage: ChatMessage[] = JSON.parse(JSON.stringify(messageList));

    console.log(chatMessage);

    return chatMessage;
  }

  async deleteClient(id: string): Promise<void> {
    const messageList = await this.messageRepository.find({
      join: {
        alias: 'message',
        innerJoinAndSelect: { client: 'message.sender' },
      },
    });
    const chatMessage: ChatMessage[] = JSON.parse(JSON.stringify(messageList));
    await chatMessage.forEach((m) => {
      console.log(m);
      console.log(m.sender.name);
      console.log(m.sender.id);

      if (m.sender.id === id) {
        getConnection()
          .createQueryBuilder()
          .update(ChatMessageEntity)
          .set({ senderName: m.sender.name, sender: null })
          .where('sender.id = :id', { id: id })
          .execute();
      }
    });

    await this.clientRepository.delete({ id: id });
    console.log('Deleted');
  }

  async updateTyping(isTyping: boolean, id: string): Promise<ChatClient> {
    const client = await this.clientRepository.find({ id: id });
    const chatClient: ChatClient = JSON.parse(JSON.stringify(client));

    return {
      id: chatClient[0].id,
      name: chatClient[0].name,
      isTyping,
    };
  }
}
