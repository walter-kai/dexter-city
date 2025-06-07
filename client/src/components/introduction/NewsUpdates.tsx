import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaYoutube, FaTwitter, FaEye, FaHeart, FaComment, FaRetweet, FaFilter, FaSort, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import LoadingScreenDots from '../LoadingScreenDots';

interface Author {
  id: string;
  name: string;
  username?: string;
  profile_url: string;
  profile_image_url: string;
  location?: string;
  verified?: boolean;
  followers_count?: number;
}

interface Metrics {
  engagement: number;
  reach?: number;
  sentiment: number;
  youtube?: {
    views: number;
    likes: number;
    comments: number;
  };
  twitter?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
    impression_count: number;
  };
}

interface NewsItem {
  date: string | null;
  sourcetype: string;
  content: string | null;
  media_urls: string[];
  post_urls: string[];
  native_id: string | null;
  author: Author;
  metrics: Metrics;
  hashtags: string[];
  mentions: string[];
  language: string;
  post_type: string[];
}

interface NewsResponse {
  success: boolean;
  data: NewsItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

const NewsUpdates: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'engagement'>('date');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call our backend endpoint instead of external API directly
      const response = await axios.get<NewsResponse>('/api/social-news/posts', {
        timeout: 10000, // 10 second timeout
      });
      
