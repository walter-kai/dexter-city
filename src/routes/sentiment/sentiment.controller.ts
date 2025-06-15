import { Request, Response } from "express";
import axios from "axios";

interface SentimentDataPoint {
  t: number;
  v: number[];
}

interface SentimentHistogram {
  header: {
    v: string[];
  };
  data: SentimentDataPoint[];
}

interface SentimentTopic {
  id: string;
  topic_id: string;
  topic_name: string;
  last_updated: number;
  histogram: SentimentHistogram;
  request_id: string;
}

interface SentimentApiResponse {
  success: boolean;
  data: SentimentTopic[];
  total: number;
}

export const getSentiments = async (req: Request, res: Response) => {
  try {
    const response = await axios.get<SentimentApiResponse>(
      'https://talkwalker-collector-882290629693.us-central1.run.app/sentiment/all',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DexterCity-Backend/1.0'
        },
        timeout: 15000
      }
    );

    res.json({
      success: true,
      data: response.data.data,
      total: response.data.total
    });

  } catch (error) {
    console.error('Error fetching sentiments:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return res.status(504).json({
          success: false,
          error: 'Request timeout while fetching sentiment data'
        });
      } else if (error.response) {
        return res.status(error.response.status).json({
          success: false,
          error: `External API error: ${error.response.statusText}`
        });
      } else if (error.request) {
        return res.status(503).json({
          success: false,
          error: 'Unable to reach external sentiment API'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching sentiment data'
    });
  }
};
