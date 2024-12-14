import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch';
import morgan from 'morgan'; 
import routes from './routes';
import TelegramBot, { CallbackQuery, Message } from "node-telegram-bot-api";

export interface Post {
  author: {
    id: string;
    name: string;
    neighborhood_name: string;
  };
  body: string;
  category: string;
  comments: Comment[];
  comment_closed: boolean;
  comment_count: number;
  creation_date_epoch_seconds: number;
  downvote_count: number;
  embed_url: string;
  has_geo_tag: boolean;
  id: string;
  latitude: number;
  like_count: number;
  longitude: number;
  media: string[];
  media_focal_area: any[];
  public_post_url: string;
  reaction_types: {
    like2: number;
    report_count: number;
    scope: string;
    score: number;
    scores: any[];
  };
  title: string;
  user_entered_subject: boolean;
  video_preview_url: string;
  posts_length: number;
}

interface Comment {
  id: number;
  body: string;
  author_name: string;
  author_type: string;
  creation_date: number;
  like_count: number;
  downvote_count: number;
  reply_count: number;
  report_count: number;
  comments: Comment[];
  media: string[];
  media_focal_area: (null | any)[];
  reaction_types: Record<string, number>;
  parent_comment_id: number | null;
}

// Load environment variables
// config({ path: process.env.NODE_ENV === 'production' ? `.env.${process.env.NODE_ENV}` : '.env' });
config({ path: '.env' });
console.log('Loaded Telegram Token:', process.env.TELEGRAM_TOKEN)



const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(morgan('combined'));  // logs stuff
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));
app.use("/api", routes);



interface TokenResponse {
  access_token: string;
  expires_in: number;
}

interface SearchResponse {
  results: any[];
}

// Custom logging middleware for /api/me
const logAuthorizationHeader = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'] || 'No Auth Header';
  console.log(`Request to /api/me - Auth: ${authHeader}`);
  next();
};


// app.get('/api/me', logAuthorizationHeader, async (req: Request, res: Response) => {
app.get('/api/me', async (req: Request, res: Response) => {

  const { token } = req.query;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const response = await fetch('https://nextdoor.com/external/api/partner/v1/me/', {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}` // Pass the token received in the request
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Fetch cities
app.get('/api/cities', async (req: Request, res: Response) => {
  const { token, country } = req.query; // Get token and country from query parameters

  // Set the base URL based on the selected country
  let baseUrl;
  switch (country) {
    case 'ca':
      baseUrl = 'https://ca.nextdoor.com/partner_api/v1/city_list';
      break;
    case 'us':
      baseUrl = 'https://nextdoor.com/partner_api/v1/city_list';
      break;
    case 'au':
      baseUrl = 'https://au.nextdoor.com/partner_api/v1/city_list';
      break;
    case 'uk':
      baseUrl = 'https://nextdoor.co.uk/partner_api/v1/city_list';
      break;
    default:
      return res.status(400).json({ error: 'Invalid country' });
  }

  try {
    const response = await fetch(baseUrl, {
      method: "GET",
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Error fetching cities' });
  }
});

// Fetch trending posts
app.get('/api/trending/:cityId', async (req: Request, res: Response) => {
  const { cityId } = req.params;
  const { page, token } = req.query; // Get page and token from query parameters

  try {
    const response = await fetch(`https://ca.nextdoor.com/partner_api/v1/city_digest/${cityId}?page=${page}`, {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    res.status(500).json({ error: 'Error fetching trending posts' });
  }
});

