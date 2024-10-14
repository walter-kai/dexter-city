import admin from 'firebase-admin';

// Service account details for Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": "battlebet-22c4a",
  "private_key_id": "de7f56a710cc3e2cc048732a2ae32e1d40e310f3",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCs6OmBois4Wc0F\n7f48A8cfC12o8u2qobkS9dAivufBK8Un1kvhrgbc9w/EGxQGweIfJpe0uY7Cap4Y\naMohKjGzF8waCVJoh3KXxC57bXjJTuUYb64KkIDIolJRxscEVi0jirhsIMV9vWg7\n6VtC+9O4jZXVVO1kLJeLJT5IAsVgyG6LWIzWi37TWs68Mg2Z3blNH2YIujd60wxX\ne3LZNh/KSBiZcBAmvYZqeyJMTE/KFhx2x1C0h6TpWgNesqcnrgqukQE2ukj1bWFD\nV7nVHqc7+BWXNolt7yLxj6/K6hirxnUc9UMz2gUukqeda88A+hVorYn/XMt8j6HV\nzPo46qHVAgMBAAECgf902PDzqaOLcSQb3bjw1Zy6XfPtOD1kEeX/6h29XUVARVP2\nl9qvp+r7Z/o/jAz8hAlLA8mBV+QhfetYk3gE8X6kiHBlJ+eIu/+0j97ZiiEV6Tro\nSJBUk1J0Qz1eBfZ398SJQDVg3MSZNGY8FnaVzZhGH2ghwkKqb3f5kDGGeFjqDWq8\njG+6Bgz69slbOxWtPjiF9mD/ikStDJfUKUEj+qDy1URKMo0TMAwd56U6OUIMCPfj\nxC/tvuANSuZ496Y8Ak5l+z7Mz91NPmfoEbP1PEQqBwd26cRQXgBoJApUKDrxb134\nru/caeur0TiQ71sACCI5Z5UYVYswyzdszps4ZN0CgYEA6ZZvRmitnuewlIYJEoV9\nSVB6iTclXAsS6BQEakI8pnveH++X4BFlekwvjWyO1YbCJWTgo99tcNsACXQ2kyLd\nZUKIWeWX8eh8TLoqQ9nvSgLCXNu4vNRPiu788yAzou9hHWuO8F58zQR11L4R3azn\ntdBbepS+NiofNV/CZrRp2tcCgYEAvYAPfkDK95dL3f3nN+MPM6mBfiv3m3yZRP/C\nYO3vdPliQP2BHexMBzp7STXCraeExllSlZt9o1acovUJ9KUitpOP1v4urLV5ps+A\n5+IewUGnYLKyuoG/roqAUW2//bnugIZpay8cbspQxneJaUkj7sD1HvRchzpDbZ31\n0CXMHzMCgYEA4WPT6Ud2SD9dpmKS/HksBAMQybgZZ3AUBTXTcMiLB0W8dmpUzNNc\nbJ54v+jBBg4q5bQqAlXDn0LiDT1Cr8TThjKlqMCeVcCzt8FmqOPwPiTdcIZfAm2G\ndxPVpa8rxAthVOcFHLC/kX+9RtNEH/cH+eqbanN9+nu4c2L8DOgGwC8CgYEAmieP\n8vPAaPNiGz+OFY+XcT5mAf7AWXNdt5ybQoCseCra++V9YJs2KfcwDZk3Ok75GuXU\n4bFw3iv6FjJiG+suNvoJXCrAS20Bfmp1Aa2XuTywbWBRNpmQFevDgPpX4Y6cb19o\naHIVnibk2N6rIMQIABRmEv1UPAlwir6iFeZ5i7MCgYAREqftWr6F1/y9EMe38s1t\nNVUu+ubwywIcYCUWFWvzLKJU4na57G6ZJH4g1LDZt3vGH9Ni/B0OgT7nWdmAUqls\nJrTjLmboA5OpU9gLbExw1hCZoX0o4QFFCtRGMxFlJZHZCTm4Oosa36aeAYNnTR+N\nMTldjqsDcw5zIJZqpO5T4w==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-tkrtd@battlebet-22c4a.iam.gserviceaccount.com",
  "client_id": "104310522075952995363",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-tkrtd%40battlebet-22c4a.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://battlebet-22c4a.firebaseio.com"
  });
}

const db = admin.firestore();

export default db;
