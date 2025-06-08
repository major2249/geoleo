import React, { useState } from 'react';
import { Upload, User, Building, Award, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { useIPFS } from '../contexts/IPFSContext';
import QRCode from 'qrcode';

interface CertificateForm {
  studentAddress: string;
  studentName: string;
  studentEmail: string;
  certificateType: string;
  courseName: string;
  institutionName: string;
  issueDate: string;
  expiryDate: string;
  grade: string;
  description: string;
}

export const IssuePage: React.FC = () => {
  const { contract, isConnected, account } = useWeb3();
  const { uploadJSON, uploadFile } = useIPFS();
  
  const [form, setForm] = useState<CertificateForm>({
    studentAddress: '',
    studentName: '',
    studentEmail: '',
    certificateType: 'completion',
    courseName: '',
    institutionName: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    grade: '',
    description: ''
  });
  
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ tokenId: string; qrCode: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCertificateFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !contract) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Upload certificate file to IPFS if provided
      let fileHash = '';
      if (certificateFile) {
        fileHash = await uploadFile(certificateFile);
      }

      // Create certificate metadata
      const metadata = {
        studentName: form.studentName,
        studentEmail: form.studentEmail,
        studentAddress: form.studentAddress,
        certificateType: form.certificateType,
        courseName: form.courseName,
        institutionName: form.institutionName,
        issueDate: form.issueDate,
        expiryDate: form.expiryDate,
        grade: form.grade,
        description: form.description,
        fileHash,
        issuer: account,
        timestamp: Date.now()
      };

      // Upload metadata to IPFS
      const metadataHash = await uploadJSON(metadata);

      // Issue certificate on blockchain
      const tx = await contract.issueCertificate(
        form.studentAddress,
        metadataHash,
        form.certificateType,
        form.institutionName
      );

      const receipt = await tx.wait();
      const tokenId = receipt.logs[0].args[0].toString();

      // Generate QR code for verification
      const verificationUrl = `${window.location.origin}/certificate/${tokenId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

      setSuccess({ tokenId, qrCode: qrCodeDataUrl });
      
      // Reset form
      setForm({
        studentAddress: '',
        studentName: '',
        studentEmail: '',
        certificateType: 'completion',
        courseName: '',
        institutionName: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        grade: '',
        description: ''
      });
      setCertificateFile(null);

    } catch (err: any) {
      setError(err.message || 'Failed to issue certificate');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <Building className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to issue certificates</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Certificate Issued Successfully!</h2>
          <p className="text-gray-400 mb-6">Token ID: {success.tokenId}</p>
          
          <div className="bg-white p-4 rounded-lg mb-6">
            <img src={success.qrCode} alt="QR Code" className="mx-auto" />
          </div>
          
          <p className="text-sm text-gray-400 mb-6">
            Students can scan this QR code to verify their certificate
          </p>
          
          <button
            onClick={() => setSuccess(null)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Issue Another Certificate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Award className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Issue Certificate</h1>
          <p className="text-xl text-gray-400">
            Create and issue verifiable digital certificates on blockchain
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Student Wallet Address *
                </label>
                <input
                  type="text"
                  name="studentAddress"
                  value={form.studentAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="0x..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={form.studentName}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Student Email
              </label>
              <input
                type="email"
                name="studentEmail"
                value={form.studentEmail}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Certificate Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Certificate Type *
                </label>
                <select
                  name="certificateType"
                  value={form.certificateType}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="completion">Course Completion</option>
                  <option value="achievement">Achievement</option>
                  <option value="degree">Degree</option>
                  <option value="diploma">Diploma</option>
                  <option value="certification">Professional Certification</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Course/Program Name *
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={form.courseName}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Institution Name *
              </label>
              <input
                type="text"
                name="institutionName"
                value={form.institutionName}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Issue Date *
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={form.issueDate}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Grade/Score
                </label>
                <input
                  type="text"
                  name="grade"
                  value={form.grade}
                  onChange={handleInputChange}
                  placeholder="A+, 95%, Pass, etc."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional details about the certificate..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Certificate File (PDF, Image)
              </label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="certificate-file"
                />
                <label htmlFor="certificate-file" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">
                    {certificateFile ? certificateFile.name : 'Click to upload certificate file'}
                  </p>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Issuing Certificate...</span>
                </>
              ) : (
                <>
                  <Award className="w-5 h-5" />
                  <span>Issue Certificate</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};