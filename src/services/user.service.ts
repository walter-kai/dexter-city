import admin from "firebase-admin"; // Import admin SDK
import User, { FireStoreUser} from "../../client/src/models/User";

import logger from "../config/logger";
import ApiError from "../utils/api-error";

// Initialize Firestore using Firebase Admin SDK
// const firestore = admin.firestore();

// import { collection, query, where, getDocs, addDoc } from "firebase/firestore"; 
import { Timestamp } from '@google-cloud/firestore'; // Ensure this is correct

import db from '../config/firebase'; // Import the initialized Firestore instance


/**
 * Updates a user's Firestore document by their Telegram ID.
 * 
 * @param {string} telegramId - The Telegram ID of the user to update.
 * @param {Partial<FireStoreUser>} updateFields - Object containing the fields to update.
 * @param {string | undefined} [breadcrumb] - Optional breadcrumb for logging.
 * @returns {Promise<User | null>} - Returns the updated user object or null if not found.
 */
const updateUserDocByTelegramId = async (
  user: User,
  breadcrumb?: string
): Promise<{ message: string; user: User } | null> => {
  const { telegramid } = user; // Extract telegramId
  const newBreadcrumb = `updateUserDocByTelegramId(${telegramid}):${breadcrumb}`;
  const usersRef = db.collection("users");

  logger.info(JSON.stringify({ breadcrumb: newBreadcrumb }));

  // Build and execute the query to find the user by telegramId
  const q = usersRef.where("telegramid", "==", telegramid);
  const snapshot = await q.get();

  // Log the result size
  logger.info(JSON.stringify({ breadcrumb: newBreadcrumb, snapshotSize: snapshot.size }));

  // If no user is found, return null
  if (snapshot.empty) {
    logger.info(`User with telegramId ${telegramid} not found.`);
    return null;
  }

  // Get the first matching document (assuming telegramId is unique)
  const userDoc = snapshot.docs[0];
  const userData = userDoc.data() as FireStoreUser;

  // Update the lastLoggedIn field and any other fields from the user object
  await userDoc.ref.update({
    ...user,
    lastLoggedIn: admin.firestore.Timestamp.now().toDate().toString(),
  });

  logger.info(`User with telegramId ${telegramid} updated.`);

  // Create a new user object with the updated information
  const newUser = new User({
    ...userData,
    ...user, // Merge with the original user object
    id: userDoc.id,
    dateCreated: userDoc.createTime?.toDate(),
  });

  // Return the updated user in the desired format
  return {
    message: "User updated successfully",
    user: newUser,
  };
};





/**
 * Creates a new user or returns the existing user if found.
 *
 * @param {Object} args - The user details to create.
 * @param {string} args.telegramid - Telegram ID of the user to create.
 * @param {string | undefined} [args.firstname] - First name of the user to create.
 * @param {string | undefined} [args.lastname] - Last name of the user to create.
 * @param {string | undefined} [args.handle] - Username of the user to create.
 * @param {string | undefined} [args.referral] - Telegram ID of the user who referred this user.
 * @param {string | undefined} [breadcrumb] - Optional breadcrumb for logging.
 * @returns {Promise<User>} The created or found user object.
 */

