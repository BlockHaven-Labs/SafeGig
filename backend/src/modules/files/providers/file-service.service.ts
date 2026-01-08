import { Injectable } from '@nestjs/common';
import { IpfsProvider } from './ipfs-provider';

@Injectable()
export class FileService {
    constructor(
        private readonly ipfsProvider: IpfsProvider
    ) {}

    /**
     * fetchJSON
     */
    public async fetchJSON(ipfsHash: string) {
        return this.ipfsProvider.fetchJSON(ipfsHash)
    }
    /**
     * fetchJSON
     */
    public async uploadFile(file: Buffer, filename: string) {
        return this.ipfsProvider.uploadFile(file, filename)
    }
    /**
     * fetchJSON
     */
    public async uploadJSON(data: any, name: string) {
        return this.ipfsProvider.uploadJSON(data, name)
    }
}
