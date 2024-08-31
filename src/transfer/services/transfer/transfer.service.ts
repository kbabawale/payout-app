import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserType } from '../../entities/user-type.entity';
import { User } from '../../entities/user.entity';

/**
 * Class for initializing database models and seed inputs
 */

@Injectable()
export class TransferService implements OnModuleInit {
  constructor(
    @InjectModel(UserType) private readonly userTypeModel: typeof UserType,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  onModuleInit() {
    this.initOperation();
  }

  /**
   * Populate necessary data into tables
   */
  async initOperation() {
    this.populateUsers();
  }

  async populateUsers() {
    try {
      const numOfRecords = await this.userTypeModel.count();
      if (numOfRecords === 0) {
        const created = await this.userTypeModel.bulkCreate([
          { name: 'Regular' },
          { name: 'Admin' },
        ]);
        if (created) {
          // add regular user
          const regularUserTypeId = created.find(
            (x) => x.dataValues['name'].toUpperCase() === 'REGULAR',
          );
          const usersA = await this.userModel.findOne({
            where: { email: 'regularman@example.com' },
          });
          if (!usersA) {
            await this.userModel.create({
              firstName: 'Regular',
              lastName: 'Man',
              userName: 'regularman',
              password: 'password',
              email: 'regularman@example.com',
              userTypeId: regularUserTypeId.id,
            });
          }
          // add admin user
          const adminUserTypeId = created.find(
            (x) => x.dataValues['name'].toUpperCase() === 'ADMIN',
          );
          const usersB = await this.userModel.findOne({
            where: { email: 'adminman@example.com' },
          });
          if (!usersB) {
            await this.userModel.create({
              firstName: 'Admin',
              lastName: 'Man',
              userName: 'adminman',
              password: 'password',
              email: 'adminman@example.com',
              userTypeId: adminUserTypeId.id,
            });
          }
        }
      }
    } catch (error: any) {
      console.error(error);
    }
  }
}
