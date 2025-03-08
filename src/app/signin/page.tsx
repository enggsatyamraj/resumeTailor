'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "next-auth/react";
import { Github } from "lucide-react";
import Image from "next/image";

export default function SignIn() {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Card className="w-[350px]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
                    <CardDescription>
                        Choose your preferred sign in method
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Button
                        variant="outline"
                        onClick={() => signIn('github', { callbackUrl: '/' })}
                        className="flex items-center gap-2"
                    >
                        <Github className="h-4 w-4" />
                        Sign in with GitHub
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => signIn('google', { callbackUrl: '/' })}
                        className="flex items-center gap-2"
                    >
                        <div className="h-4 w-4 relative">
                            {/* <Image
                                src="/google-logo.svg"
                                alt="Google"
                                fill
                            /> */}

                        </div>
                        Sign in with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* You can add email sign-in here if needed */}
                </CardContent>
                <CardFooter className="flex flex-col">
                    <p className="mt-2 text-xs text-center text-gray-700">
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}