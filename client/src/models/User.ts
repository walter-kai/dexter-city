// Define the UserProfilePhoto interface (add fields as needed)
export interface UserProfilePhoto {
  fileId: string; // Assuming this field represents the unique identifier of the photo
  fileUniqueId: string; // Assuming this field represents a unique identifier for the file
}

// Update the TelegramUser interface
export interface TelegramUser {
  dateCreated?: string; // Make optional
  first_name: string;
  telegramHandle?: string; // Renamed from handle and made optional
  lastLoggedIn?: string; // Make optional
  last_name?: string; // Make optional
  id: string; // Assuming it's always a string
  referral?: string; // Make optional
  pickScore: number;
  missionScore: number;
  totalLosses: number;
  totalWins: number;
  photoId?: UserProfilePhoto; // Changed to UserProfilePhoto type
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
  }
}

// FireStoreUser interface definition
export interface FireStoreUser extends Omit<UserArgs, "dateCreated"> {
  readonly dateCreated: {
    readonly seconds: number;
    readonly nanoseconds: number;
  };
}
