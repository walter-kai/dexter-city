import admin from "firebase-admin"; // Import admin SDK
import User, { FireStoreUser, UserArgs} from "../../../client/src/models/User";

import logger from "../../config/logger";
import { db } from "../../config/firebase";
import ApiError from "../../utils/api-error";

// Initialize Firestore using Firebase Admin SDK
// const firestore = admin.firestore();

// import { collection, query, where, getDocs, addDoc } from "firebase/firestore"; 
import { Timestamp } from '@google-cloud/firestore'; // Ensure this is correct

import { Telegraf } from "telegraf";
import { PassThrough } from "stream";

/**
 * Updates an existing user in the Firestore database by their Telegram ID.
 *
 * @param {User} user - The user object containing updated details.
 * @param {string | undefined} [breadcrumb] - Optional breadcrumb for logging.
 * @returns {Promise<User>} The updated user object.
 */
async function updateUser(user: User, breadcrumb?: string): Promise<User> {
  const newBreadcrumb = `updateUser(${user.walletId}):${breadcrumb}`;
  // const timeNow = Timestamp.now();

  const usersRef = db.collection('users');

  // Update data directly in the update call
  try {
    const q = usersRef.where("walletId", "==", user.walletId);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      throw new ApiError(404, `User with walletId ${user.walletId} not found.`);
    }

    const existingUserDoc = querySnapshot.docs[0];
    const existingUserRef = usersRef.doc(existingUserDoc.id);

    await existingUserRef.update({
      ...user
      // lastLoggedIn: timeNow, // Store as Firestore Timestamp
    });

    logger.info(`Updated user with telegramId ${user.telegramId}.`);

    const updatedUserSnapshot = await existingUserRef.get();
    const updatedUserData = updatedUserSnapshot.data() as FireStoreUser;

    // Convert Firestore Timestamp to Date object for dateCreated and lastLoggedIn
    const dateCreated = (updatedUserData.dateCreated instanceof Timestamp) ? updatedUserData.dateCreated.toDate() : new Date();
    const lastLoggedIn = (updatedUserData.lastLoggedIn instanceof Timestamp) ? updatedUserData.lastLoggedIn.toDate() : new Date();

    return new User({
      ...updatedUserData,
      dateCreated,
      lastLoggedIn,
    });
  } catch (error) {
    logger.error(`Error updating user: ${error}, breadcrumb: ${newBreadcrumb}`);
    throw error; // Re-throw the error after logging
  }
}

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
  args: UserArgs,
  breadcrumb?: string
): Promise<User> {
  const newBreadcrumb = `createUser(${args.telegramId}):${breadcrumb}`;
  const timeNow = Timestamp.now();

  const usersRef = db.collection("users");
  const bot = new Telegraf(process.env.TELEGRAM_TOKEN as string);

  logger.info(
    JSON.stringify({
      breadcrumb: newBreadcrumb,
      args,
    })
  );

  // Check if a user with the same walletId already exists
  const q = usersRef.where("walletId", "==", args.walletId);
  const querySnapshot = await q.get();

  if (!querySnapshot.empty) {
    // User exists, return existing user data
    const existingUserDoc = querySnapshot.docs[0];
    const existingUserData = existingUserDoc.data() as FireStoreUser;

    logger.info(`User with walletId ${args.walletId} already exists.`);

    const existingDateCreated = new Timestamp(
      existingUserData.dateCreated.seconds,
      existingUserData.dateCreated.nanoseconds
    ).toDate();

    return new User({
      ...existingUserData,
      dateCreated: existingDateCreated, // Keep the original creation date
    });
  }

  // Fetch the profile photo using Telegraf's bot.telegram
  const profilePhotos = await bot.telegram.getUserProfilePhotos(
    Number(args.telegramId)
  );

  // Safely handle the response and fetch profilePicId
  const profilePicId = profilePhotos?.photos?.[0]?.[0]?.file_id || null;

  // Download and upload the profile picture
  const profilePicUrl = profilePicId
    ? await downloadAndUploadToFirebase(bot, profilePicId, args.telegramId)
    : null;

  // Set the `dateCreated` to the current timestamp for new users
  const userPayload: FireStoreUser = {
    ...args,
    dateCreated: timeNow, // Set current timestamp for new user creation
    lastLoggedIn: timeNow.toDate(),
    photoId: profilePicId || null,
    photoUrl: profilePicUrl || null,
    favoriteTokens: null, // Ensure null for favoriteTokens
  };

  // Add a new document with an auto-generated ID
  const newUserRef = await usersRef.add(userPayload);

  logger.info(`Created new user with auto-generated ID: ${newUserRef.id}.`);

  // Retrieve the newly created user's data
  const newUserSnapshot = await newUserRef.get();
  const newUserData = newUserSnapshot.data() as FireStoreUser;

  // Convert Firestore Timestamp to Date object for `dateCreated`
  const newDateCreated = new Timestamp(
    newUserData.dateCreated.seconds,
    newUserData.dateCreated.nanoseconds
  ).toDate();

  return new User({
    ...newUserData,
    dateCreated: newDateCreated,
  });
}

