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

// Define the UserArgs interface
export interface UserArgs {
  readonly walletId?: string | null;         // Unique wallet identifier
  readonly username: string; // Optional username
  readonly telegramId: string; // Optional Telegram ID
  readonly referralId?: string | null; // Optional Telegram ID
  readonly dateCreated: Date;         // Account creation date
  readonly lastLoggedIn: Date;        // Last login timestamp
}

// Simplified User class definition
export default class User {
  walletId: string | null;         
  username: string;  
  telegramId: string;
  referralId: string | null;
  dateCreated: Date;        
  lastLoggedIn: Date;       

  constructor(args: UserArgs) {
    this.walletId = args.walletId || null;
    this.username = args.username;
    this.telegramId = args.telegramId;
    this.referralId = args.referralId || null;
    this.dateCreated = args.dateCreated;
    this.lastLoggedIn = args.lastLoggedIn;
  }
}

// FireStoreUser interface for Firestore compatibility
export interface FireStoreUser extends Omit<UserArgs, "dateCreated"> {
  readonly dateCreated: {
    readonly seconds: number;
    readonly nanoseconds: number;
  };
}
