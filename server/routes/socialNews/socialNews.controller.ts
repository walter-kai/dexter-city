import { Request, Response } from "express";
import axios from "axios";

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

interface TalkwalkerResponse {
  success: boolean;
  data: NewsItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export const getSocialPosts = async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const response = await axios.get<TalkwalkerResponse>(
      'https://dexter-collector-882290629693.us-central1.run.app/tw/social/posts',
      {
        params: {
          limit,
          offset
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DexterCity-Backend/1.0'
        },
        timeout: 15000 // 15 second timeout
      }
    );

    if (!response.data.success) {
      return res.status(500).json({
        success: false,
        error: 'External API returned unsuccessful response'
      });
    }

    res.json({
      success: true,
      data: response.data.data,
      pagination: response.data.pagination
    });

  } catch (error) {
    console.error('Error fetching social posts:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return res.status(504).json({
          success: false,
          error: 'Request timeout while fetching social posts'
        });
      } else if (error.response) {
        return res.status(error.response.status).json({
          success: false,
          error: `External API error: ${error.response.statusText}`
        });
      } else if (error.request) {
        return res.status(503).json({
          success: false,
          error: 'Unable to reach external social media API'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching social posts'
    });
  }
};


