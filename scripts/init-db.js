const sdk = require('node-appwrite');
const { Permission, Role } = sdk;

const client = new sdk.Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

const DB_ID = "interviews_db";
const COLL_ID = "interviews";

async function setup() {
    try {
        console.log("Checking if Database exists...");
        try {
            await databases.get(DB_ID);
            console.log("Database exists.");
        } catch (e) {
            console.log("Creating database...");
            await databases.create(DB_ID, "AI Interviews");
        }

        console.log("Checking if Collection exists...");
        try {
            const coll = await databases.getCollection(DB_ID, COLL_ID);
            console.log("Collection exists. Updating permissions...");
            // Update permissions for existing collection
            await databases.updateCollection(DB_ID, COLL_ID, "Interview Sessions", [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ]);
        } catch (e) {
            console.log("Creating collection with permissions...");
            await databases.createCollection(DB_ID, COLL_ID, "Interview Sessions", [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ]);
            
            // Attributes
            console.log("Creating attributes...");
            await databases.createStringAttribute(DB_ID, COLL_ID, "userId", 100, true);
            await databases.createStringAttribute(DB_ID, COLL_ID, "role", 100, true);
            await databases.createIntegerAttribute(DB_ID, COLL_ID, "duration", false);
            await databases.createIntegerAttribute(DB_ID, COLL_ID, "score", false, 0, 100);
            await databases.createIntegerAttribute(DB_ID, COLL_ID, "confidence", false, 0, 100);
            await databases.createStringAttribute(DB_ID, COLL_ID, "feedback", 5000, false);
            await databases.createDatetimeAttribute(DB_ID, COLL_ID, "createdAt", false);
            console.log("Attributes created.");
        }

        console.log("Setup complete!");
    } catch (e) {
        console.error("Setup failed:", e);
    }
}

setup();

setup();
