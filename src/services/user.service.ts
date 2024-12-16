import admin from "firebase-admin"; 
import { Timestamp } from '@google-cloud/firestore';
import { db } from "../config/firebase";
import logger from "../config/logger";
import ApiError from "../utils/api-error";
import User, { FireStoreUser, UserArgs } from "../../client/src/models/User";
import { BadRequestError, NotFoundError } from "../error";

// Helper function to get a user by walletId (optional telegramId)
async function getUserByWalletId(walletId: string, breadcrumb?: string): Promise<User | null> {
  const newBreadcrumb = `getUserByWalletId(${walletId}):${breadcrumb}`;
  logger.info(`getUserByWalletId:${newBreadcrumb}`);

  const usersRef = db.collection("users");

  if (!walletId) {
    return null; // return 400 error
  }

  const snapshot = await usersRef.where("walletId", "==", walletId).get();

  if (snapshot.empty) {
    return null; // return 404
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data() as User;

  return userData;
}



// Function to get a user by Telegram ID and create one if not found
async function getUserByTelegramId(telegramId: string, username: string, breadcrumb?: string): Promise<User | null> {
  const newBreadcrumb = `getUserByTelegramId(${telegramId}):${breadcrumb}`;
  const usersRef = db.collection("users");

  if (!telegramId) {
    throw new BadRequestError("Telegram ID is required.");
  }

  const snapshot = await usersRef.where("telegramId", "==", telegramId).get();

  if (snapshot.empty) {
    logger.info(`User not found. Creating user: ${newBreadcrumb}`);
    const rightNow = new Date();
    const newUser = await createUser(
      {
        walletId: null,
        username: username, // Replace with a default or meaningful value
        telegramId,
        referralId: null,
        dateCreated: rightNow,
        lastLoggedIn: rightNow,
      },
      newBreadcrumb
    );
    return newUser;
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data() as User;

  return userData;
}

// Function to create a new user
async function createUser(args: Partial<UserArgs>, breadcrumb?: string): Promise<User | null> {
  const newBreadcrumb = `createUser(${args.walletId || args.telegramId}):${breadcrumb}`;
  const timeNow = Timestamp.now();

  if (!args.telegramId) {
    throw new BadRequestError("Telegram ID is required to create a user.");
  }

  const userArgs: Omit<FireStoreUser, "dateCreated"> = {
    walletId: args.walletId || null,
    username: args.username || "Unknown User", // Default username if not provided
    telegramId: args.telegramId,
    referralId: args.referralId || null,
    lastLoggedIn: timeNow.toDate(),
  };

  const usersRef = db.collection("users");

  // Search for existing user by telegramId
  const querySnapshot = await usersRef.where("telegramId", "==", args.telegramId).get();

  if (!querySnapshot.empty) {
    throw new NotFoundError("User with this Telegram ID already exists.");
  }

  // If no existing user, create a new one
  const documentId = args.telegramId;
  await usersRef.doc(documentId).set(userArgs);

  logger.info(
    `Created new user with walletId ${args.walletId} or telegramId ${args.telegramId}.`
  );

  const newUserSnapshot = await usersRef.doc(documentId).get();
  const newUserData = newUserSnapshot.data() as FireStoreUser;

  const dateCreated = new Timestamp(
    newUserData.dateCreated.seconds,
    newUserData.dateCreated.nanoseconds
  ).toDate();

  return new User({
    walletId: newUserData.walletId,
    username: newUserData.username,
    telegramId: newUserData.telegramId,
    referralId: newUserData.referralId || null,
    dateCreated,
    lastLoggedIn: new Date(newUserData.lastLoggedIn),
  });
}



// Helper function to update an existing user
async function updateUser(
  walletId: string, 
  telegramId: string, 
  updateData: Partial<FireStoreUser>
): Promise<User | null> {
  const usersRef = db.collection("users");

  // Find the user by walletId or telegramId
  let snapshot;
  if (walletId) {
    snapshot = await usersRef.where("walletId", "==", walletId).get();
  } else if (telegramId) {
    snapshot = await usersRef.where("telegramId", "==", telegramId).get();
  } else {
    return null;
  }

  if (snapshot.empty) {
    logger.info(`User with walletId ${walletId} or telegramId ${telegramId} not found.`);
    return null;
  }

  const userDoc = snapshot.docs[0];
  const userId = userDoc.id;
  
  // Update user with new data
  await usersRef.doc(userId).update(updateData);

  logger.info(`User with walletId ${walletId} or telegramId ${telegramId} has been updated.`);

  // Retrieve the updated user data
  const updatedUserDoc = await usersRef.doc(userId).get();
  const updatedUserData = updatedUserDoc.data() as FireStoreUser;

  const tstamp = new Timestamp(updatedUserData.dateCreated.seconds, updatedUserData.dateCreated.nanoseconds).toDate();

  return new User({
    walletId: updatedUserData.walletId || null,
    username: updatedUserData.username,
    telegramId: updatedUserData.telegramId,
    referralId: updatedUserData.referralId || null,
    dateCreated: tstamp,
    lastLoggedIn: new Date(updatedUserData.lastLoggedIn),
  });
}

export default {
  getUserByTelegramId,
  getUserByWalletId,
  createUser,
  updateUser,
};

