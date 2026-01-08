import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class IpfsProvider {
  private readonly pinataApiKey = process.env.PINATA_API_KEY;
  private readonly pinataSecretKey = process.env.PINATA_API_SECRET;
  private readonly pinataBaseUrl = 'https://api.pinata.cloud';

  public async uploadJSON(data: any, name: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.pinataBaseUrl}/pinning/pinJSONToIPFS`,
        {
          pinataContent: data,
          pinataMetadata: { name },
        },
        {
          headers: {
            pinata_api_key: this.pinataApiKey,
            pinata_secret_api_key: this.pinataSecretKey,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      throw new HttpException('Failed to upload to IPFS', 500);
    }
  }

  public async fetchJSON(ipfsHash: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to fetch from IPFS', 500);
    }
  }

  public async uploadFile(file: Buffer, filename: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file, filename);

      const response = await axios.post(
        `${this.pinataBaseUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            pinata_api_key: this.pinataApiKey,
            pinata_secret_api_key: this.pinataSecretKey,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      throw new HttpException('Failed to upload file to IPFS', 500);
    }
  }
}
