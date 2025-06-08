import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Award, CheckCircle, XCircle, Download, Share2, Calendar, User, Building } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { useIPFS } from '../contexts/IPFSContext';

interface CertificateData {
  tokenId: string;
  student: string;
  ipfsHash: string;
  certificateType: string;
  institutionName: string;
  timestamp: number;
  isValid: boolean;
  metadata?: any;
}

export const CertificateView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { contract } = useWeb3();
  const { getFile } = useIPFS();
  
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && contract) {
      loadCertificate();
    }
  }, [id, contract]);

  const loadCertificate = async () => {
    if (!id || !contract) return;

    setLoading(true);
    setError(null);

    try {
      const certData = await contract.getCertificate(parseInt(id));
      
      // Get metadata from IPFS
      let metadata = null;
      try {
        const metadataJson = await getFile(certData.ipfsHash);
        metadata = JSON.parse(metadataJson);
      } catch (ipfsError) {
        console.warn('Could not fetch metadata from IPFS:', ipfsError);
      }

      setCertificate({
        tokenId: id,
        student: certData.student,
        ipfsHash: certData.ipfsHash,
        certificateType: certData.certificateType,
        institutionName: certData.institutionName,
        timestamp: certData.timestamp,
        isValid: certData.isValid,
        metadata
      });

    } catch (err: any) {
      setError('Certificate not found or invalid');
    } finally {
      setLoading(false);
    }
  };

  const shareCertificate = () => {
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: `Certificate - ${certificate?.metadata?.courseName || certificate?.certificateType}`,
        text: `Verify this certificate from ${certificate?.institutionName}`,
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Certificate link copied to clipboard!');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Certificate Not Found</h2>
          <p className="text-gray-400">{error || 'The requested certificate could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            {certificate.isValid ? (
              <CheckCircle className="w-12 h-12 text-green-400" />
            ) : (
              <XCircle className="w-12 h-12 text-red-400" />
            )}
            <h1 className="text-4xl font-bold text-white">
              {certificate.isValid ? 'Verified Certificate' : 'Invalid Certificate'}
            </h1>
          </div>
          <p className="text-xl text-gray-400">Token ID: {certificate.tokenId}</p>
        </div>

        {certificate.isValid && (
          <>
            {/* Certificate Card */}
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl p-8 border border-blue-500/30 mb-8">
              <div className="text-center mb-8">
                <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">
                  Certificate of {certificate.certificateType}
                </h2>
                <p className="text-xl text-gray-300">
                  {certificate.metadata?.courseName || 'Educational Achievement'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-400">Awarded to</p>
                      <p className="text-lg font-semibold text-white">
                        {certificate.metadata?.studentName || 'Student'}
                      </p>
                      {certificate.metadata?.studentEmail && (
                        <p className="text-sm text-gray-400">{certificate.metadata.studentEmail}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-400">Issued by</p>
                      <p className="text-lg font-semibold text-white">
                        {certificate.institutionName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-400">Issue Date</p>
                      <p className="text-lg font-semibold text-white">
                        {certificate.metadata?.issueDate || formatDate(certificate.timestamp)}
                      </p>
                    </div>
                  </div>

                  {certificate.metadata?.grade && (
                    <div>
                      <p className="text-sm text-gray-400">Grade/Score</p>
                      <p className="text-lg font-semibold text-white">
                        {certificate.metadata.grade}
                      </p>
                    </div>
                  )}

                  {certificate.metadata?.expiryDate && (
                    <div>
                      <p className="text-sm text-gray-400">Expiry Date</p>
                      <p className="text-lg font-semibold text-white">
                        {certificate.metadata.expiryDate}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {certificate.metadata?.description && (
                <div className="mt-8 pt-8 border-t border-blue-500/30">
                  <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                  <p className="text-gray-300">{certificate.metadata.description}</p>
                </div>
              )}
            </div>

            {/* Blockchain Details */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Blockchain Verification</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Student Wallet</p>
                  <p className="text-white font-mono text-sm break-all">
                    {certificate.student}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">IPFS Hash</p>
                  <p className="text-white font-mono text-sm break-all">
                    {certificate.ipfsHash}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Blockchain Timestamp</p>
                  <p className="text-white">{formatDate(certificate.timestamp)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    Verified on Blockchain
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={shareCertificate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Share2 className="w-5 h-5" />
                <span>Share Certificate</span>
              </button>
              
              <button
                onClick={() => window.print()}
                className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </>
        )}

        {!certificate.isValid && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-8 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-red-400 mb-2">Certificate Revoked</h3>
            <p className="text-red-300">
              This certificate has been revoked by the issuing institution and is no longer valid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};