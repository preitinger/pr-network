import { ObjectId } from "mongodb";
import { IdeaComp } from "@/app/_lib/components/IdeaComp";
import { loadIdea } from "@/app/server";

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // was trying this sever rendering dingi, but... sorry next.js guys, it does not work because it does show old stuff.
    // So I will keep on using fetch, browser storage and client rendering. Working so much better!
    // But, here for the test...
    const { id } = await params;
    const idea = await loadIdea(ObjectId.createFromHexString(id));
    if (idea == null) return null;
    // const col = client.db(DB_NAME).collection<IdeaDoc>("ideas");
    // const ideaDoc = await col.findOne({
    //     _id: ObjectId.createFromHexString(id),
    // });
    // if (ideaDoc == null) return null;
    // const subNames = await col
    //     .find<WithId<{ name: string }>>(
    //         { _id: { $in: ideaDoc.subs } },
    //         {
    //             projection: {
    //                 name: 1,
    //             },
    //         },
    //     )
    //     .toArray();
    // console.log("subNames", subNames);
    // const idea = ideaToClient(ideaDoc, subNames);
    return <IdeaComp idea={idea} />;
}
