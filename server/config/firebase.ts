import admin from 'firebase-admin';

// Service account details for Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": "skylar-442701",
  "private_key_id": "2a22aaf902965c24a181cc6f75241baf6132e929",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3N0VgC7FFMKrm\nkFw1rduqaj21N2qt2prsyanY2B2cpBPgu3dtqdmWmr1D0pu/9pKYdNKXqrK6i9n9\nHdx+hNMyWLLqdrLa+YDpSbXEyzG9iO6CtwtDWINQ3G4qQ3Q7cOblQkVnEpRMgY68\nroIig9INLDiZpbb2z927zCtl7R3TcbDq6JHTdVrZdQbPYXVG0WfKTSP6Knt9vWoE\nTcP04Rtw9+59SXMUr56HXvhMqZm1K4CYq8KoX8piWQwrWTf1lM/Uugf72qq0l2Yj\nAkD4+wRlo8NdCPvm/RzlLwIkpOH9dB05NApa+qgXFgvc6ycLXcwt1/gkCRe+XISk\nJBWhzHnHAgMBAAECggEAWMK4I23GteR8BzNM2NyfnRHXT2HHlu5fO/P/CwS4Y9jB\noJBxrXkp5uKUarUvq3JDVwTRuZSC/gke1JeQ6OJkhvGdzCUxRRC3OU3yd6KROGeM\nVVtkY34QMC56WJNRTjLGSa8vfF3t5pqlkhdhCGOgca1IxncYCr5th7vEEp8rYfHS\nQ006QXWf+8nCw6QwznT9NKaL6JGGpfjHXQtxlkZLk2or9xhLRx8I7eutjxkR75s0\nYyynpg79T5t1ZY4Kc4qMeLnn+AhfGAd8qTg/R7LHu59LsNTP8okdvCM0mDzS7Yo3\nioY7Z9P0akJMWvpDlVog90fWlQ9gSG1uHnc/v8PJAQKBgQDkoZNCM6E0SFjYbm1V\nWKMFfLO0CUVbBuJ3EiOAGN+IECACLyW0sMroiO2Jj4qhf+M6DL+CfxZpi4kYbo9M\noNQzhnHRs6/FoQXHJ/s6G1f0duf21JNPSxrcnCTU/9zuB1HmfB5tIghqSTOlV/b/\nDRID4JfhMPFkBy34cyncRaIwQQKBgQDNJfDZhzivPUHMc1A7lMvnw8GmpcCj2MK/\nz9etxvJSXFSIlosPVMwFiSNGLPc6D6rWb4hgMqaTTwJalLAeHXsG30SLu+aoHfME\nMps8mRW9GzNlEVU9Fj07UxQi5FzJUkjPit60q0z/Gsywn8QpKFKZ5Vw7CEQuymgE\nJ0IxThMoBwKBgQCXSg/u48lNln4sIc55hmDB1cX4YZYiaQjcsAUL0+m+2KTFrTsv\nOTnb7Bf7Sh/7RGwxUpQ7nytOhkYfA7IRi+8/dTzF/jhW93miUuOcjNGD9FcE75/W\n/aT1zOFWjUU9wVxBv2pG3xlgc7YYOIA6QATmyezW2BM0FMgnutU9bFqpwQKBgFNg\ntD704mj2sKNzyowssaMEwNQGUgFFvAFRbAtI7Hvk4saQyPv2LuWhEyEWbXS/oWN9\n+SN/8ou0dPRzshDLUpE8dROFzv1NDtQJ7WX3ogo13/GX1dj6DPDrlyeHQN7h/o27\nl0A+zxBvx/mRNZy0sr2xpoanmW6a/SOTASgg31BJAoGBAKb7mDyKWxOHOSktpgbx\nIGS75cF8jUB24SaV2jklp62Pxz2rX7zw1uBSL0eGDZb/21lBdaXSzwD7eEvWSNY5\nGWHf1/JfAjQdSpgbeB4EuecEyEUPfw5gZAPLtHujN+iTp3jh+nd1bN2WkM/fgh+p\nPIEpcSofnAtcbXaDpUHWAsn5\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-qxets@skylar-442701.iam.gserviceaccount.com",
  "client_id": "100197603718462720550",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-qxets%40skylar-442701.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://skylar-442701.firebaseio.com",
    storageBucket: "gs://skylar-442701.firebasestorage.app"
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket(); // Get the storage bucket

export { db, bucket }; // Export both the Firestore db and the storage bucket
