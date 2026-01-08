import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { FileService } from '../files/providers/file-service.service';
import { ethers } from 'ethers';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private filesService: FileService
  ) {}

  @Get('profile/:address')
  public async getProfile(@Param('address') address: string) {
    return this.usersService.getProfile(address);
  }

  @Post('profile')
  public async updateProfile(
    @Body() body: { walletAddress: string; profileData: any }
  ) {
    return this.usersService.updateProfile(
      body.walletAddress,
      body.profileData
    );
  }

  @Get('ipfs/:hash')
  public async getIPFSData(@Param('hash') hash: string) {
    return this.filesService.fetchJSON(hash);
  }

  @Post('sync')
  async manualSync() {
    await this.usersService.syncBlockchainEvents();
    return { message: 'Sync completed' };
  }

  @Get('health/blockchain')
  async checkBlockchain() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    const registryCode = await provider.getCode(
      process.env.REGISTRY_CONTRACT_ADDRESS
    );

    return {
      connected: true,
      blockNumber,
      registryDeployed: registryCode !== '0x',
      rpcUrl: process.env.RPC_URL,
      registryAddress: process.env.REGISTRY_CONTRACT_ADDRESS,
    };
  }
}
