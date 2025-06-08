import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Wallet, User, Building, Shield, Gift } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import clsx from 'clsx';

export const Navbar: React.FC = () => {
  const { account, isConnected, connectWallet, disconnectWallet, loading } = useWeb3();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EduCert</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/issue"
              className={clsx(
                'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive('/issue')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              )}
            >
              <Building className="w-4 h-4" />
              <span>Issue</span>
            </Link>

            <Link
              to="/verify"
              className={clsx(
                'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive('/verify')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              )}
            >
              <Shield className="w-4 h-4" />
              <span>Verify</span>
            </Link>

            <Link
              to="/student"
              className={clsx(
                'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive('/student')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              )}
            >
              <User className="w-4 h-4" />
              <span>Student</span>
            </Link>

            <Link
              to="/institution"
              className={clsx(
                'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive('/institution')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              )}
            >
              <Building className="w-4 h-4" />
              <span>Institution</span>
            </Link>

            <Link
              to="/free-certificates"
              className={clsx(
                'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive('/free-certificates')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              )}
            >
              <Gift className="w-4 h-4" />
              <span>Free Certs</span>
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                  {formatAddress(account!)}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};