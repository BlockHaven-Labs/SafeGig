import { Module } from '@nestjs/common';
import { IpfsProvider } from './providers/ipfs-provider';
import { FileService } from './providers/file-service.service';

@Module({
  providers: [FileService, IpfsProvider],
  exports: [FileService]
})
export class FilesModule {}
