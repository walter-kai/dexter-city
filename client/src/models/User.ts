// Define the UserProfilePhoto interface (add fields as needed)
export interface UserProfilePhoto {
  fileId: string; // Assuming this field represents the unique identifier of the photo
  fileUniqueId: string; // Assuming this field represents a unique identifier for the file
}

// Update the TelegramUser interface
export interface TelegramUser {
  id: string;                      // Unique identifier for this user or bot
  is_bot: boolean;                 // True, if this user is a bot
  first_name: string;              // User's or bot's first name
  last_name?: string;              // Optional. User's or bot's last name
  username?: string;               // Optional. User's bot's username
  language_code?: string;          // Optional. IETF language tag of the user's language
  is_premium?: boolean;            // Optional. True, if this user is a Telegram Premium user
  added_to_attachment_menu?: boolean; // Optional. True, if this user added the bot to the attachment menu
  can_join_groups?: boolean;       // Optional. True, if the bot can be invited to groups
  can_read_all_group_messages?: boolean; // Optional. True, if privacy mode is disabled for the bot
  supports_inline_queries?: boolean; // Optional. True, if the bot supports inline queries
  can_connect_to_business?: boolean; // Optional. True, if the bot can be connected to a Telegram Business account
  has_main_web_app?: boolean;     // Optional. True, if the bot has a main Web App
}


// Updated UserArgs interface
export interface UserArgs {
  readonly dateCreated: Date;
  readonly firstName: string; // Renamed from firstname
  readonly lastName: string | null; // Renamed from lastname
  readonly telegramHandle: string | null; // Renamed from handle
  readonly lastLoggedIn: string; // Date UTC string
  readonly missionScore: number;
  readonly pickScore: number;
  readonly totalScore: number; // Total score
  readonly referralTelegramId: string | null; // Renamed from referral
  readonly telegramId: string; // Renamed from telegramid
  readonly totalLosses: number;
  readonly totalWins: number;
  readonly favoriteSports: string[] | null;
  readonly photoId: string | null;
  readonly photoUrl: string | null;
}

// User class definition
export default class User {
  dateCreated: Date;
  firstName: string; // Changed from firstname
  lastName: string | null; // Changed from lastname
  telegramHandle: string | null; // Changed from handle
  lastLoggedIn: string;
  missionScore: number;
  pickScore: number;
  referralTelegramId: string | null; // Changed from referral
  telegramId: string; // Changed from telegramid
  totalLosses: number;
  totalWins: number;
  totalScore: number;
  favoriteSports: string[] | null;
  photoId?: string | null;
  photoUrl?: string | null;

  constructor(args: UserArgs) {
    this.dateCreated = args.dateCreated;
    this.firstName = args.firstName; // Changed to firstName
    this.lastName = args.lastName; // Changed to lastName
    this.telegramHandle = args.telegramHandle; // Changed to telegramHandle
    this.lastLoggedIn = args.lastLoggedIn;
    this.missionScore = args.missionScore;
    this.pickScore = args.pickScore;
    this.referralTelegramId = args.referralTelegramId; // Changed to referralTelegramId
    this.telegramId = args.telegramId; // Changed to telegramId
    this.totalLosses = args.totalLosses;
    this.totalWins = args.totalWins;
    this.totalScore = args.totalScore;
    this.favoriteSports = args.favoriteSports;
    this.photoId = args.photoId;
    this.photoUrl = args.photoUrl;
  }
}

// FireStoreUser interface definition
export interface FireStoreUser extends Omit<UserArgs, "dateCreated"> {
  readonly dateCreated: {
    readonly seconds: number;
    readonly nanoseconds: number;
  };
}
