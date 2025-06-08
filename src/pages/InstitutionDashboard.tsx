import React, { useState, useEffect } from 'react';
import { Building, Award, Users, TrendingUp, Plus, Eye, XCircle } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { useIPFS } from '../contexts/IPFSContext';
import { Link } from 'react-router-dom';

interface Certificate {
  tokenId: number;
  student: string;
  ipfsHash: string;
  certificateType: string;
  institutionName: string;
  timestamp: number;
  isValid: boolean;
  metadata?: any;
}

export const InstitutionDashboard: React.FC = () => {
  const { contract, account, isConnected } = useWeb3();
  const { getFile } = useIPFS();
  
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    active: 0,
    revoked: 0
  });

  useEffect(() => {
    if (isConnected && account && contract) {
      loadCertificates();
    }
  }, [isConnected, account, contract]);

  const loadCertificates = async () => {
    if (!contract || !account) return;

    setLoading(true);
    try {
      const tokenIds = await contract.getInstitutionCertificates(account);
      
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
            student: certData.student,
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
      const validCertificates = results.filter(cert => cert !== null) as Certificate[];
      setCertificates(validCertificates);

      // Calculate stats
      const now = Date.now();
      const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
      
      setStats({
        total: validCertificates.length,
        thisMonth: validCertificates.filter(cert => 
          cert.timestamp * 1000 > oneMonthAgo
        ).length,
        active: validCertificates.filter(cert => cert.isValid).length,
        revoked: validCertificates.filter(cert => !cert.isValid).length
      });

    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeCertificate = async (tokenId: number) => {
    if (!contract) return;

    try {
      const tx = await contract.revokeCertificate(tokenId);
      await tx.wait();
      
      // Reload certificates
      loadCertificates();
    } catch (error) {
      console.error('Error revoking certificate:', error);
      alert('Failed to revoke certificate');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
          <Building className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to access the institution dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Institution Dashboard</h1>
            <p className="text-xl text-gray-400">
              Manage and track your issued certificates
            </p>
          </div>
          
          <Link
            to="/issue"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Issue Certificate</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-gray-400">Total Issued</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
                <p className="text-gray-400">This Month</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
                <p className="text-gray-400">Active</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3">
              <XCircle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.revoked}</p>
                <p className="text-gray-400">Revoked</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h2 className="text-xl font-semibold text-white">Issued Certificates</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading certificates...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Certificates Issued</h3>
              <p className="text-gray-400 mb-6">Start by issuing your first certificate.</p>
              <Link
                to="/issue"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Issue Certificate</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Certificate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {certificates.map((certificate) => (
                    <tr key={certificate.tokenId} className="hover:bg-slate-700/20">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {certificate.metadata?.studentName || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatAddress(certificate.student)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {certificate.metadata?.courseName || `Certificate #${certificate.tokenId}`}
                        </div>
                        {certificate.metadata?.grade && (
                          <div className="text-sm text-gray-400">
                            Grade: {certificate.metadata.grade}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getCertificateTypeColor(certificate.certificateType)}`}>
                          {certificate.certificateType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {certificate.metadata?.issueDate || formatDate(certificate.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {certificate.isValid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                            Revoked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/certificate/${certificate.tokenId}`}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {certificate.isValid && (
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to revoke this certificate?')) {
                                  revokeCertificate(certificate.tokenId);
                                }
                              }}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};