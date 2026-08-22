"use client"

import Link from "next/link"
import { Navbar } from "react-bootstrap"

export function MyNavbar() {
    return <Navbar>
        <Link href="/" className="navbar-brand">pr-network</Link>
    </Navbar>
}