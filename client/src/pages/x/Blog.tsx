import React, { useEffect, useState } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import LoadingScreenDots from '@/components/common/LoadingScreenDots';
import NewsFetcher from '@/components/guide/NewsFetcher';
import LinkPreviewCard from '@/components/blog/LinkPreviewCard';

interface PlatformUpdate {
  version: string;
  date: string;
  title: string;
  description: string;
  type: 'feature' | 'improvement' | 'bugfix' | 'securcity' | 'major' | 'team' | 'roadmap';
  status: 'released' | 'beta' | 'coming-soon';
  link?: string | null;
  linkText?: string;
  image?: string;
}

const Blog: React.FC = () => {
  const [platformUpdates, setPlatformUpdates] = useState<PlatformUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'news' | 'updates'>('news');

  useEffect(() => {
    fetchPlatformUpdates();
  }, []);

  const fetchPlatformUpdates = async () => {
    try {
      const response = await fetch('/blog/blog.json');
      const updates = await response.json();
      setPlatformUpdates(updates);
    } catch (err) {
      console.error('Error fetching platform updates:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUpdateTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return '🚀';
      case 'improvement': return '⚡';
      case 'bugfix': return '🐛';
      case 'security': return '🔒';
      case 'major': return '💎';
      case 'team': return '👥';
      case 'roadmap': return '🗺️';
      default: return '📝';
    }
  };

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-blue-500';
      case 'improvement': return 'bg-green-500';
      case 'bugfix': return 'bg-yellow-500';
      case 'security': return 'bg-red-500';
      case 'major': return 'bg-purple-500';
      case 'team': return 'bg-indigo-500';
      case 'roadmap': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'released': return <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Released</span>;
      case 'beta': return <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs">Beta</span>;
      case 'coming-soon': return <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Coming Soon</span>;
      default: return <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-10 text-neon-light flex justify-center items-center">
        <LoadingScreenDots />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10 text-neon-light">
      <div className="space-y-6 mb-8 relative max-w-7xl mx-auto pt-6">
        {/* Media News Section */}
        <div id="news-section">
          <NewsFetcher />
        </div>

        {/* Platform Updates Section */}
        <div id="updates-section">
          <div className="bg-[#23263a] border border-[#00ffe7]/30 rounded-lg p-6">
            <div className="space-y-6">
              {platformUpdates.map((update, index) => (
                <div key={index} className="bg-[#181a23] border border-[#00ffe7]/20 rounded-lg p-4 hover:shadow-[0_0_16px_#00ffe7]/30 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${getUpdateTypeColor(update.type)} rounded-lg flex items-center justify-center text-white font-bold`}>
                        {getUpdateTypeIcon(update.type)}
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-[#00ffe7] mr-2 text-left font-bold text-lg">{update.title}</h3>
                            {getStatusBadge(update.status)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[#faafe8] font-semibold">{update.version}</span>
                          <span className="text-[#e0e7ef] text-sm">{new Date(update.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Always display description */}
                  <div className="mb-4">
                    {update.image ? (
                      <div className="flex min-h-[128px] gap-4 mb-4">
                        <img 
                          src={update.image} 
                          alt={update.title}
                          className="w-48 h-32 object-cover flex-shrink-0 rounded-lg border border-[#00ffe7]/30"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="text-[#e0e7ef] leading-relaxed">{update.description}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[#e0e7ef] leading-relaxed mb-4">{update.description}</p>
                    )}
                    
                    {/* Display link preview or simple link */}
                    {update.link && (
                      <div className="mb-4">
                        {update.image ? (
                          <a 
                            href={update.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#00ffe7] hover:underline flex items-center gap-2 text-sm"
                          >
                            {update.linkText || "View Full Details"} <FaExternalLinkAlt className="text-xs" />
                          </a>
                        ) : (
                          <LinkPreviewCard url={update.link} />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs text-white ${getUpdateTypeColor(update.type)}`}>
                      {update.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {platformUpdates.length === 0 && (
              <div className="text-center py-8 text-[#e0e7ef]">
                No platform updates available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
