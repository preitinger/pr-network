import { create } from "zustand";
import { IdeaInLocalStorage } from "../types";
import * as rt from "runtypes";
import { produce } from "immer";
import { persist, createJSONStorage } from "zustand/middleware";

export const IDEAS_KEY = "ideas";

const IdeasStoreState = rt.Object({
    ideas: rt.Array(IdeaInLocalStorage),
});

export type IdeasStoreState = rt.Static<typeof IdeasStoreState>;

export interface IdeasStoreActions {
    setHasHydrated: (state: boolean) => void;
    setIdeas(idea: IdeaInLocalStorage[]): void;
    add(ideaInLocalStorage: IdeaInLocalStorage): void;
}

export interface IdeasStore extends IdeasStoreState {
    actions: IdeasStoreActions;
    hasHydrated: boolean;
}

export const useIdeasStore = create<IdeasStore>()(
    persist(
        (set) => {
            const mySet = (mutator: (draft: IdeasStore) => void) => {
                set(produce<IdeasStore>(mutator));
            };

            return {
                ideas: [],
                actions: {
                    setHasHydrated(hydrated) {
                        mySet((draft) => {
                            draft.hasHydrated = hydrated;
                        });
                    },
                    setIdeas(ideas) {
                        set({ ideas });
                    },
                    add(idea: IdeaInLocalStorage) {
                        mySet((draft) => {
                            draft.ideas.push(idea);
                        });
                    },
                },
                hasHydrated: false,
            };
        },
        {
            name: IDEAS_KEY,
            storage: createJSONStorage(() => window.localStorage),
            partialize: (s) => {
                const persistedKeys = new Set(
                    Object.keys(IdeasStoreState.fields),
                );

                // 2. Wir filtern die Einträge des Gesamt-States komplett ohne Typ-Konflikte
                const filteredEntries = Object.entries(s).filter(([key]) =>
                    persistedKeys.has(key),
                );

                // 3. Wir bauen das Objekt wieder zusammen.
                // TypeScript akzeptiert das, weil fromEntries ein generisches Objekt liefert!
                return Object.fromEntries(filteredEntries);
            },
            onRehydrateStorage: (state) => {
                console.log("state before rehydration", state);
                return (persistedState, error) => {
                    if (error) {
                        console.log("state at error", state);
                        console.error(
                            "Fehler bei der Hydration des Shopping-Stores:",
                            error,
                        );
                        return;
                    }

                    // Wenn Daten im Storage gefunden wurden, jage sie durch den Runtype-Guard
                    if (persistedState) {
                        if (!IdeasStoreState.guard(persistedState)) {
                            console.warn(
                                "Ungültiger Inhalt im localStorage entdeckt! Überschreibe localStorage.shoppingList-zustand mit Default-Wert.",
                            );
                            state.actions.setIdeas([]);
                            // // Wenn die Validierung fehlschlägt, überschreiben wir den Store mit den Defaults
                            // return createDefaultState();
                        }
                    }
                    state.actions.setHasHydrated(true);
                };
            },
        },
    ),
);

// const listeners: (() => void)[] = [];

// export function subscribe(onStoreChange: () => void) {
//     listeners.push(onStoreChange);
//     return () => {
//         const i = listeners.indexOf(onStoreChange);
//         if (i !== -1) {
//             listeners.splice(i, 1);
//         }
//     };
// }
// let snapshot: IdeaInLocalStorage[];

// export function getSnapshot() {
//     if (snapshot == null) snapshot = ideasFromLocalStorage();
//     return snapshot;
// }

// const serverSnapshot: IdeaInLocalStorage[] = [];

// export function getServerSnapshot() {
//     return serverSnapshot;
// }

// export function ideaToLocalStorage(id: string, name: string) {
//     const sIdeas = localStorage.getItem(IDEAS_KEY);
//     const ideas =
//         sIdeas == null
//             ? []
//             : rt.Array(IdeaInLocalStorage).check(JSON.parse(sIdeas));
//     ideas.push({ id, name });
//     localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
//     dispatch();
// }

// function dispatch() {
//     for (const l of listeners) {
//         l();
//     }
// }

// function ideasFromLocalStorage() {
//     if (typeof window !== "object") return [];
//     const sIdeas = localStorage.getItem(IDEAS_KEY);
//     if (sIdeas == null) return [];
//     return rt.Array(IdeaInLocalStorage).check(JSON.parse(sIdeas));
// }
