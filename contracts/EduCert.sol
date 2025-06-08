// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title EduCert
 * @dev Smart contract for issuing and managing educational certificates as NFTs
 */
contract EduCert is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct Certificate {
        address student;
        string ipfsHash;
        string certificateType;
        string institutionName;
        address issuer;
        uint256 timestamp;
        bool isValid;
    }

    // Mapping from token ID to certificate data
    mapping(uint256 => Certificate) public certificates;
    
    // Mapping from student address to array of token IDs
    mapping(address => uint256[]) public studentCertificates;
    
    // Mapping from institution address to array of token IDs
    mapping(address => uint256[]) public institutionCertificates;
    
    // Mapping to track authorized institutions
    mapping(address => bool) public authorizedInstitutions;

    // Events
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed student,
        address indexed institution,
        string ipfsHash,
        string certificateType
    );
    
    event CertificateRevoked(uint256 indexed tokenId);
    
    event InstitutionAuthorized(address indexed institution);
    
    event InstitutionRevoked(address indexed institution);

    constructor() ERC721("EduCert", "EDUCERT") {}

    /**
     * @dev Authorize an institution to issue certificates
     * @param institution Address of the institution to authorize
     */
    function authorizeInstitution(address institution) external onlyOwner {
        authorizedInstitutions[institution] = true;
        emit InstitutionAuthorized(institution);
    }

    /**
     * @dev Revoke authorization for an institution
     * @param institution Address of the institution to revoke
     */
    function revokeInstitutionAuthorization(address institution) external onlyOwner {
        authorizedInstitutions[institution] = false;
        emit InstitutionRevoked(institution);
    }

    /**
     * @dev Issue a new certificate
     * @param student Address of the student receiving the certificate
     * @param ipfsHash IPFS hash containing certificate metadata
     * @param certificateType Type of certificate (e.g., "completion", "achievement")
     * @param institutionName Name of the issuing institution
     * @return tokenId The ID of the newly minted certificate
     */
    function issueCertificate(
        address student,
        string memory ipfsHash,
        string memory certificateType,
        string memory institutionName
    ) external returns (uint256) {
        require(student != address(0), "Invalid student address");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(certificateType).length > 0, "Certificate type cannot be empty");
        require(bytes(institutionName).length > 0, "Institution name cannot be empty");

        // For demo purposes, we'll allow any address to issue certificates
        // In production, you might want to restrict this to authorized institutions
        // require(authorizedInstitutions[msg.sender], "Institution not authorized");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        // Mint the NFT to the student
        _safeMint(student, tokenId);
        _setTokenURI(tokenId, ipfsHash);

        // Store certificate data
        certificates[tokenId] = Certificate({
            student: student,
            ipfsHash: ipfsHash,
            certificateType: certificateType,
            institutionName: institutionName,
            issuer: msg.sender,
            timestamp: block.timestamp,
            isValid: true
        });

        // Update mappings
        studentCertificates[student].push(tokenId);
        institutionCertificates[msg.sender].push(tokenId);

        emit CertificateIssued(tokenId, student, msg.sender, ipfsHash, certificateType);
        
        return tokenId;
    }

    /**
     * @dev Revoke a certificate (only by the issuer)
     * @param tokenId ID of the certificate to revoke
     */
    function revokeCertificate(uint256 tokenId) external {
        require(_exists(tokenId), "Certificate does not exist");
        require(certificates[tokenId].issuer == msg.sender, "Only issuer can revoke certificate");
        require(certificates[tokenId].isValid, "Certificate already revoked");

        certificates[tokenId].isValid = false;
        emit CertificateRevoked(tokenId);
    }

    /**
     * @dev Get certificate data
     * @param tokenId ID of the certificate
     * @return Certificate data
     */
    function getCertificate(uint256 tokenId) external view returns (
        address student,
        string memory ipfsHash,
        string memory certificateType,
        string memory institutionName,
        uint256 timestamp,
        bool isValid
    ) {
        require(_exists(tokenId), "Certificate does not exist");
        
        Certificate memory cert = certificates[tokenId];
        return (
            cert.student,
            cert.ipfsHash,
            cert.certificateType,
            cert.institutionName,
            cert.timestamp,
            cert.isValid
        );
    }

    /**
     * @dev Verify if a certificate is valid
     * @param tokenId ID of the certificate to verify
     * @return bool indicating if the certificate is valid
     */
    function verifyCertificate(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) {
            return false;
        }
        return certificates[tokenId].isValid;
    }

    /**
     * @dev Get all certificate IDs for a student
     * @param student Address of the student
     * @return Array of token IDs
     */
    function getStudentCertificates(address student) external view returns (uint256[] memory) {
        return studentCertificates[student];
    }

    /**
     * @dev Get all certificate IDs issued by an institution
     * @param institution Address of the institution
     * @return Array of token IDs
     */
    function getInstitutionCertificates(address institution) external view returns (uint256[] memory) {
        return institutionCertificates[institution];
    }

    /**
     * @dev Get the total number of certificates issued
     * @return Total number of certificates
     */
    function getTotalCertificates() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}