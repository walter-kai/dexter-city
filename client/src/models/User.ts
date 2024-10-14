export interface TelegramUser {
  dateCreated?: string;  // Make optional
  first_name: string;
  handle?: string;
  lastLoggedIn?: string; // Make optional
  last_name?: string;     // Make optional
  id: string;            // Assuming it's always a string
  referral?: string;     // Make optional
  pickScore: number;
  missionScore: number;
  totalLosses: number;
  totalWins: number;
}

export interface UserArgs {
  readonly id: string;
  readonly dateCreated: Date;
  // TODO: rename to firstName in db
  readonly firstname: string | null;
  // TODO: rename to lastName in db
  readonly lastname: string | null;
  // TODO: rename to telegramHandle in db
  readonly handle: string | null;
  // Date UTC string
  readonly lastLoggedIn: string;
  readonly missionScore: number;
  readonly pickScore: number;
  // Total score
  readonly totalScore: number;
  // TODO: Rename to referralTelegramId in db
  readonly referral: string | null;
  // TODO: rename to telegramId in db
  readonly telegramid: string;
  readonly totalLosses: number;
  readonly totalWins: number;
  readonly favoriteSports: string[] | null;
}

export default class User {
  readonly id: string;
  dateCreated: Date;
  firstname: string | null;
  lastname: string | null;
  handle: string | null;
  lastLoggedIn: string;
  missionScore: number;
  pickScore: number;
  referral: string | null;
  telegramid: string;
  totalLosses: number;
  totalWins: number;
  totalScore: number;
  favoriteSports: string[] | null;

  constructor(args: UserArgs) {
    this.id = args.id;
    this.dateCreated = args.dateCreated;
    this.firstname = args.firstname;
    this.lastname = args.lastname;
    this.handle = args.handle;
    this.lastLoggedIn = args.lastLoggedIn;
    this.missionScore = args.missionScore;
    this.pickScore = args.pickScore;
    this.referral = args.referral;
    this.telegramid = args.telegramid;
    this.totalLosses = args.totalLosses;
    this.totalWins = args.totalWins;
    this.totalScore = args.totalScore;
    this.favoriteSports = args.favoriteSports;
  }

  toJson(): UserArgs {
    return {
      id: this.id,
      dateCreated: this.dateCreated,
      firstname: this.firstname || null,
      lastname: this.lastname || null,
      handle: this.handle || null,
      lastLoggedIn: this.lastLoggedIn,
      missionScore: this.missionScore,
      pickScore: this.pickScore,
      referral: this.referral || null,
      telegramid: this.telegramid,
      totalLosses: this.totalLosses,
      totalWins: this.totalWins,
      totalScore: this.totalScore,
      favoriteSports: this.favoriteSports,
    };
  }
}

export interface FireStoreUser extends Omit<UserArgs, "dateCreated"> {
  readonly dateCreated: {
    readonly seconds: number;
    readonly nanoseconds: number;
  };
}
