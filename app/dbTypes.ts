import type { ObjectId, WithId } from "mongodb";
import type { ClientIdea, Locale } from "./types";

export interface IdeaDoc {
    locale: Locale;
    name: string;
    /**
     * md or just string?
     */
    desc: string;
    subs: ObjectId[];
}

export function ideaToClient(
    doc: WithId<IdeaDoc>,
    subNames: WithId<{ name: string }>[],
): ClientIdea {
    const nameOf = (id: ObjectId) => {
        return subNames.find((sn) => sn._id.equals(id))?.name;
    };
    return {
        id: doc._id.toHexString(),
        locale: doc.locale,
        name: doc.name,
        desc: doc.desc,
        subs: doc.subs.map((sub) => ({
            id: sub.toHexString(),
            name: nameOf(sub) ?? "Error",
        })) /* subNames.map((sub) => {
            const id = sub._id.toHexString();
            const name = sub.name;
            return { id, name };
        }), */,
    };
}
