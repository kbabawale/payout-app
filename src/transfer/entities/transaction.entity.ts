import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { User } from './user.entity';

export enum TransactionStatus {
  INITIATED = 'INITIATED',
  FAILED = 'FAILED',
  AUTHORIZED = 'AUTHORIZED',
}

@Table({
  freezeTableName: true,
  timestamps: true,
  tableName: 'transaction',
})
export class Transaction extends Model {
  @PrimaryKey
  @Unique
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column
  amount: number;

  @Column({ defaultValue: TransactionStatus.INITIATED })
  status: string;

  @ForeignKey(() => User)
  userId: string;

  @BelongsTo(() => User)
  user: User;
}
