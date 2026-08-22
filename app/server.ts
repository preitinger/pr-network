import { MongoClient, type ObjectId, type WithId } from "mongodb";
import type { ClientIdea } from "./types";
import { ideaToClient, type IdeaDoc } from "./dbTypes";
import assert from "assert";

export const DB_NAME = "network";

if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client2: MongoClient;
let clientPromise2: Promise<MongoClient> | null = null;

export function getMongoClient(): Promise<MongoClient> {
    // Wenn die Promise schon existiert (weil wir im Dev-Modus sind oder schon ein Request lief), gib sie zurück
    if (clientPromise2) {
        return clientPromise2;
    }

    if (process.env.NODE_ENV === "development") {
        const globalWithMongo = global as typeof globalThis & {
            _mongoClientPromise?: Promise<MongoClient>;
        };

        if (!globalWithMongo._mongoClientPromise) {
            client2 = new MongoClient(uri, options);
            globalWithMongo._mongoClientPromise = client2.connect();
        }
        clientPromise2 = globalWithMongo._mongoClientPromise;
    } else {
        // Im Production/Build-Modus wird das JETZT nicht mehr beim Import ausgeführt,
        // sondern erst, wenn getMongoClientPromise() aufgerufen wird!
        client2 = new MongoClient(uri, options);
        clientPromise2 = client2.connect();
    }

    return clientPromise2;
}

export async function loadIdea(_id: ObjectId): Promise<ClientIdea | null> {
    const client = await getMongoClient();
    const col = client.db(DB_NAME).collection<IdeaDoc>("ideas");
    const ideaDoc = await col.findOne({
        _id,
    });
    if (ideaDoc == null) return null;
    const subNames = await col
        .find<WithId<{ name: string }>>(
            { _id: { $in: ideaDoc.subs } },
            {
                projection: {
                    name: 1,
                },
            },
        )
        .toArray();
    console.log("subNames", subNames);
    const idea = ideaToClient(ideaDoc, subNames);
    return idea;
}

export async function saveIdea(idea: ClientIdea): Promise<ObjectId> {
    const client = await getMongoClient();
    const col = client.db(DB_NAME).collection<IdeaDoc>("ideas");
    const res = await col.insertOne({
        locale: idea.locale,
        name: idea.name,
        desc: idea.desc,
        subs: [],
    });
    assert(res.acknowledged);
    return res.insertedId;
}
