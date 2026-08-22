"use client";
import Link from "next/link";
import { useState } from "react";
import {
    Alert,
    Button,
    ButtonGroup,
    Form,
    ListGroup,
    Modal,
} from "react-bootstrap";
import {
    ClientIdeaUpdateRes,
    Locale,
    type ClientIdea,
    type ClientIdeaUpdate,
} from "../../types";
import { AddButton } from "./AddButton";
import { EditCard } from "./EditCard";

export function IdeaComp({ idea }: { idea: ClientIdea }) {
    const [localIdea, setLocalIdea] = useState<ClientIdea>(idea);
    const [editLocale, setEditLocale] = useState(false);
    const [editName, setEditName] = useState(false);
    const [editDesc, setEditDesc] = useState(false);
    const [locale, setLocale] = useState("");
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [error, setError] = useState("");
    const [showSubModal, setShowSubModal] = useState(false);
    const [newSubId, setNewSubId] = useState("");
    const [newSubIdError, setNewSubIdError] = useState("");
    const [newSubPos, setNewSubPos] = useState("");
    const [newSubPosError, setNewSubPosError] = useState("");

    ////////////////////////////////////////////////////////////////////////////////////////////

    function onLocale() {
        setEditLocale(true);
        setLocale(localIdea.locale);
    }
    function onName() {
        setEditName(true);
        setName(localIdea.name);
    }

    function onDesc() {
        setEditDesc(true);
        setDesc(localIdea.desc);
    }

    async function updateLocale() {
        if (!Locale.guard(locale)) return;
        const req: ClientIdeaUpdate = {
            id: localIdea.id,
            locale, // TODO validate
        };
        const res = await fetch("/api/idea", {
            body: JSON.stringify(req),
            method: "PUT",
        });
        if (!res.ok) {
            setError(res.statusText);
            return;
        }
        setEditLocale(false);
        setLocalIdea((old) => ({
            ...old,
            locale,
        }));
    }

    async function updateName() {
        console.log("updateName");
        const req: ClientIdeaUpdate = {
            id: localIdea.id,
            name, // TODO validate
        };
        const res = await fetch("/api/idea", {
            body: JSON.stringify(req),
            method: "PUT",
        });
        if (!res.ok) {
            setError(res.statusText);
            return;
        }
        setEditName(false);
        setLocalIdea((old) => ({
            ...old,
            name,
        }));
    }

    async function updateDesc() {
        console.log("updateDesc");
        const req: ClientIdeaUpdate = {
            id: localIdea.id,
            desc, // TODO validate
        };
        const res = await fetch("/api/idea", {
            body: JSON.stringify(req),
            method: "PUT",
        });
        if (!res.ok) {
            setError(res.statusText);
            return;
        }
        setEditDesc(false);
        setLocalIdea((old) => ({
            ...old,
            desc,
        }));
    }

    async function updatePushSub() {
        // if (localIdea.subs.some((sub) => sub.id === newSubId)) {
        //     setNewSubIdError("Schon vorhanden");
        //     return;
        // }
        let newSubPosI;
        try {
            newSubPosI = parseInt(newSubPos);
        } catch {
            setNewSubPosError(`Keine nicht-negative ganze Zahl!`);
            return;
        }
        const req: ClientIdeaUpdate = {
            id: localIdea.id,
            pushSub: { id: newSubId, pos: newSubPosI },
        };
        const res = await fetch("/api/idea", {
            body: JSON.stringify(req),
            method: "PUT",
        });
        if (!res.ok) {
            setNewSubIdError(res.statusText);
            return;
        }
        const putRes = ClientIdeaUpdateRes.check(await res.json());
        const subName = putRes.pushSubName;
        setShowSubModal(false);
        setLocalIdea((old) => {
            const filtered = old.subs.filter((sub) => sub.id !== newSubId);
            return {
                ...old,
                subs: [
                    ...filtered.slice(0, newSubPosI),
                    { id: newSubId, name: subName ?? "Fehler" },
                    ...filtered.slice(newSubPosI),
                ],
            };
        });
    }

    async function updatePullSub(id: string) {
        const req: ClientIdeaUpdate = {
            id: localIdea.id,
            pullSub: id,
        };
        const res = await fetch("/api/idea", {
            body: JSON.stringify(req),
            method: "PUT",
        });
        if (!res.ok) {
            setError(res.statusText);
            return;
        }
        setLocalIdea((old) => ({
            ...old,
            subs: old.subs.filter((sub) => sub.id !== id),
        }));
    }

    function onAddSub() {
        setShowSubModal(true);
    }

    return (
        <>
            <AddButton />
            <Alert className="mb-3" variant="danger" show={!!error}>
                {error}
            </Alert>
            <p>
                <small>Id: {idea.id}</small>
            </p>
            {editLocale ? (
                <EditCard
                    onOk={updateLocale}
                    onCancel={() => setEditLocale(false)}
                >
                    <Form.Group controlId="edit-locale" className="mb-0">
                        <Form.Label>Gebietsschema</Form.Label>
                        <Form.Select
                            autoFocus
                            size="sm"
                            style={{
                                width: "9ex",
                            }}
                            value={locale}
                            className="mb-0 me-3"
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
                        </Form.Select>
                    </Form.Group>
                </EditCard>
                // <Card className="mb-3">
                //     <Card.Body>

                //         <ButtonGroup className="w-100">
                //             <Button variant="primary" onClick={updateName}>
                //                 OK
                //             </Button>
                //             <Button
                //                 variant="secondary"
                //                 onClick={() => setEditLocale(false)}
                //             >
                //                 Abbrechen
                //             </Button>
                //         </ButtonGroup>
                //     </Card.Body>
                // </Card>
            ) : (
                <p
                    onClick={onLocale}
                    onKeyDown={(e) => {
                        if (e.code === "Enter") {
                            onName();
                        }
                    }}
                    className="cursor-pointer"
                >
                    Gebietsschema: {localIdea.locale}
                </p>
            )}
            {editName ? (
                <EditCard onOk={updateName} onCancel={() => setEditName(false)}>
                    <Form.Group controlId="edit-name" className="mb-0">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </Form.Group>
                </EditCard>
            ) : (
                <h3
                    onClick={onName}
                    onKeyDown={(e) => {
                        if (e.code === "Enter") {
                            onName();
                        }
                    }}
                    className="cursor-pointer"
                >
                    {localIdea.name.trim() === "" ? (
                        <i>Kein Name</i>
                    ) : (
                        localIdea.name
                    )}
                </h3>
            )}

            {editDesc ? (
                <EditCard onOk={updateDesc} onCancel={() => setEditDesc(false)}>
                    <Form.Group controlId="edit-desc">
                        <Form.Label>Beschreibung</Form.Label>
                        <Form.Control
                            as="textarea"
                            type="text"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            autoFocus
                        />
                    </Form.Group>
                </EditCard>
            ) : (
                <p
                    className="cursor-pointer"
                    onClick={onDesc}
                    onKeyDown={(e) => {
                        if (e.code === "Enter") {
                            onDesc();
                        }
                    }}
                >
                    {localIdea.desc.trim() === "" ? (
                        <i>Keine Beschreibung</i>
                    ) : (
                        localIdea.desc
                    )}
                </p>
            )}
            <Button onClick={onAddSub} className="mb-3">
                + Neue Unteridee
            </Button>
            <ListGroup>
                {localIdea.subs.map((sub) => (
                    <ListGroup.Item key={sub.id} className="d-flex">
                        <Link href={`/idea/${encodeURIComponent(sub.id)}`}>
                            {sub.name}
                        </Link>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            className="ms-auto"
                            onClick={() => updatePullSub(sub.id)}
                        >
                            <i className="bi bi-x"></i>
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            {/* MODALS */}

            <Modal show={showSubModal} onHide={() => setShowSubModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Unteridee hinzufügen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="sub-id" className="mb-3">
                        <Form.Label>
                            Id der zu verlinkenden Unteridee
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={newSubId}
                            onChange={(e) => setNewSubId(e.target.value)}
                            isInvalid={newSubIdError !== ""}
                        />
                        <Form.Control.Feedback type="invalid">
                            {newSubIdError}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="sub-pos" className="mb-3">
                        <Form.Label>
                            Position der zu verlinkenden Unteridee
                        </Form.Label>
                        <Form.Control
                            type="number"
                            value={newSubPos}
                            onChange={(e) => setNewSubPos(e.target.value)}
                            isInvalid={newSubPosError !== ""}
                        />
                        <Form.Control.Feedback type="invalid">
                            {newSubPosError}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <ButtonGroup className="w-100">
                        <Button variant="primary" onClick={updatePushSub}>
                            OK
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setShowSubModal(false)}
                        >
                            Abbrechen
                        </Button>
                    </ButtonGroup>
                </Modal.Body>
            </Modal>
        </>
    );
}