      if (response.data.success) {
        setNews(response.data.data);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err: any) {
      console.error('Full error details:', err);
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          setError('Request timeout - please try again');
        } else if (err.response) {
          // Server responded with error status
          setError(`Server error: ${err.response.status} - ${err.response.data?.error || err.message}`);
        } else if (err.request) {
          // Request was made but no response received
          setError('Network error - unable to connect to server');
        } else {
          setError(`Request setup error: ${err.message}`);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (sourcetype: string) => {
    switch (sourcetype) {
      case 'youtube':
        return <FaYoutube className="text-red-500" />;
      case 'twitter':
        return <FaTwitter className="text-blue-400" />;
      default:
        return <span className="text-[#00ffe7]">📰</span>;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 3) return 'text-green-400';
    if (sentiment < -3) return 'text-red-400';
    return 'text-[#e0e7ef]';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAndSortedNews = news
    .filter(item => {
      if (filter === 'all') return true;
      return item.sourcetype === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      } else {
        return b.metrics.engagement - a.metrics.engagement;
      }
    });

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredAndSortedNews.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredAndSortedNews.length) % filteredAndSortedNews.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoScrolling(false);
    // Resume auto-scroll after 5 seconds
    setTimeout(() => setIsAutoScrolling(true), 5000);
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling || filteredAndSortedNews.length <= 1) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoScrolling, filteredAndSortedNews.length]);

  // Reset current index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsAutoScrolling(true);
  }, [filter, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingScreenDots />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">Error loading news: {error}</p>
        <button 
          onClick={fetchNews}
          className="bg-[#00ffe7] text-[#181a23] px-4 py-2 rounded hover:bg-[#ff005c] hover:text-white transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-[#00ffe7] drop-shadow-[0_0_8px_#00ffe7]">
          News Updates
        </h2>
        
        <div className="flex gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-[#00ffe7]" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#23263a] text-[#e0e7ef] border border-[#00ffe7]/30 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Sources</option>
              <option value="youtube">YouTube</option>
              <option value="twitter">Twitter</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <FaSort className="text-[#00ffe7]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'engagement')}
              className="bg-[#23263a] text-[#e0e7ef] border border-[#00ffe7]/30 rounded px-3 py-1 text-sm"
            >
              <option value="date">Latest</option>
              <option value="engagement">Most Engaging</option>
            </select>
          </div>
        </div>
      </div>

      {filteredAndSortedNews.length === 0 ? (
        <div className="text-center py-8 text-[#e0e7ef]">
          No news items found for the selected filter.
        </div>
      ) : (
        <>
          {/* Carousel Container */}
          <div 
            className="relative overflow-hidden py-4"
            onMouseEnter={() => setIsAutoScrolling(false)}
            onMouseLeave={() => setIsAutoScrolling(true)}
          >
            <div className="flex items-center justify-center">
              {/* Previous Button */}
              <button
                onClick={() => {
                  prevSlide();
                  setIsAutoScrolling(false);
                  setTimeout(() => setIsAutoScrolling(true), 5000);
                }}
                className="absolute left-4 z-30 p-3 rounded-full bg-[#00ffe7]/20 hover:bg-[#00ffe7]/40 text-[#00ffe7] transition-all duration-300 hover:scale-110"
                disabled={filteredAndSortedNews.length <= 1}
              >
                <FaChevronLeft size={20} />
              </button>

              {/* Carousel Track */}
              <div className="flex items-center justify-center w-full max-w-6xl mx-auto">
                {filteredAndSortedNews.map((item, index) => {
                  const isActive = index === currentIndex;
                  const isPrev = index === (currentIndex - 1 + filteredAndSortedNews.length) % filteredAndSortedNews.length;
                  const isNext = index === (currentIndex + 1) % filteredAndSortedNews.length;
                  const isVisible = isActive || isPrev || isNext;

                  if (!isVisible) return null;

                  return (
                    <div
                      key={`${item.native_id || index}`}
                      className={`
                        transition-all duration-700 ease-in-out cursor-pointer
                        ${isActive 
                          ? 'w-96 scale-110 opacity-100 z-20 transform translate-y-0' 
                          : 'w-80 scale-95 opacity-60 z-10 transform translate-y-2'
                        }
                        ${isPrev ? '-mr-12' : ''}
                        ${isNext ? '-ml-12' : ''}
                        hover:scale-105 hover:opacity-80
                      `}
                      onClick={() => !isActive && goToSlide(index)}
                    >
                      <div className={`
                        bg-[#23263a] border border-[#00ffe7]/30 rounded-lg p-4 transition-all duration-700 mx-2
                        ${isActive 
                          ? 'shadow-[0_0_32px_#00ffe7] border-[#00ffe7]/60' 
                          : 'shadow-[0_0_16px_#00ffe7]/50 hover:shadow-[0_0_24px_#00ffe7]'
                        }
                      `}>
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <img
                            src={item.author.profile_image_url}
                            alt={item.author.name}
                            className="w-10 h-10 rounded-full border border-[#00ffe7]/50"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-[#00ffe7] text-sm">{item.author.name}</h3>
                              {item.author.username && (
                                <span className="text-[#b8eaff] text-xs">@{item.author.username}</span>
                              )}
                              {item.author.verified && <span className="text-blue-400 text-xs">✓</span>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#e0e7ef]">
                              {getSourceIcon(item.sourcetype)}
                              <span>{formatDate(item.date)}</span>
                              {item.author.location && (
                                <span>• {item.author.location}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        {item.content && (
                          <p className="text-[#e0e7ef] mb-3 leading-relaxed text-sm">
                            {truncateContent(item.content, isActive ? 200 : 120)}
                          </p>
                        )}

                        {/* Media */}
                        {item.media_urls.length > 0 && (
                          <div className="mb-3">
                            <img
                              src={item.media_urls[0]}
                              alt="Post media"
                              className={`w-full object-cover rounded-lg border border-[#00ffe7]/30 transition-all duration-700 ${
                                isActive ? 'h-48' : 'h-32'
                              }`}
                            />
                          </div>
                        )}

                        {/* Hashtags */}
                        {item.hashtags.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {item.hashtags.slice(0, isActive ? 4 : 2).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[#00ffe7] text-xs bg-[#181a23] px-2 py-1 rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {item.hashtags.length > (isActive ? 4 : 2) && (
                                <span className="text-[#b8eaff] text-xs">
                                  +{item.hashtags.length - (isActive ? 4 : 2)} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Metrics */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#00ffe7]/20">
                          <div className="flex items-center gap-3 text-xs text-[#b8eaff]">
                            {item.sourcetype === 'youtube' && item.metrics.youtube && (
                              <>
                                <div className="flex items-center gap-1">
                                  <FaEye />
                                  <span>{formatNumber(item.metrics.youtube.views)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FaHeart />
                                  <span>{formatNumber(item.metrics.youtube.likes)}</span>
                                </div>
                              </>
                            )}
                            
                            {item.sourcetype === 'twitter' && item.metrics.twitter && (
                              <>
                                <div className="flex items-center gap-1">
                                  <FaRetweet />
                                  <span>{formatNumber(item.metrics.twitter.retweet_count)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FaHeart />
                                  <span>{formatNumber(item.metrics.twitter.like_count)}</span>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs ${getSentimentColor(item.metrics.sentiment)}`}>
                              {item.metrics.sentiment > 0 ? '+' : ''}{item.metrics.sentiment}
                            </span>
                            {item.post_urls.length > 0 && (
                              <a
                                href={item.post_urls[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#00ffe7] hover:text-[#ff005c] transition text-xs underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => {
                  nextSlide();
                  setIsAutoScrolling(false);
                  setTimeout(() => setIsAutoScrolling(true), 5000);
                }}
                className="absolute right-4 z-30 p-3 rounded-full bg-[#00ffe7]/20 hover:bg-[#00ffe7]/40 text-[#00ffe7] transition-all duration-300 hover:scale-110"
                disabled={filteredAndSortedNews.length <= 1}
              >
                <FaChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-6">
            {filteredAndSortedNews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 h-3 bg-[#00ffe7] shadow-[0_0_8px_#00ffe7] rounded-full'
                    : 'w-3 h-3 bg-[#23263a] border border-[#00ffe7]/30 hover:bg-[#00ffe7]/50 rounded-full'
                }`}
              />
            ))}
          </div>

          {/* Auto-scroll indicator */}
          <div className="flex justify-center mt-2">
            <span className="text-xs text-[#b8eaff] opacity-70">
              {isAutoScrolling ? '⏸️ Hover to pause' : '▶️ Auto-scroll paused'}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default NewsUpdates;
