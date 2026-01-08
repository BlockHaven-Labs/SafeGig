import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './providers/users.service';
import { SyncState, UserProfile, UserSkill } from './entities';
import { BlockchainSyncProvider } from './providers/blockchain-sync-provider';
import { UsersController } from './users.controller';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule, TypeOrmModule.forFeature([User, UserProfile, UserSkill, SyncState]),],
  controllers: [UsersController],
  providers: [UsersService, BlockchainSyncProvider],
  exports: [UsersService],
})
export class UsersModule {}
