import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ChatClientEntity } from './client.entity';

@Entity()
export class ChatMessageEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => ChatClientEntity)
  @JoinColumn()
  public sender?: ChatClientEntity;

  @Column({
    nullable: true,
  })
  public senderName?: string;

  @Column()
  public message: string;

  @Column()
  public timeSent: Date;
}
