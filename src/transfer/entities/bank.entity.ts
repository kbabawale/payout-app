import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

@Table({
  freezeTableName: true,
  timestamps: true,
  tableName: 'bank',
})
export class Bank extends Model {
  @PrimaryKey
  @Unique
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;
}
