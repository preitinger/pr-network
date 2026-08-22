"use client";

import Link from "next/link";
import { AddButton } from "./_lib/components/AddButton";
import { useIdeasStore } from "./_lib/ideasStore";

export default function Home() {
    const ideas = useIdeasStore((s) => s.ideas);
    const hasHydrated = useIdeasStore((s) => s.hasHydrated);

    //////////////////////////////////////////////////////////////////////////////////

    if (!hasHydrated) return null;
    return (
        <>
            <h1>Ideas</h1>
            <AddButton />
            <ul>
                {ideas.map((idea) => (
                    <li key={idea.id}>
                        <Link href={`/idea/${encodeURIComponent(idea.id)}`}>
                            {idea.name}
                        </Link>
                        <span className="ms-2" style={{ fontSize: "x-small" }}>
                            {"{"}
                            {idea.id}
                            {"}"}
                        </span>
                    </li>
                ))}
            </ul>
        </>
    );
}
