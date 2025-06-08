import React, { useState, useEffect } from 'react';
import { Gift, ExternalLink, Calendar, Building, Star, Search } from 'lucide-react';

interface FreeCertificate {
  id: string;
  title: string;
  provider: string;
  description: string;
  url: string;
  category: string;
  duration: string;
  level: string;
  rating: number;
  addedDate: string;
  tags: string[];
}

export const FreeCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<FreeCertificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<FreeCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    // Simulate loading free certificates (in production, this would come from the Discord bot scraper)
    const mockCertificates: FreeCertificate[] = [
      {
        id: '1',
        title: 'Introduction to Machine Learning',
        provider: 'Coursera',
        description: 'Learn the fundamentals of machine learning with hands-on projects and real-world applications.',
        url: 'https://coursera.org/learn/machine-learning',
        category: 'Technology',
        duration: '6 weeks',
        level: 'Beginner',
        rating: 4.8,
        addedDate: '2024-01-15',
        tags: ['AI', 'Python', 'Data Science']
      },
      {
        id: '2',
        title: 'Digital Marketing Fundamentals',
        provider: 'Google Digital Garage',
        description: 'Master the basics of digital marketing including SEO, social media, and analytics.',
        url: 'https://learndigital.withgoogle.com',
        category: 'Marketing',
        duration: '4 weeks',
        level: 'Beginner',
        rating: 4.6,
        addedDate: '2024-01-14',
        tags: ['SEO', 'Social Media', 'Analytics']
      },
      {
        id: '3',
        title: 'Project Management Professional',
        provider: 'edX',
        description: 'Learn project management methodologies and best practices for successful project delivery.',
        url: 'https://edx.org/course/project-management',
        category: 'Business',
        duration: '8 weeks',
        level: 'Intermediate',
        rating: 4.7,
        addedDate: '2024-01-13',
        tags: ['Agile', 'Scrum', 'Leadership']
      },
      {
        id: '4',
        title: 'Web Development Bootcamp',
        provider: 'FreeCodeCamp',
        description: 'Complete web development course covering HTML, CSS, JavaScript, and modern frameworks.',
        url: 'https://freecodecamp.org',
        category: 'Technology',
        duration: '12 weeks',
        level: 'Beginner',
        rating: 4.9,
        addedDate: '2024-01-12',
        tags: ['HTML', 'CSS', 'JavaScript', 'React']
      },
      {
        id: '5',
        title: 'Financial Planning and Analysis',
        provider: 'Khan Academy',
        description: 'Learn financial planning, budgeting, and investment strategies for personal and business finance.',
        url: 'https://khanacademy.org/economics-finance-domain',
        category: 'Finance',
        duration: '5 weeks',
        level: 'Intermediate',
        rating: 4.5,
        addedDate: '2024-01-11',
        tags: ['Finance', 'Investment', 'Budgeting']
      },
      {
        id: '6',
        title: 'Graphic Design Principles',
        provider: 'Canva Design School',
        description: 'Master the fundamentals of graphic design including color theory, typography, and composition.',
        url: 'https://designschool.canva.com',
        category: 'Design',
        duration: '3 weeks',
        level: 'Beginner',
        rating: 4.4,
        addedDate: '2024-01-10',
        tags: ['Design', 'Typography', 'Color Theory']
      }
    ];

    setTimeout(() => {
      setCertificates(mockCertificates);
      setFilteredCertificates(mockCertificates);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = certificates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(cert => cert.category === selectedCategory);
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(cert => cert.level === selectedLevel);
    }

    setFilteredCertificates(filtered);
  }, [searchTerm, selectedCategory, selectedLevel, certificates]);

  const categories = ['all', ...new Set(certificates.map(cert => cert.category))];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const getCategoryColor = (category: string) => {
    const colors = {
      Technology: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Marketing: 'bg-green-500/20 text-green-400 border-green-500/30',
      Business: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      Finance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      Design: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      Beginner: 'bg-green-500/20 text-green-400',
      Intermediate: 'bg-yellow-500/20 text-yellow-400',
      Advanced: 'bg-red-500/20 text-red-400'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Gift className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Free Certificates</h1>
          <p className="text-xl text-gray-400">
            Discover free certification opportunities updated daily by our Discord bot
          </p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search certificates..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading free certificates...</p>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Certificates Found</h3>
            <p className="text-gray-400">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                Showing {filteredCertificates.length} of {certificates.length} certificates
              </p>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {certificate.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{certificate.provider}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {certificate.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(certificate.category)}`}>
                      {certificate.category}
                    </span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(certificate.level)}`}>
                      {certificate.level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-400">{certificate.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{certificate.duration}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {certificate.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-slate-700 text-xs text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {certificate.tags.length > 3 && (
                      <span className="inline-block px-2 py-1 bg-slate-700 text-xs text-gray-300 rounded">
                        +{certificate.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <a
                    href={certificate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Start Course</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};