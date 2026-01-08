import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserProfile } from '../entities';
import { FileService } from 'src/modules/files/providers/file-service.service';
import { BlockchainSyncProvider } from './blockchain-sync-provider';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(UserProfile)
    private profilesRepo: Repository<UserProfile>,

    private fileService: FileService,
    private blockchainSyncProvider: BlockchainSyncProvider,
  ) {}

  // Get user profile (from DB for speed)
  public async getProfile(walletAddress: string) {
    const user = await this.usersRepo.findOne({
      where: { wallet_address: walletAddress.toLowerCase() },
      relations: ['profile', 'skills'],
    });

    if (!user) return null;

    // If metadata_uri exists but profile not in DB, fetch from IPFS
    if (user.metadata_uri && !user.profile) {
      await this.syncProfileFromIPFS(user);
    }

    return user;
  }

  // Create/Update profile and upload to IPFS
  public async updateProfile(walletAddress: string, profileData: any) {
    // 1. Upload to IPFS
    const ipfsHash = await this.fileService.uploadJSON(
      profileData,
      `profile-${walletAddress}`
    );

    // 2. Get IPFS URI
    const metadataUri = `ipfs://${ipfsHash}`;

    // 3. Update or create user in DB
    let user = await this.usersRepo.findOne({
      where: { wallet_address: walletAddress.toLowerCase() },
    });

    if (!user) {
      user = this.usersRepo.create({
        wallet_address: walletAddress.toLowerCase(),
        metadata_uri: metadataUri,
      });
    } else {
      user.metadata_uri = metadataUri;
    }

    await this.usersRepo.save(user);

    // 4. Update profile table
    await this.syncProfileFromIPFS(user);

    return { metadataUri, ipfsHash };
  }

  // Sync profile data from IPFS to DB
  private async syncProfileFromIPFS(user: User) {
    if (!user.metadata_uri) return;

    const ipfsHash = user.metadata_uri.replace('ipfs://', '');
    const profileData = await this.fileService.fetchJSON(ipfsHash);

    // Upsert profile
    let profile = await this.profilesRepo.findOne({
      where: { user_id: user.id },
    });

    if (!profile) {
      profile = this.profilesRepo.create({ user_id: user.id });
    }

    profile.name = profileData.name;
    profile.title = profileData.title;
    profile.bio = profileData.bio;
    profile.languages = profileData.languages;
    profile.experience = profileData.experience;
    profile.avatar_ipfs_hash = profileData.avatarHash;

    await this.profilesRepo.save(profile);
  }

  public async syncBlockchainEvents() {
    return this.blockchainSyncProvider.syncBlockchainEvents()
  }
}