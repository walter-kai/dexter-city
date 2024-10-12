// import { webAppContext } from "@vkruglikov/react-telegram-web-app/lib/core";

// import { setLeagueFilter } from "../pages/Games";
// import { getLeagueFromString } from "../types/game";

// Define types for Telegram User and WebApp
export interface TelegramUser {
  dateCreated?: string;  // Make optional
  first_name: string;
  handle: string;
  lastLoggedIn?: string; // Make optional
  last_name?: string;     // Make optional
  id: string;            // Assuming it's always a string
  referral?: string;     // Make optional
  pickScore: number;
  missionScore: number;
  totalLosses: number;
  totalWins: number;
}


export interface TelegramWebApp {
  initDataUnsafe?: {
    user?: Partial<TelegramUser>;
    start_param?: string;
  };
  showAlert: (message: string) => void;
}

// Default user for testing purposes
export const defaultTelegramUser: TelegramUser = {
  dateCreated: "", // Add your default values here
  first_name: "TestUser",
  handle: "", // Set handle to testname
  lastLoggedIn: "",
  last_name: "",
  id: "5030917144", // myid
  referral: "5025509571", // Sal's telegram ID
  pickScore: 0,
  missionScore: 0,
  totalLosses: 0,
  totalWins: 0,
};

export async function getTelegram(): Promise<{
  webApp: TelegramWebApp;
  user: TelegramUser;
  referral: string | null;
  jumpToMission: string | null;
  onArgumentResult: (functionName: string, argument: string, result: string) => void;
  onResult: (functionName: string, result: string) => void;
  onReceivedEvent: (event: string, data: any) => void;
  executeArgumentMethod: (methodName: string, argument: string, method: () => any, ignoreAlert?: boolean) => void;
  executeMethod: (methodName: string, method: () => any, ignoreAlert?: boolean) => void;
}> {
  return new Promise((resolve, reject) => {
    const webApp = (window as any).Telegram.WebApp as TelegramWebApp;

    // Get the user information from Telegram or use the default user
    const user = webApp.initDataUnsafe?.user || defaultTelegramUser;
    const startParam = webApp.initDataUnsafe?.start_param;

    let referral: string | null = null;
    let jumpToMission: string | null = null; // Initialize the jumpToMission variable

    // Check if startParam is defined and parse the parameters
    if (startParam) {
      const params = startParam.split("-");

      params.forEach((param) => {
        if (param.startsWith("league_")) {
          // leagueFilter = getLeagueFromString(param.split("_")[1]); // Extract the league filter enum
        } else if (param.startsWith("ref_")) {
          referral = param.split("_")[1];
        } else if (param.startsWith("mission_")) {
          jumpToMission = param.split("_")[1]; // Extract the mission name
        }
      });
    }

    // Function to show alert with the result of a method call
    const onArgumentResult = (functionName: string, argument: string, result: string) => {
      webApp.showAlert(`${functionName}(${argument}) returned ${result}`);
    };

    const onResult = (functionName: string, result: string) => {
      onArgumentResult(functionName, "", result);
    };

    const onReceivedEvent = (event: string, data: any) => {
      webApp.showAlert(`received event(${event}) with data(${data})`);
    };

    // Function to execute a method with an argument and handle errors
    const executeArgumentMethod = (
      methodName: string,
      argument: string,
      method: () => any,
      ignoreAlert = false
    ) => {
      try {
        const result = method();
        if (!ignoreAlert) {
          const wrappedResult = `Result: ${result}`;
          onArgumentResult(methodName, argument, wrappedResult);
        }
      } catch (error: any) {
        onArgumentResult(methodName, argument, error.toString());
      }
    };

    // Function to execute a method without arguments
    const executeMethod = (methodName: string, method: () => any, ignoreAlert = false) => {
      executeArgumentMethod(methodName, "", method, ignoreAlert);
    };

    resolve({
      webApp,
      user: {
        ...user,
        id: String(user.id || ''), // Ensure id is a string
        handle: user?.handle || "", // Safely assign handle
        first_name: user?.first_name || "",
        dateCreated: user.dateCreated || "",  // Provide default value
        lastLoggedIn: user.lastLoggedIn || "", // Provide default value
        last_name: user.last_name || "",          // Provide default value
        referral: user.referral || "",          // Provide default value
        pickScore: user.pickScore ?? 0,        // Fallback to default if not present
        missionScore: user.missionScore ?? 0,  // Fallback to default if not present
        totalLosses: user.totalLosses ?? 0,    // Fallback to default if not present
        totalWins: user.totalWins ?? 0,        // Fallback to default if not present
      },
      referral,
      jumpToMission, // Include jumpToMission in the resolved object
      onArgumentResult,
      onResult,
      onReceivedEvent,
      executeArgumentMethod,
      executeMethod,
    });
    
  });
}