async function createUser(
  args: {
    telegramid: string;
    firstName?: string;
    lastName?: string;
    handle?: string;
    referral?: string;
  },
  breadcrumb?: string
): Promise<User> {
  const newBreadcrumb = `createUser(${args.telegramid}):${breadcrumb}`;
  const timeNow = Timestamp.now();

  const userArgs: Omit<FireStoreUser, "id"> = {
    telegramid: args.telegramid,
    firstname: args.firstName || null,
    lastname: args.lastName || null,
    handle: args.handle || null,
    referral: args.referral || null,
    dateCreated: timeNow, // This should be a Firestore Timestamp
    lastLoggedIn: timeNow.toDate().toString(), // This can stay as a string for now
    pickScore: 0,
    missionScore: 0,
    totalLosses: 0,
    totalWins: 0,
    totalScore: 0,
    favoriteSports: null,
  };
  
  const usersRef = db.collection('users');

  logger.info(
    JSON.stringify({
      breadcrumb: newBreadcrumb,
      userArgs,
    })
  );

  // Check if a user with the same telegramId already exists
  const q = usersRef.where("telegramid", "==", args.telegramid);
  const querySnapshot = await q.get();

  if (!querySnapshot.empty) {
    // User exists, return existing user data
    const existingUserDoc = querySnapshot.docs[0];
    const existingUserData = existingUserDoc.data() as FireStoreUser;

    logger.info(`User with telegramId ${args.telegramid} already exists.`);
    const tstamp = new Timestamp(existingUserData.dateCreated.seconds, existingUserData.dateCreated.nanoseconds).toDate();
    
    return new User({
      ...existingUserData,
      id: existingUserDoc.id,
      dateCreated: tstamp, // Convert Firestore Timestamp to Date object
    });
  }

  // Create a new user since no existing user was found
  const documentId = `${args.firstName}:${args.telegramid}`; // Format the ID as firstname:telegramid
  await usersRef.doc(documentId).set(userArgs); // Use set method with the specified document ID
  
  logger.info(`Created new user with telegramId ${args.telegramid}.`);

  // Get the newly created user's data
  const newUserSnapshot = await usersRef.doc(documentId).get();
  const newUserData = newUserSnapshot.data() as FireStoreUser;

  // Convert Firestore Timestamp to Date object for dateCreated
  const newTstamp = new Timestamp(newUserData.dateCreated.seconds, newUserData.dateCreated.nanoseconds).toDate();

  return new User({
    ...newUserData,
    id: newUserSnapshot.id, // This will now be firstname:telegramid
    dateCreated: newTstamp,
  });
}


const getUsersByTelegramId = async (
  telegramIds: ReadonlyArray<string>,
  breadcrumb?: string
): Promise<Record<string, User>> => {
  const newBreadcrumb = `getUsersByTelegramId(${telegramIds}):${breadcrumb}`;
  logger.info(JSON.stringify({ breadcrumb: newBreadcrumb }));

  if (telegramIds.length > 30) {
    throw new ApiError(400, `Too many telegramIds, max 30. ${newBreadcrumb}`);
  }

  const usersCollection = db.collection('users');
  const q = usersCollection.where("telegramid", "in", telegramIds);
  const querySnapshot = await q.get();

  logger.info(JSON.stringify({ breadcrumb: newBreadcrumb, querySnapshotSize: querySnapshot.size }));

  let userMap: Record<string, User> = {};

  querySnapshot.forEach((doc) => {
    const queryData = doc.data() as FireStoreUser;
    userMap[queryData.telegramid] = new User({
      ...queryData,
      id: doc.id,
      dateCreated: doc.createTime?.toDate(),  // Using Firestore timestamp
    });
  });

  logger.info(JSON.stringify({ breadcrumb: newBreadcrumb, userMap }));

  // If the user is not found, return an empty object without throwing an error
  return userMap;
};

// Set a user's chatId
const setUserChatId = async (
  telegramId: string,
  chatId: string,
  breadcrumb?: string
): Promise<void> => {
  const newBreadcrumb = `setUserChatId(${telegramId}):${breadcrumb}`;
  logger.info(JSON.stringify({ breadcrumb: newBreadcrumb }));

  const usersRef = db.collection('users');
  const q = usersRef.where("telegramid", "==", telegramId);
  const usersSnapshot = await q.get();

  if (usersSnapshot.empty) {
    logger.warn(`User with telegramId ${telegramId} not found`);
    return;
  }

  const userDocRef = usersSnapshot.docs[0].ref;
  await userDocRef.update({ chatId });
  logger.info(JSON.stringify({ breadcrumb: newBreadcrumb, chatId }));
};

// Get all users
const getAllUsers = async (breadcrumb?: string): Promise<ReadonlyArray<User>> => {
  const newBreadcrumb = `getAllUsers():${breadcrumb}`;
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();

  logger.info(JSON.stringify({ breadcrumb: newBreadcrumb, snapshotSize: snapshot.size }));

  return snapshot.docs.map((el) => {
    const firestoreUser = el.data() as FireStoreUser;
    return new User({
      ...firestoreUser,
      id: el.id,
      dateCreated: el.createTime?.toDate(),  // Using Firestore timestamp
    });
  });
};

