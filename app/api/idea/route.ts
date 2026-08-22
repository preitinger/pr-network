import { ut } from "@/app/_lib/serverUtils";
import { isObjectEmpty } from "@/app/_lib/utils";
import type { IdeaDoc } from "@/app/dbTypes";
import { DB_NAME, getMongoClient, saveIdea } from "@/app/server";
import {
    ClientIdea,
    ClientIdeaUpdate,
    type ClientIdeaUpdateRes,
} from "@/app/types";
import assert from "assert";
import { ObjectId, type Document } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    console.log("req.url", req.url);
    console.log("req.nextUrl", req.nextUrl);

    const params = req.nextUrl.searchParams;

    if (params.has("id")) {
        const client = await getMongoClient();
        const id = params.get("id");
        assert(id != null);

        try {
            const idea = await client
                .db(DB_NAME)
                .collection<IdeaDoc>("ideas")
                .findOne({ _id: ObjectId.createFromHexString(id) });
            if (idea != null) {
                return NextResponse.json(idea);
            }
        } catch (reason) {
            console.error(reason);
        }
    }
    const idea: ClientIdea = {
        id: new ObjectId().toHexString(),
        locale: "de",
        name: "Idee",
        desc: "Eine Idee ist die Basis von allem.",
        subs: [
            {
                id: new ObjectId().toHexString(),
                name: "Noch ne Idee",
            },
            {
                id: new ObjectId().toHexString(),
                name: "Und sogar noch ne Idee",
            },
        ],
    };
    return NextResponse.json(idea);
}

export async function POST(req: NextRequest) {
    const idea = await req.json();
    if (!ClientIdea.guard(idea)) {
        return NextResponse.error();
    }
    return NextResponse.json(await saveIdea(idea));
}

const r400 = (body?: BodyInit | null | undefined) =>
    new Response(body, { status: 400 });

const r404 = (body?: BodyInit | null | undefined) =>
    new Response(body, { status: 404 });

export async function PUT(req: NextRequest) {
    const json = await req.json();
    if (!ClientIdeaUpdate.guard(json)) {
        return r400("Invalid update");
    }
    const id = json.id;
    const client = await getMongoClient();
    const col = client.db(DB_NAME).collection<IdeaDoc>("ideas");
    const u = ut<IdeaDoc>();
    let _id;
    const resJson: ClientIdeaUpdateRes = {};
    try {
        _id = ObjectId.createFromHexString(id);
    } catch {
        return r400("Invalid id");
    }
    const x = u.partial();
    const pipeline: Document[] = [];
    if (json.locale != null) {
        x.locale = json.locale;
    }
    if (json.name != null) {
        x.name = json.name;
    }
    if (json.desc != null) {
        x.desc = json.desc;
    }
    // const u1 = u.updateFilter();
    // const u2 = u.updateFilter();

    // throw new Error("Bug to fix: Not use update filter as update pipeline stage!!");

    if (!isObjectEmpty(x)) {
        pipeline.push({
            $set: x,
        });
        // u1.$set = x;
    }
    let subId: ObjectId | undefined;
    if (json.pushSub != null) {
        let subPos;
        try {
            subId = ObjectId.createFromHexString(json.pushSub.id);
            subPos = json.pushSub.pos;
        } catch {
            return r400("Invalid sub id");
        }
        const subDoc = await col.findOne(
            { _id: subId },
            { projection: { name: 1 } },
        );
        if (subDoc != null) {
            resJson.pushSubName = subDoc.name;
        } else {
            return r400("Invalid sub id");
        }
        pipeline.push({
            $set: {
                subs: {
                    $let: {
                        vars: {
                            filtered: {
                                $filter: {
                                    input: "$subs",
                                    cond: {
                                        $ne: ["$$this", subId],
                                    },
                                },
                            },
                        },
                        in: {
                            $concatArrays: [
                                {
                                    $slice: ["$$filtered", subPos],
                                },
                                [subId],
                                {
                                    $slice: [
                                        "$$filtered",
                                        subPos,
                                        {$max:[{ $size: "$$filtered" }, 1]}, // Hoffentlich geht das, wenn n > $size - subPos ist
                                    ],
                                },
                            ],
                        },
                    },
                },
            },
        });
    }
    if (json.pullSub != null) {
        try {
            subId = ObjectId.createFromHexString(json.pullSub);
        } catch {
            return r400("Invalid sub id");
        }
        pipeline.push({
            $set: {
                subs: {
                    $filter: {
                        input: "$subs",
                        cond: {
                            $ne: ["$$this", subId],
                        },
                    },
                },
            },
        });
    }

    console.log("pipeline", JSON.stringify(pipeline, undefined, 2));

    const res = await col.updateOne({ _id }, pipeline);
    assert(res.acknowledged);
    if (res.matchedCount === 0) {
        return r404();
    }

    if (json.pushSub != null && subId != null) {
    }
    console.log("successful", resJson);
    return NextResponse.json(resJson);
}
