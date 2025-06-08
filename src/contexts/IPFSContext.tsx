import React, { createContext, useContext, useState, ReactNode } from 'react';
import { create } from 'ipfs-http-client';

interface IPFSContextType {
  uploadFile: (file: File) => Promise<string>;
  uploadJSON: (data: any) => Promise<string>;
  getFile: (hash: string) => Promise<any>;
  loading: boolean;
  error: string | null;
}

const IPFSContext = createContext<IPFSContextType | undefined>(undefined);

export const useIPFS = () => {
  const context = useContext(IPFSContext);
  if (!context) {
    throw new Error('useIPFS must be used within an IPFSProvider');
  }
  return context;
};

interface IPFSProviderProps {
  children: ReactNode;
}

export const IPFSProvider: React.FC<IPFSProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize IPFS client (using Infura as default)
  const ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: 'Basic ' + btoa('2QJKFGhXyZkKnMjGkKyGkKyGkKy:your_project_secret')
    }
  });

  const uploadFile = async (file: File): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const result = await ipfs.add(file);
      return result.path;
    } catch (err: any) {
      setError(err.message || 'Failed to upload file to IPFS');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadJSON = async (data: any): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const jsonString = JSON.stringify(data);
      const result = await ipfs.add(jsonString);
      return result.path;
    } catch (err: any) {
      setError(err.message || 'Failed to upload JSON to IPFS');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFile = async (hash: string): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      const chunks = [];
      for await (const chunk of ipfs.cat(hash)) {
        chunks.push(chunk);
      }
      
      const data = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        data.set(chunk, offset);
        offset += chunk.length;
      }

      return new TextDecoder().decode(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve file from IPFS');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    uploadFile,
    uploadJSON,
    getFile,
    loading,
    error
  };

  return <IPFSContext.Provider value={value}>{children}</IPFSContext.Provider>;
};