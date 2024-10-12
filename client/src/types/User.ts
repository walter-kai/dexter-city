// types/User.ts
export interface User {
    id: string;
    first_name: string;
    last_name: string;
    profile_picture: string;
    status: 'Activated' | 'Suspended' | 'Deactivated'; // Assuming these are the only possible statuses
    account_creation_date: string; // ISO format
    verified: boolean; // Assuming this is a boolean
    is_agency_profile: boolean;
    is_business_profile: boolean;
    is_neighbor_profile: boolean;
    neighborhood_name: string;
    neighborhood_url: string;
    city_name: string;
    business_name?: string; // Optional, for business profiles
    agency_id?: string; // Optional, for agency users
    agency_name?: string; // Optional, for agency users
    agency_url_at_nextdoor?: string; // Optional, for agency users
    agency_external_url?: string; // Optional, for agency users
    agency_photo?: string; // Optional, for agency users
    agency_city?: string; // Optional, for agency users
    agency_state?: string; // Optional, for agency users
  }
  