async function fetchAccessToken(): Promise<TokenResponse> {
  try {
    let access_token: string | null = null;
    let expires_in: number | null = null;

    const response = await fetch("https://auth.nextdoor.com/v2/token", {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Basic ${process.env.NEXTDOOR_BEARER_TOKEN}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "content_api openid partner_api.city_digest",
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: TokenResponse = await response.json() as TokenResponse;
    access_token = data.access_token;
    expires_in = Date.now() + data.expires_in * 1000;
    return { access_token, expires_in };
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw error;
  }
}

app.get('/api/auth/private/refresh/', async (req: Request, res: Response) => {
  const { authCode } = req.query; // Extract the authCode from the query parameters

  if (!authCode) {
    return res.status(400).json({ error: "Authorization code is required." });
  }

  try {
    // Call your function to fetch the private access token using the authCode
    const { access_token, expires_in } = await fetchPrivateAccessToken(authCode as string); // Ensure authCode is cast as string
    res.json({ access_token, expires_in });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
  }
});

async function fetchPrivateAccessToken(authorizationCode: string): Promise<TokenResponse> {
  try {
    // Ensure that the environment variables are defined
    const clientId = process.env.NEXTDOOR_CLIENT_ID;
    const redirectUri = 'https://hs-nextdoor-0140b3823f77.herokuapp.com/api/callback';

    if (!clientId || !redirectUri) {
      throw new Error("Client ID and redirect URI must be defined.");
    }

    const response = await fetch("https://auth.nextdoor.com/v2/token", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
        authorization: `Basic ${process.env.NEXTDOOR_BEARER_TOKEN}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authorizationCode,
        client_id: clientId,  // Ensure this is a string
        redirect_uri: redirectUri,  // Ensure this is a string
      }).toString(),  // Convert to string if necessary
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: TokenResponse = await response.json() as TokenResponse;
    const expires_in = Date.now() + data.expires_in * 1000; // Calculate expiration
    return { access_token: data.access_token, expires_in };
  } catch (error) {
    console.error('Error fetching access token using authorization code:', authorizationCode, error);
    throw error;
  }
}

app.get('/api/auth/private', async (req: Request, res: Response) => {
  const { authCode } = req.query; // Extract the authCode from the query parameters

  if (!authCode) {
    return res.status(400).json({ error: "Authorization code is required." });
  }

  try {
    // Call your function to fetch the private access token using the authCode
    const { access_token, expires_in } = await fetchPrivateAccessToken(authCode as string); // Ensure authCode is cast as string
    res.json({ access_token, expires_in });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
  }
});


app.get('/api/auth', async (req: Request, res: Response) => {
  try {
    const { access_token, expires_in } = await fetchAccessToken();
    res.json({ access_token, expires_in });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
  }
});



app.get('/api/search', async (req: Request, res: Response) => {
  const { query, lat, lon, radius, token } = req.query;

  try {
    // Determine the region based on the latitude and longitude
    let regionUrl = 'https://nextdoor.com'; // Default to US
    if (lat && lon) {
      const latNum = parseFloat(lat as string);
      const lonNum = parseFloat(lon as string);

      if (latNum >= -55 && latNum <= -10 && lonNum >= 110 && lonNum <= 155) {
        regionUrl = 'https://au.nextdoor.com'; // Australia
      } else if (latNum >= 49 && latNum <= 84 && lonNum >= -141 && lonNum <= -52) {
        regionUrl = 'https://ca.nextdoor.com'; // Canada
      } else if (latNum >= 36 && latNum <= 71 && lonNum >= -11 && lonNum <= 50) {
        regionUrl = 'https://nextdoor.co.uk'; // Europe (adjusted for UK/Europe)
      }
    }

    const validRadius = Math.min(parseFloat(radius as string) || 0, 100);

    const apiUrl = `${regionUrl}/content_api/v2/search_post?include_comments=true&query=${encodeURIComponent(query as string || '')}&lat=${lat || ''}&lon=${lon || ''}&radius=${validRadius || ''}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
      },
    });

    const data: SearchResponse = await response.json() as SearchResponse;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
  }
});


app.get('/api/oauth', (req: Request, res: Response) => {
  const CLIENT_ID = "hootsuite_b5898e51";
  const REDIRECT_URI = "https://hs-nextdoor-0140b3823f77.herokuapp.com/api/callback";
  const SCOPES = "openid post:write post:read comment:write publish_api";

  const authUrl = `https://www.nextdoor.com/v3/authorize/?scope=${SCOPES}&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.json({ url: authUrl });
});

app.get('/api/callback', (req: Request, res: Response) => {
  const authorizationCode = req.query.code as string;

  // Redirect the user back to the home page with the authorization code
  res.redirect(`/quit?auth=${authorizationCode}`);
});

// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: "API route not found" });
});

app.post('/', (req: Request, res: Response) => {
  // Handle any processing for the POST request here if needed
  // Then redirect to the desired GET route (e.g., '/api/search')

  res.redirect('/');
});


// Serve React application
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
