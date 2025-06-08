import { ethers } from 'ethers';

// Smart contract ABI (simplified for demo)
const CONTRACT_ABI = [
  "function issueCertificate(address student, string memory ipfsHash, string memory certificateType, string memory institutionName) public returns (uint256)",
  "function getCertificate(uint256 tokenId) public view returns (address student, string memory ipfsHash, string memory certificateType, string memory institutionName, uint256 timestamp, bool isValid)",
  "function verifyCertificate(uint256 tokenId) public view returns (bool)",
  "function revokeCertificate(uint256 tokenId) public",
  "function getStudentCertificates(address student) public view returns (uint256[] memory)",
  "function getInstitutionCertificates(address institution) public view returns (uint256[] memory)",
  "event CertificateIssued(uint256 indexed tokenId, address indexed student, address indexed institution, string ipfsHash)",
  "event CertificateRevoked(uint256 indexed tokenId)"
];

// Contract address (would be deployed on testnet/mainnet)
const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890";

export class EduCertContract {
  private contract: ethers.Contract;
  private signer: ethers.JsonRpcSigner;

  constructor(signer: ethers.JsonRpcSigner) {
    this.signer = signer;
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }

  async issueCertificate(
    studentAddress: string,
    ipfsHash: string,
    certificateType: string,
    institutionName: string
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const tx = await this.contract.issueCertificate(
        studentAddress,
        ipfsHash,
        certificateType,
        institutionName
      );
      return tx;
    } catch (error) {
      console.error('Error issuing certificate:', error);
      throw error;
    }
  }

  async getCertificate(tokenId: number) {
    try {
      const result = await this.contract.getCertificate(tokenId);
      return {
        student: result[0],
        ipfsHash: result[1],
        certificateType: result[2],
        institutionName: result[3],
        timestamp: Number(result[4]),
        isValid: result[5]
      };
    } catch (error) {
      console.error('Error getting certificate:', error);
      throw error;
    }
  }

  async verifyCertificate(tokenId: number): Promise<boolean> {
    try {
      return await this.contract.verifyCertificate(tokenId);
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw error;
    }
  }

  async revokeCertificate(tokenId: number): Promise<ethers.ContractTransactionResponse> {
    try {
      const tx = await this.contract.revokeCertificate(tokenId);
      return tx;
    } catch (error) {
      console.error('Error revoking certificate:', error);
      throw error;
    }
  }

  async getStudentCertificates(studentAddress: string): Promise<number[]> {
    try {
      const result = await this.contract.getStudentCertificates(studentAddress);
      return result.map((id: any) => Number(id));
    } catch (error) {
      console.error('Error getting student certificates:', error);
      throw error;
    }
  }

  async getInstitutionCertificates(institutionAddress: string): Promise<number[]> {
    try {
      const result = await this.contract.getInstitutionCertificates(institutionAddress);
      return result.map((id: any) => Number(id));
    } catch (error) {
      console.error('Error getting institution certificates:', error);
      throw error;
    }
  }
}