import type { ReactNode } from "react";
import { Button, ButtonGroup, Card } from "react-bootstrap";

export function EditCard({
    onOk,
    onCancel,
    children,
}: {
    onOk(): void;
    onCancel(): void;
    children: ReactNode;
}) {
    return (
        <Card className="mb-3">
            <Card.Body onKeyDown={(e) => {
                if (e.code === "Escape") {
                    onCancel();
                }
            }}>
                {children}
                <ButtonGroup className="w-100">
                    <Button variant="primary" onClick={onOk}>
                        OK
                    </Button>
                    <Button variant="secondary" onClick={onCancel}>
                        Abbrechen
                    </Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    );
}
