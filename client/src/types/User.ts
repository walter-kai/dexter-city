export interface User {
  walletAddress: string;
  username?: string;
  email?: string;
  createdAt: Date;
  lastLogin: Date;
  referralId?: string;
  telegramId?: string;
  photoUrl?: string;
}