const getUserByWalletId = async (
  walletId: string,
  breadcrumb?: string
): Promise<User | null> => {
  const newBreadcrumb = `getUserByWalletId(${walletId}):${breadcrumb}`;
  // logger.info(JSON.stringify({ breadcrumb: newBreadcrumb }));

  if (!walletId) {
    throw new ApiError(400, `Invalid walletId provided. ${newBreadcrumb}`);
  }

  const usersCollection = db.collection("users");
  const q = usersCollection.where("walletId", "==", walletId).limit(1);
  const querySnapshot = await q.get();

  // logger.info(JSON.stringify({ breadcrumb: newBreadcrumb, querySnapshotSize: querySnapshot.size }));

  if (querySnapshot.empty) {
    logger.info(JSON.stringify({ breadcrumb: newBreadcrumb, message: "No user found." }));
    return null;
  }

  const doc = querySnapshot.docs[0];
  const queryData = doc.data() as User;

  // Ensure photoId and photoUrl are defined or null
  const photoId = queryData.photoId !== undefined ? queryData.photoId : null;
  const photoUrl = queryData.photoUrl !== undefined ? queryData.photoUrl : null;

  const user = new User({
    ...queryData,
    photoId, // Pass the photoId as either string or null
    photoUrl,
    dateCreated: doc.createTime?.toDate() || new Date(),
  });

  logger.info(JSON.stringify({ breadcrumb: newBreadcrumb, user }));

  return user;    
};

/**
 * Download the file from Telegram and upload it to Firebase Storage.
 * @param {Telegraf} bot - The Telegraf bot instance.
 * @param {string} fileId - The file ID to fetch the image.
 * @param {string} userId - The user's Telegram ID to create a unique filename.
 * @returns {Promise<string | null>} The download URL in Firebase Storage or null if not successful.
 */
const downloadAndUploadToFirebase = async (bot: Telegraf, fileId: string, userId: string): Promise<string | null> => {
  try {
    const file = await bot.telegram.getFile(fileId);
    if (file && file.file_path) {
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file.file_path}`;

      // Download the image
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Failed to fetch file from Telegram');

      // Create a reference to the Firestore Storage bucket
      const bucket = admin.storage().bucket(); // Initialize the storage bucket
      const fileName = `${userId}.jpg`; // Create a unique filename
      const fileUploadStream = bucket.file(`profilePics/${fileName}`).createWriteStream({
        metadata: {
          contenttype: response.headers.get('content-type'), // Correct property name
        },
      });

      // Convert the ReadableStream from fetch to a Node.js stream
      const passThroughStream = new PassThrough();
      const reader = response.body?.getReader();

      // Read the stream and push chunks to PassThrough
      const pump = async () => {
        while (true) {
          const result = await reader?.read(); // Read the next chunk
          if (result?.done) break; // Exit loop if done

          // Push the chunk into the PassThrough stream
          passThroughStream.write(result?.value);
        }
        passThroughStream.end(); // End the PassThrough stream
      };

      pump().catch(err => {
        console.error('Error reading response stream:', err);
        passThroughStream.destroy(err); // Handle errors and destroy stream
      });

      // Pipe PassThrough to the upload stream
      passThroughStream.pipe(fileUploadStream);

      return new Promise((resolve, reject) => {
        fileUploadStream.on('finish', () => {
          // Get the public URL of the uploaded file
          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/profilePics%2F${encodeURIComponent(fileName)}?alt=media`;

          // Log successful upload
          logger.info(`Successfully uploaded profile picture for userId: ${userId}, URL: ${publicUrl}`);
          resolve(publicUrl);
        });
        fileUploadStream.on('error', (error) => {
          console.error('Error uploading file to Firestore Storage:', error);
          reject(null);
        });
      });
    }
    return null;
  } catch (error) {
    console.error("Error downloading or uploading file:", error);
    return null;
  }
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
  const q = usersRef.where("telegramId", "==", telegramId);
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
      // id: el.id,
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
      // id: el.id,
      dateCreated: el.createTime?.toDate(),  // Using Firestore timestamp
    });
  });
};





// Exporting functions
export default {
  setUserChatId,
  getUserByWalletId,
  getAllUsers,
  getUsers,
  createUser,
  updateUser,

};
