import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI as string | undefined;

if (!uri) {
  throw new Error("MONGODB_URI is not set in environment variables");
}

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const connectedClient = await (clientPromise as Promise<MongoClient>);
  return connectedClient.db("calsnap");
}


