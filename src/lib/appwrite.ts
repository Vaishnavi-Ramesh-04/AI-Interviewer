import { Client, Account, Databases } from 'appwrite';

export const appwriteClient = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

// Set the endpoint and project ID only if they exist (to prevent crashes during static generation without envs)
if (endpoint && projectId) {
  appwriteClient
    .setEndpoint(endpoint)
    .setProject(projectId);
}

export const account = new Account(appwriteClient);
export const databases = new Databases(appwriteClient);
