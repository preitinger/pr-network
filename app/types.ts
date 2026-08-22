import * as rt from "runtypes";

export const Locale = rt.Union(rt.Literal("en"), rt.Literal("de"));
export type Locale = rt.Static<typeof Locale>;

export const SubIdea = rt.Object({
    id: rt.String,
    name: rt.String,
});
export type SubIdea = rt.Static<typeof SubIdea>;

export const ClientIdea = rt.Object({
    id: rt.String,
    locale: Locale,
    name: rt.String,
    desc: rt.String,
    subs: rt.Array(SubIdea),
});
export type ClientIdea = rt.Static<typeof ClientIdea>;

export const ClientIdeaUpdate = rt.Object({
    id: rt.String,
    locale: Locale.undefinedable().optional(),
    name: rt.String.undefinedable().optional(),
    desc: rt.String.undefinedable().optional(),
    pushSub: rt
        .Object({
            id: rt.String,
            pos: rt.Number,
        })
        .undefinedable()
        .optional(),
    pullSub: rt.String.undefinedable().optional(),
});
export type ClientIdeaUpdate = rt.Static<typeof ClientIdeaUpdate>;

export const ClientIdeaUpdateRes = rt.Object({
    pushSubName: rt.String.optional(),
});
export type ClientIdeaUpdateRes = rt.Static<typeof ClientIdeaUpdateRes>;

export const IdeaInLocalStorage = rt.Object({
    id: rt.String,
    name: rt.String,
});
export type IdeaInLocalStorage = rt.Static<typeof IdeaInLocalStorage>;
