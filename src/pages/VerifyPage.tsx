import React, { useState } from 'react';
import { Shield, Search, QrCode, CheckCircle, XCircle, Loader2, Camera } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { useIPFS } from '../contexts/IPFSContext';
import { Html5QrcodeScanner } from 'html5-qrcode';

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

export const VerifyPage: React.FC = () => {
  const { contract } = useWeb3();
  const { getFile } = useIPFS();
  
  const [verificationMethod, setVerificationMethod] = useState<'manual' | 'qr'>('manual');
  const [tokenId, setTokenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrScanner, setQrScanner] = useState<Html5QrcodeScanner | null>(null);

  const verifyCertificate = async (id: string) => {
    if (!contract) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setCertificate(null);

    try {
      // Get certificate data from blockchain
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
      setError(err.message || 'Certificate not found or invalid');
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenId.trim()) {
      verifyCertificate(tokenId.trim());
    }
  };

  const startQRScanner = () => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        // Extract token ID from URL or use directly
        const urlMatch = decodedText.match(/\/certificate\/(\d+)/);
        const id = urlMatch ? urlMatch[1] : decodedText;
        
        setTokenId(id);
        verifyCertificate(id);
        scanner.clear();
        setQrScanner(null);
      },
      (error) => {
        console.warn('QR scan error:', error);
      }
    );

    setQrScanner(scanner);
  };

  const stopQRScanner = () => {
    if (qrScanner) {
      qrScanner.clear();
      setQrScanner(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Verify Certificate</h1>
          <p className="text-xl text-gray-400">
            Instantly verify the authenticity of educational certificates
          </p>
        </div>

        {/* Verification Method Selection */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={() => {
                setVerificationMethod('manual');
                stopQRScanner();
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all ${
                verificationMethod === 'manual'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-slate-600 hover:border-blue-500/50 text-gray-400'
              }`}
            >
              <Search className="w-5 h-5" />
              <span>Manual Entry</span>
            </button>
            
            <button
              onClick={() => {
                setVerificationMethod('qr');
                if (!qrScanner) startQRScanner();
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all ${
                verificationMethod === 'qr'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-slate-600 hover:border-blue-500/50 text-gray-400'
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span>QR Code Scan</span>
            </button>
          </div>

          {verificationMethod === 'manual' && (
            <form onSubmit={handleManualVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Certificate Token ID
                </label>
                <input
                  type="text"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="Enter certificate token ID..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !tokenId.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Verify Certificate</span>
                  </>
                )}
              </button>
            </form>
          )}

          {verificationMethod === 'qr' && (
            <div className="text-center">
              <div id="qr-reader" className="mx-auto mb-4"></div>
              {qrScanner && (
                <button
                  onClick={stopQRScanner}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Stop Scanner
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">Verification Failed</h3>
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Display */}
        {certificate && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-6">
              {certificate.isValid ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {certificate.isValid ? 'Valid Certificate' : 'Invalid Certificate'}
                </h2>
                <p className="text-gray-400">Token ID: {certificate.tokenId}</p>
              </div>
            </div>

            {certificate.isValid && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                      Student Information
                    </h3>
                    <div className="mt-2">
                      {certificate.metadata?.studentName && (
                        <p className="text-lg font-semibold text-white">
                          {certificate.metadata.studentName}
                        </p>
                      )}
                      {certificate.metadata?.studentEmail && (
                        <p className="text-gray-400">{certificate.metadata.studentEmail}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Wallet: {formatAddress(certificate.student)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                      Certificate Details
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-white">
                        <span className="font-medium">Type:</span> {certificate.certificateType}
                      </p>
                      {certificate.metadata?.courseName && (
                        <p className="text-white">
                          <span className="font-medium">Course:</span> {certificate.metadata.courseName}
                        </p>
                      )}
                      {certificate.metadata?.grade && (
                        <p className="text-white">
                          <span className="font-medium">Grade:</span> {certificate.metadata.grade}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                      Institution
                    </h3>
                    <p className="text-lg font-semibold text-white mt-2">
                      {certificate.institutionName}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                      Dates
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-white">
                        <span className="font-medium">Issued:</span> {
                          certificate.metadata?.issueDate || formatDate(certificate.timestamp)
                        }
                      </p>
                      {certificate.metadata?.expiryDate && (
                        <p className="text-white">
                          <span className="font-medium">Expires:</span> {certificate.metadata.expiryDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                      Blockchain Info
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-400">
                        IPFS Hash: {certificate.ipfsHash.slice(0, 20)}...
                      </p>
                      <p className="text-sm text-gray-400">
                        Timestamp: {formatDate(certificate.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {certificate.metadata?.description && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Description
                </h3>
                <p className="text-gray-300">{certificate.metadata.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};