import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { MainNav } from "@/components/Navbar";
import DashboardContent from "@/components/DashboardContent";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <MainNav />

            <main className="flex-1 py-6">
                <div className="container mx-auto px-4">
                    <h1 className="text-2xl font-bold mb-2">Welcome, {session.user?.name || "User"}!</h1>
                    <p className="text-gray-600 mb-6">Create your tailored resume in a few simple steps.</p>

                    <DashboardContent userId={session.user?.id} />
                </div>
            </main>

            <footer className="border-t py-4 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} Resume Tailor. All rights reserved.</p>
            </footer>
        </div>
    );
}