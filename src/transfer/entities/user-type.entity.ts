import {
  Column,
  DataType,
  HasOne,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { User } from './user.entity';

@Table({
  freezeTableName: true,
  timestamps: true,
  tableName: 'userType',
})
export class UserType extends Model {
  @PrimaryKey
  @Unique
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({ unique: true })
  name: string;

  @HasOne(() => User)
  user: User;
}
