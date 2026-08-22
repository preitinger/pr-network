import Link from "next/link";
import type { ReactNode } from "react";
import type { UrlObject } from "url";

export function ButtonLink({
    href,
    children,
}: {
    href: string | UrlObject;
    children: ReactNode;
}) {
    return (
        <Link href={href} className="btn btn-primary mb-3">
            {children}
        </Link>
    );
}
