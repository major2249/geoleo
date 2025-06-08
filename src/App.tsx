import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import { IPFSProvider } from './contexts/IPFSContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { IssuePage } from './pages/IssuePage';
import { VerifyPage } from './pages/VerifyPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { InstitutionDashboard } from './pages/InstitutionDashboard';
import { CertificateView } from './pages/CertificateView';
import { FreeCertificates } from './pages/FreeCertificates';

function App() {
  return (
    <Web3Provider>
      <IPFSProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/issue" element={<IssuePage />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/institution" element={<InstitutionDashboard />} />
              <Route path="/certificate/:id" element={<CertificateView />} />
              <Route path="/free-certificates" element={<FreeCertificates />} />
            </Routes>
          </div>
        </Router>
      </IPFSProvider>
    </Web3Provider>
  );
}

export default App;