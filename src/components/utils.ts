import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

// Use this in server components to get the session
export async function getSession() {
    return await getServerSession(authOptions);
}

// Protect routes that require authentication
export async function requireAuth() {
    const session = await getSession();

    if (!session) {
        redirect("/signin");
    }

    return session;
}

// Get current user data
export async function getCurrentUser() {
    const session = await getSession();
    return session?.user;
}