import { TelegramUser } from "../models/User";
import { postEvent, MethodNameWithRequiredParams } from "@telegram-apps/sdk";

export interface BiometricRequestAccessParams {
  reason: string; // Reason for requesting biometric access
}

export interface BiometricAuthenticateParams {
  reason: string; // Reason for biometric authentication
}

export type BiometricCallback = (success: boolean, error?: string) => void;

export interface BiometricManager {
  isInited: boolean;
  isBiometricAvailable: boolean;
  biometricType: "finger" | "face" | "unknown";
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  isBiometricTokenSaved: boolean;
  deviceId: string;

  init(callback?: BiometricCallback): void;
  requestAccess(
    params: BiometricRequestAccessParams,
    callback?: BiometricCallback
  ): void;
  authenticate(
    params: BiometricAuthenticateParams,
    callback?: (success: boolean, token?: string, error?: string) => void
  ): void;
  updateBiometricToken(
    token: string,
    callback?: BiometricCallback
  ): void;
  openSettings(): void;
}


// Define the TelegramWebApp interface
export interface TelegramWebApp {
  initDataUnsafe?: {
    user?: Partial<TelegramUser>;
    start_param?: string;
  };
  showAlert: (message: string) => void;
  BiometricManager: BiometricManager;
}

// Default user object
export const defaultTelegramUser: TelegramUser = {
  first_name: "Walter",
  last_name: "Yaoza",
  username: "kai", // Set handle to test name
  id: "5030917144",
  is_bot: false,
};

// TelegramApp class implementation
export class TelegramApp {
  private webApp!: TelegramWebApp; // Definite assignment operator
  private biometricManager: BiometricManager;
  private user: TelegramUser;
  private referral: string | null;

  constructor() {
    this.webApp = (window as any).Telegram.WebApp as TelegramWebApp;
    this.user = this.getUser();
    this.biometricManager = this.getBiometricManager();
    this.referral = this.getReferral();
  }

  private getBiometricManager(): BiometricManager {
    const biometricManager: Partial<BiometricManager> = this.webApp.BiometricManager;

    // Provide default implementations for missing properties
    return {
      isInited: biometricManager.isInited || false,
      isBiometricAvailable: biometricManager.isBiometricAvailable || (() => false),
      biometricType: biometricManager.biometricType || "none",
      isAccessRequested: biometricManager.isAccessRequested || (() => false),
      requestAccess: biometricManager.requestAccess || (() => this.biometricManager),
      ...biometricManager, // Spread existing properties
    } as BiometricManager;
  }

  private getUser(): TelegramUser {
    const user = this.webApp.initDataUnsafe?.user || defaultTelegramUser;
    return {
      ...user,
      id: String(user.id || ""), // Ensure id is a string
      username: user?.username || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      is_bot: user.is_bot || true,
    };
  }

  private getReferral(): string | null {
    const startParam = this.webApp.initDataUnsafe?.start_param;
    let referral: string | null = null;

    if (startParam) {
      const params = startParam.split("-");
      params.forEach((param) => {
        if (param.startsWith("ref_")) {
          referral = param.split("_")[1] || "5025509571"; // Default to fallback referral ID
        }
      });
    }

    return referral;
  }

  biometricTrigger(): void {
    // console.log("heool", this.biometricManager.biometricType);

    if (!this.biometricManager.isBiometricAvailable) {
      console.error("Biometric authentication is not available");
      this.showAlert("Biometric authentication is not available on this device.");
      return;
    }

    this.biometricManager.init();

    const params: BiometricRequestAccessParams = {
      reason: "Authenticate to continue", // Example reason message
    };

    this.biometricManager.requestAccess(params, (success, error) => {
      if (success) {
        console.log("Biometric access granted");
        this.showAlert("Biometric access granted!");
      } else {
        console.error("Biometric access denied:", error);
        this.showAlert("Biometric access denied. Please try again.");
      }
    });
  }

  showAlert(message: string): void {
    this.webApp.showAlert(message);
  }

  emitEvent(method: MethodNameWithRequiredParams, params: Record<string, any>): void {
    try {
      postEvent(method, params);
      console.log(`Event "${method}" posted successfully`, params);
    } catch (error) {
      console.error(`Failed to post event "${method}":`, error);
    }
  }

  getUserDetails() {
    return {
      user: this.user,
      referral: this.referral,
    };
  }
}

// Export the instance of TelegramApp
const telegramAppInstance = new TelegramApp();
export default telegramAppInstance;
