import React, { useState, useEffect } from 'react';
import { User, Award, Download, Share2, QrCode, Calendar, Building } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { useIPFS } from '../contexts/IPFSContext';
import QRCodeLib from 'qrcode';

interface Certificate {
  tokenId: number;
  ipfsHash: string;
  certificateType: string;
  institutionName: string;
  timestamp: number;
  isValid: boolean;
  metadata?: any;
}

export const StudentDashboard: React.FC = () => {
  const { contract, account, isConnected } = useWeb3();
  const { getFile } = useIPFS();
  
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    if (isConnected && account && contract) {
      loadCertificates();
    }
  }, [isConnected, account, contract]);

  const loadCertificates = async () => {
    if (!contract || !account) return;

    setLoading(true);
    try {
      const tokenIds = await contract.getStudentCertificates(account);
      
      const certificatePromises = tokenIds.map(async (tokenId: number) => {
        try {
          const certData = await contract.getCertificate(tokenId);
          
          // Try to get metadata from IPFS
          let metadata = null;
          try {
            const metadataJson = await getFile(certData.ipfsHash);
            metadata = JSON.parse(metadataJson);
          } catch (ipfsError) {
            console.warn('Could not fetch metadata for certificate', tokenId);
          }

          return {
            tokenId,
            ipfsHash: certData.ipfsHash,
            certificateType: certData.certificateType,
            institutionName: certData.institutionName,
            timestamp: certData.timestamp,
            isValid: certData.isValid,
            metadata
          };
        } catch (error) {
          console.error('Error loading certificate', tokenId, error);
          return null;
        }
      });

      const results = await Promise.all(certificatePromises);
      setCertificates(results.filter(cert => cert !== null) as Certificate[]);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (certificate: Certificate) => {
    const verificationUrl = `${window.location.origin}/certificate/${certificate.tokenId}`;
    const qrCodeDataUrl = await QRCodeLib.toDataURL(verificationUrl);
    setQrCode(qrCodeDataUrl);
    setSelectedCert(certificate);
  };

  const shareCertificate = (certificate: Certificate) => {
    const verificationUrl = `${window.location.origin}/certificate/${certificate.tokenId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Certificate - ${certificate.metadata?.courseName || certificate.certificateType}`,
        text: `Verify my certificate from ${certificate.institutionName}`,
        url: verificationUrl
      });
    } else {
      navigator.clipboard.writeText(verificationUrl);
      alert('Verification link copied to clipboard!');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getCertificateTypeColor = (type: string) => {
    const colors = {
      completion: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      achievement: 'bg-green-500/20 text-green-400 border-green-500/30',
      degree: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      diploma: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      certification: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <User className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your certificates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <User className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Student Dashboard</h1>
          <p className="text-xl text-gray-400">
            View and manage your verified digital certificates
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{certificates.length}</p>
                <p className="text-gray-400">Total Certificates</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3">
              <Building className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {new Set(certificates.map(c => c.institutionName)).size}
                </p>
                <p className="text-gray-400">Institutions</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {certificates.filter(c => c.isValid).length}
                </p>
                <p className="text-gray-400">Valid Certificates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your certificates...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Certificates Yet</h3>
            <p className="text-gray-400">Your certificates will appear here once institutions issue them to you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div
                key={certificate.tokenId}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {certificate.metadata?.courseName || certificate.certificateType}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">{certificate.institutionName}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getCertificateTypeColor(certificate.certificateType)}`}>
                      {certificate.certificateType}
                    </span>
                  </div>
                  
                  {certificate.isValid ? (
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {certificate.metadata?.grade && (
                    <p className="text-sm text-gray-300">
                      <span className="font-medium">Grade:</span> {certificate.metadata.grade}
                    </p>
                  )}
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Issued:</span> {
                      certificate.metadata?.issueDate || formatDate(certificate.timestamp)
                    }
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Token ID:</span> {certificate.tokenId}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => generateQRCode(certificate)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR Code</span>
                  </button>
                  
                  <button
                    onClick={() => shareCertificate(certificate)}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QR Code Modal */}
        {selectedCert && qrCode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                Certificate QR Code
              </h3>
              
              <div className="bg-white p-4 rounded-lg mb-4">
                <img src={qrCode} alt="QR Code" className="mx-auto" />
              </div>
              
              <p className="text-sm text-gray-400 text-center mb-6">
                Scan this QR code to verify the certificate
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedCert(null);
                    setQrCode('');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
                
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `certificate-${selectedCert.tokenId}-qr.png`;
                    link.href = qrCode;
                    link.click();
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};