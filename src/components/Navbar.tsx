'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MainNav() {
    const pathname = usePathname();
    const { data: session } = useSession();

    console.log("this is the data::::::::::: ", session)

    return (
        <header className="border-b">
            <div className="container flex h-16 items-center px-4">
                <Link href="/" className="font-bold">
                    ResumeTailor
                </Link>

                <nav className="ml-auto flex items-center space-x-4 lg:space-x-6">
                    <Link
                        href="/"
                        className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/" ? "text-primary" : "text-muted-foreground"
                            }`}
                    >
                        Home
                    </Link>

                    <Link
                        href="/features"
                        className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/features" ? "text-primary" : "text-muted-foreground"
                            }`}
                    >
                        Features
                    </Link>

                    <Link
                        href="/pricing"
                        className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/pricing" ? "text-primary" : "text-muted-foreground"
                            }`}
                    >
                        Pricing
                    </Link>

                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                                        <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {session.user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard">Dashboard</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                >
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild>
                            <Link href="/signin">Sign In</Link>
                        </Button>
                    )}
                </nav>
            </div>
        </header>
    );
}