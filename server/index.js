import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
  }
});

// Mock database
let certificates = [];
let institutions = [];
let students = [];

// Mock IPFS storage (in production, this would use actual IPFS)
const mockIPFS = new Map();

// Helper function to generate mock IPFS hash
const generateIPFSHash = (data) => {
  return 'Qm' + crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').substring(0, 44);
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'EduCert API'
  });
});

// Upload file to mock IPFS
app.post('/api/ipfs/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const hash = generateIPFSHash(req.file.buffer);
    mockIPFS.set(hash, {
      data: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
      size: req.file.size
    });

    res.json({ hash });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload JSON to mock IPFS
app.post('/api/ipfs/upload-json', (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    const hash = generateIPFSHash(data);
    mockIPFS.set(hash, {
      data: JSON.stringify(data),
      mimetype: 'application/json'
    });

    res.json({ hash });
  } catch (error) {
    console.error('Error uploading JSON:', error);
    res.status(500).json({ error: 'Failed to upload JSON' });
  }
});

// Get file from mock IPFS
app.get('/api/ipfs/:hash', (req, res) => {
  try {
    const { hash } = req.params;
    const file = mockIPFS.get(hash);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.mimetype === 'application/json') {
      res.json(JSON.parse(file.data));
    } else {
      res.set({
        'Content-Type': file.mimetype,
        'Content-Disposition': `attachment; filename="${file.originalname || 'file'}"`
      });
      res.send(file.data);
    }
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
});

// Mock blockchain operations
app.post('/api/blockchain/issue-certificate', (req, res) => {
  try {
    const {
      studentAddress,
      ipfsHash,
      certificateType,
      institutionName,
      issuerAddress
    } = req.body;

    const certificate = {
      tokenId: certificates.length + 1,
      student: studentAddress,
      ipfsHash,
      certificateType,
      institutionName,
      issuer: issuerAddress,
      timestamp: Math.floor(Date.now() / 1000),
      isValid: true,
      blockNumber: Math.floor(Math.random() * 1000000),
      transactionHash: '0x' + crypto.randomBytes(32).toString('hex')
    };

    certificates.push(certificate);

    res.json({
      success: true,
      tokenId: certificate.tokenId,
      transactionHash: certificate.transactionHash
    });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({ error: 'Failed to issue certificate' });
  }
});

app.get('/api/blockchain/certificate/:tokenId', (req, res) => {
  try {
    const { tokenId } = req.params;
    const certificate = certificates.find(cert => cert.tokenId === parseInt(tokenId));

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json(certificate);
  } catch (error) {
    console.error('Error getting certificate:', error);
    res.status(500).json({ error: 'Failed to get certificate' });
  }
});

app.get('/api/blockchain/student/:address/certificates', (req, res) => {
  try {
    const { address } = req.params;
    const studentCertificates = certificates.filter(cert => 
      cert.student.toLowerCase() === address.toLowerCase()
    );

    res.json(studentCertificates.map(cert => cert.tokenId));
  } catch (error) {
    console.error('Error getting student certificates:', error);
    res.status(500).json({ error: 'Failed to get student certificates' });
  }
});

app.get('/api/blockchain/institution/:address/certificates', (req, res) => {
  try {
    const { address } = req.params;
    const institutionCertificates = certificates.filter(cert => 
      cert.issuer.toLowerCase() === address.toLowerCase()
    );

    res.json(institutionCertificates.map(cert => cert.tokenId));
  } catch (error) {
    console.error('Error getting institution certificates:', error);
    res.status(500).json({ error: 'Failed to get institution certificates' });
  }
});

app.post('/api/blockchain/revoke-certificate', (req, res) => {
  try {
    const { tokenId, issuerAddress } = req.body;
    const certificate = certificates.find(cert => cert.tokenId === parseInt(tokenId));

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (certificate.issuer.toLowerCase() !== issuerAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Only the issuer can revoke this certificate' });
    }

    certificate.isValid = false;
    certificate.revokedAt = Math.floor(Date.now() / 1000);

    res.json({ success: true });
  } catch (error) {
    console.error('Error revoking certificate:', error);
    res.status(500).json({ error: 'Failed to revoke certificate' });
  }
});

// Free certificates endpoint (would be populated by Discord bot)
app.get('/api/free-certificates', (req, res) => {
  try {
    // Mock data - in production, this would come from the Discord bot scraper
    const freeCertificates = [
      {
        id: '1',
        title: 'Introduction to Machine Learning',
        provider: 'Coursera',
        description: 'Learn the fundamentals of machine learning with hands-on projects.',
        url: 'https://coursera.org/learn/machine-learning',
        category: 'Technology',
        duration: '6 weeks',
        level: 'Beginner',
        rating: 4.8,
        addedDate: new Date().toISOString(),
        tags: ['AI', 'Python', 'Data Science']
      }
      // More certificates would be added by the Discord bot
    ];

    res.json(freeCertificates);
  } catch (error) {
    console.error('Error getting free certificates:', error);
    res.status(500).json({ error: 'Failed to get free certificates' });
  }
});

//  Discord bot webhook endpoint
app.post('/api/discord/webhook', (req, res) => {
  try {
    const { certificates } = req.body;
    
    // In production, this would update the database with new certificates
    // found by the Discord bot scraper
    
    console.log('Received new certificates from Discord bot:', certificates);
    
    res.json({ success: true, processed: certificates?.length || 0 });
  } catch (error) {
    console.error('Error processing Discord webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`EduCert API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});