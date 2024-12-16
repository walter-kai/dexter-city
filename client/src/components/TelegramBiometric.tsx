import { postEvent } from '@telegram-apps/sdk';
import { MethodNameWithRequiredParams } from '@telegram-apps/sdk';

// Existing method to set header color
import telegramAppInstance from '../services/Telegram';

// New method to get biometric information
export const TelegramBiometric = async () => {
  try {
    const biometricInfo = telegramAppInstance.biometricTrigger()

    
    console.log('Biometric Info:', biometricInfo); // Log the info or process it
    return biometricInfo;
  } catch (error) {
    console.error('Error fetching biometric info:', error);
    throw error; // Optional: rethrow error to be handled elsewhere
  }
};
