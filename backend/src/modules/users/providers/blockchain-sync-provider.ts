import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ethers } from 'ethers';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncState, User } from '../entities';
import SafeGigRegistryABI from '../../../common/abis/SafeGigRegistry.json';

@Injectable()
export class BlockchainSyncProvider {
  private readonly logger = new Logger(BlockchainSyncProvider.name);
  private provider: ethers.JsonRpcProvider;
  private registryContract: ethers.Contract;

  // Alchemy free tier limit
  private readonly BLOCK_BATCH_SIZE = 10; // Fetch 10 blocks at a time
  private readonly MAX_BLOCKS_PER_SYNC = 1000; // Don't sync more than 50k blocks in one go

  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(SyncState)
    private syncStateRepo: Repository<SyncState>
  ) {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    this.registryContract = new ethers.Contract(
      process.env.REGISTRY_CONTRACT_ADDRESS,
      SafeGigRegistryABI.abi,
      this.provider
    );
  }

  // Sync every 5 minutes
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async syncBlockchainEvents() {
    try {
      await this._syncBlockchainEvents();
    } catch (error) {
      this.logger.error('Sync failed:', error.message);
      throw error;
    }
  }

  public async _syncBlockchainEvents() {
    this.logger.log('Starting blockchain sync...');

    // Get last synced block
    let syncState = await this.syncStateRepo.findOne({
      where: { contract_address: process.env.REGISTRY_CONTRACT_ADDRESS },
    });

    const currentBlock = await this.provider.getBlockNumber();
    let fromBlock = syncState?.last_synced_block + 1 || 0;

    // If this is the first sync and fromBlock is 0, start from contract deployment block
    // You should set this to the actual deployment block to save time
    if (fromBlock === 0) {
      fromBlock = parseInt(process.env.REGISTRY_DEPLOYMENT_BLOCK) || 0;
      this.logger.log(
        `First sync - starting from deployment block ${fromBlock}`
      );
    }

    const toBlock = currentBlock;
    const totalBlocks = toBlock - fromBlock;

    this.logger.log(
      `Syncing from block ${fromBlock} to ${toBlock} (${totalBlocks} blocks)`
    );

    // Don't sync too many blocks at once
    if (totalBlocks > this.MAX_BLOCKS_PER_SYNC) {
      this.logger.warn(
        `Too many blocks to sync (${totalBlocks}). Limiting to ${this.MAX_BLOCKS_PER_SYNC}`
      );
      return await this.syncInBatches(
        fromBlock,
        fromBlock + this.MAX_BLOCKS_PER_SYNC,
        syncState
      );
    }

    return await this.syncInBatches(fromBlock, toBlock, syncState);
  }

  private async syncInBatches(
    fromBlock: number,
    toBlock: number,
    syncState: SyncState | null
  ) {
    let currentFrom = fromBlock;
    let eventsFound = 0;

    while (currentFrom <= toBlock) {
      const currentTo = Math.min(
        currentFrom + this.BLOCK_BATCH_SIZE - 1,
        toBlock
      );

      this.logger.log(
        `Fetching events from block ${currentFrom} to ${currentTo}...`
      );

      try {
        // Fetch UserRegistered events in batches
        const filter = this.registryContract.filters.UserRegistered();
        const events = await this.registryContract.queryFilter(
          filter,
          currentFrom,
          currentTo
        );

        this.logger.log(`Found ${events.length} events in this batch`);

        for (const event of events) {
          await this.handleUserRegisteredEvent(event);
          eventsFound++;
        }

        // Update sync state after each successful batch
        if (!syncState) {
          syncState = this.syncStateRepo.create({
            contract_address: process.env.REGISTRY_CONTRACT_ADDRESS,
          });
        }
        syncState.last_synced_block = currentTo;
        await this.syncStateRepo.save(syncState);

        this.logger.log(`Synced up to block ${currentTo}`);
      } catch (error) {
        this.logger.error(
          `Error syncing blocks ${currentFrom}-${currentTo}:`,
          error.message
        );
        throw error;
      }

      currentFrom = currentTo + 1;

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.logger.log(
      `Sync completed! Processed ${eventsFound} events from block ${fromBlock} to ${toBlock}`
    );

    return {
      fromBlock,
      toBlock,
      eventsFound,
      lastSyncedBlock: toBlock,
    };
  }

  private async handleUserRegisteredEvent(event: any) {
    const [userAddress, userType, timestamp] = event.args;
    const walletAddress = userAddress.toLowerCase();

    // Check if user exists
    let user = await this.usersRepo.findOne({
      where: { wallet_address: walletAddress },
    });

    if (user) {
      this.logger.log(`User ${walletAddress} already indexed, skipping`);
      return;
    }

    try {
      // Fetch full profile data from contract
      const profile = await this.registryContract.userProfiles(userAddress);

      user = this.usersRepo.create({
        wallet_address: walletAddress,
        metadata_uri: profile.metadataURI,
        user_type: Number(userType),
        location: profile.location,
        is_active: profile.isActive,
        is_verified: profile.isVerified,
        registration_time: Number(timestamp),
        last_synced_block: event.blockNumber,
      });

      await this.usersRepo.save(user);
      this.logger.log(
        `✅ Indexed new user: ${walletAddress} (type: ${userType})`
      );
    } catch (error) {
      this.logger.error(
        `Failed to index user ${walletAddress}:`,
        error.message
      );
    }
  }
}
