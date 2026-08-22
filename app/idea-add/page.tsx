"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Alert,
    Button,
    Form,
    FormControl,
    FormGroup,
    FormLabel,
    FormSelect,
} from "react-bootstrap";
import { useIdeasStore } from "../_lib/ideasStore";
import { Locale, type ClientIdea } from "../types";

export default function Page() {
    const [locale, setLocale] = useState<Locale>("en");
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const actions = useIdeasStore((s) => s.actions);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async function onOk() {
        const idea: ClientIdea = {
            id: "",
            locale,
            name,
            desc,
            subs: [],
        };
        const res = await fetch("/api/idea", {
            method: "POST",
            body: JSON.stringify(idea),
        });
        if (!res.ok) {
            console.error(res.status, res.statusText);
            setError(res.statusText);
            return;
        }
        const id = await res.json();
        actions.add({ id, name });
        router.push(`/idea/${encodeURIComponent(id)}`);
    }

    return (
        <Form>
            <h1>Neue Idee erstellen</h1>
            <FormGroup controlId="locale" className="mb-3">
                <FormLabel>Gebietsschema</FormLabel>
                <FormSelect
                    size="sm"
                    style={{
                        width: "9ex",
                    }}
                    value={locale}
                    className="mb-3 me-3"
                    onChange={(e) => {
                        const lang = e.target.value;
                        if (Locale.guard(lang)) {
                            setLocale(lang);
                        }
                    }}
                >
                    {Locale.alternatives.map((alt) => (
                        <option key={alt.value}>{alt.value}</option>
                    ))}
                </FormSelect>
            </FormGroup>
            <FormGroup controlId="name" className="mb-3">
                <FormLabel>Name</FormLabel>
                <FormControl
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </FormGroup>
            <FormGroup controlId="desc" className="mb-3">
                <FormLabel>Beschreibung</FormLabel>
                <FormControl
                    as="textarea"
                    type="text"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />
            </FormGroup>
            <Alert show={!!error} variant="danger" className="mb-3">
                {error}
            </Alert>
            <Button type="button" onClick={onOk}>
                OK
            </Button>
        </Form>
    );
}
