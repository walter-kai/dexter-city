import admin from "firebase-admin"; 
import { Timestamp } from '@google-cloud/firestore';
import { db } from "../config/firebase";
import logger from "../config/logger";
import ApiError from "../utils/api-error";
import User, { FireStoreUser } from "../../client/src/models/User";

// Helper function to get a user by walletId (optional telegramId)
async function getUser(walletId: string, telegramId?: string): Promise<User | null> {
  const usersRef = db.collection("users");
  
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
  const userData = userDoc.data() as FireStoreUser;

  const tstamp = new Timestamp(userData.dateCreated.seconds, userData.dateCreated.nanoseconds).toDate();

  return new User({
    walletId: userData.walletId,
    username: userData.username,
    telegramId: userData.telegramId || null,
    referralId: userData.referralId || null,
    dateCreated: tstamp,
    lastLoggedIn: new Date(userData.lastLoggedIn), // Adjusting Firestore timestamp to JavaScript Date
  });
}

// Simplified createUser function taking a User object (partial)
async function createUser(
  args: User,
  breadcrumb?: string
): Promise<User> {
  const newBreadcrumb = `createUser(${args.walletId || args.telegramId}):${breadcrumb}`;
  const timeNow = Timestamp.now();

  const userArgs: Omit<FireStoreUser, "id"> = {
    walletId: args.walletId,
    username: args.username,
    telegramId: args.telegramId,
    referralId: args.referralId,
    dateCreated: timeNow,
    lastLoggedIn: timeNow.toDate(),
  };

  const usersRef = db.collection('users');

  // Search for existing user by walletId or telegramId
  const q = usersRef.where("walletId", "==", args.walletId).where("telegramId", "==", args.telegramId);
  const querySnapshot = await q.get();

  if (!querySnapshot.empty) {
    const existingUserDoc = querySnapshot.docs[0];
    const existingUserData = existingUserDoc.data() as FireStoreUser;

    logger.info(`User with walletId ${args.walletId} or telegramId ${args.telegramId} already exists.`);
    const tstamp = new Timestamp(existingUserData.dateCreated.seconds, existingUserData.dateCreated.nanoseconds).toDate();
    
    return new User({
      walletId: existingUserData.walletId,
      username: existingUserData.username,
      telegramId: existingUserData.telegramId || null,
      referralId: existingUserData.referralId || null,
      dateCreated: tstamp,
      lastLoggedIn: new Date(existingUserData.lastLoggedIn),
    });
  }

  // If no existing user, create a new one
  const documentId = `${args.walletId || args.telegramId}`; 
  await usersRef.doc(documentId).set(userArgs); 
  
  logger.info(`Created new user with walletId ${args.walletId} or telegramId ${args.telegramId}.`);

  const newUserSnapshot = await usersRef.doc(documentId).get();
  const newUserData = newUserSnapshot.data() as FireStoreUser;

  const newTstamp = new Timestamp(newUserData.dateCreated.seconds, newUserData.dateCreated.nanoseconds).toDate();

  return new User({
    walletId: newUserData.walletId,
    username: newUserData.username,
    telegramId: newUserData.telegramId || null,
    referralId: newUserData.referralId || null,
    dateCreated: newTstamp,
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
    walletId: updatedUserData.walletId,
    username: updatedUserData.username,
    telegramId: updatedUserData.telegramId || null,
    referralId: updatedUserData.referralId || null,
    dateCreated: tstamp,
    lastLoggedIn: new Date(updatedUserData.lastLoggedIn),
  });
}

export default {
  getUser,
  createUser,
  updateUser,
};

