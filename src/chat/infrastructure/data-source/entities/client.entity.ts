import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ChatClientEntity {
  @PrimaryColumn()
  public id: string;

  @Column({ unique: true })
  public name: string;
}