// Get users with pagination support
const getUsers = async (
  args: {
    limit?: number;
    offsetDocId?: string;
    offsetValues?: Array<string | number>;
    orderProperties?: Array<string>;
    orderDirection?: "asc" | "desc";
    paginationFunc?: "startAt" | "startAfter";
  },
  breadcrumb?: string
): Promise<ReadonlyArray<User>> => {
  const newBreadcrumb = `getUsers(${JSON.stringify(args)}):${breadcrumb}`;
  const {
    limit: limitNum = 30,
    offsetDocId,
    offsetValues = [],
    orderProperties = [],
    orderDirection = "desc",
    paginationFunc = "startAfter",
  } = args;

  const usersRef = db.collection('users');
  let startsAfterArgs: unknown[] = offsetValues;
  if (offsetDocId) {
    startsAfterArgs.push(offsetDocId);
  }

  // if (offsetDocId || offsetValues.length > 0) {
  //   queryConstraints.push(paginationFunc === "startAfter" ? startAfter(...startsAfterArgs) : startAt(...startsAfterArgs));
  // }

  // const q = usersRef.orderBy("someField").limit(limitNum); // Adjust this as necessary
  const snapshot = await usersRef.get();

  logger.info(JSON.stringify({ breadcrumb: newBreadcrumb, snapshotSize: snapshot.size }));

  return snapshot.docs.map((el) => {
    const firestoreUser = el.data() as FireStoreUser;
    return new User({
      ...firestoreUser,
      id: el.id,
      dateCreated: el.createTime?.toDate(),  // Using Firestore timestamp
    });
  });
};


/**
 * Updates a user's information by their Telegram ID, using a query-based approach.
 * 
 * @param {string} telegramId - The Telegram ID of the user to update.
 * @param {Object} args - Fields to update (handle, firstname, lastname, referral).
 * @param {string} [args.handle] - The Telegram handle/username to update.
 * @param {string} [args.firstname] - The first name to update.
 * @param {string} [args.lastname] - The last name to update.
 * @param {string} [args.referral] - The telegramId of the user who referred this user.
 * @param {string} [breadcrumb] - Optional breadcrumb for logging.
 * @returns {Promise<User | null>} - Returns the updated user object or null if not found.
 */
const updateUserInfoByTelegramId = async (
  args: {
    telegramId: string,
    handle?: string;
    firstname?: string;
    lastname?: string;
    referral?: string;
  },
  breadcrumb?: string
): Promise<User | null> => {
  const newBreadcrumb = `updateUserInfoByTelegramId(${args.telegramId}):${breadcrumb}`;
  const usersRef = db.collection("users");

  logger.info(JSON.stringify({ breadcrumb: newBreadcrumb, args }));

  // Build and execute the query to find the user by telegramId
  const q = usersRef.where("telegramid", "==", args.telegramId);
  const snapshot = await q.get();

  // Log the result size
  logger.info(JSON.stringify({ breadcrumb: newBreadcrumb, snapshotSize: snapshot.size }));

  // If no user is found, return null
  if (snapshot.empty) {
    logger.info(`User with telegramId ${args.telegramId} not found.`);
    return null;
  }

  // Get the first matching document (assuming telegramId is unique)
  const userDoc = snapshot.docs[0];
  const userData = userDoc.data() as FireStoreUser;

  // Prepare fields to update
  const updatedFields: Partial<FireStoreUser> = {
    ...(args.handle ? { handle: args.handle } : {}),
    ...(args.firstname ? { firstname: args.firstname } : {}),
    ...(args.lastname ? { lastname: args.lastname } : {}),
    ...(args.referral && !userData.referral ? { referral: args.referral } : {}),
    lastLoggedIn: admin.firestore.Timestamp.toString(), // Always update the lastLoggedIn field
  };

  // Update the user document with the new fields
  await userDoc.ref.update(updatedFields);

  logger.info(`User with telegramId ${args.telegramId} updated.`);

  // Return the updated user object
  return new User({
    ...userData,
    ...updatedFields,
    id: userDoc.id,
    dateCreated: userDoc.createTime?.toDate(),
  });
};



// Exporting functions
export default {
  setUserChatId,
  getUsersByTelegramId,
  getAllUsers,
  getUsers,
  createUser,
  updateUserInfoByTelegramId,
  updateUserDocByTelegramId

};
