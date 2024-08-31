import {
  BeforeCreate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { UserType } from './user-type.entity';
import { hash } from 'src/util/hash.util';
import { Transaction } from './transaction.entity';

@Table({
  freezeTableName: true,
  timestamps: true,
  tableName: 'user',
})
export class User extends Model {
  @PrimaryKey
  @Unique
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @ForeignKey(() => UserType)
  userTypeId: string;

  @BelongsTo(() => UserType)
  userType: UserType;

  @HasMany(() => Transaction)
  transaction: Transaction;

  @BeforeCreate
  static async hashPassword(user: User) {
    if (user.password) {
      user.password = await hash(user.password);
    }
  }
}
