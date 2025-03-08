'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BriefcaseIcon, AlertTriangleIcon, LoaderIcon } from "lucide-react";

interface JobDescriptionInputProps {
    onSubmit: (jobDescription: string, skills: { technical: string[], soft: string[] }) => void;
    resumeContent?: string;
}

export default function JobDescriptionInput({ onSubmit, resumeContent }: JobDescriptionInputProps) {
    const [jobDescription, setJobDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isExtractingSkills, setIsExtractingSkills] = useState(false);

    const handleSubmit = async () => {
        if (!jobDescription.trim()) {
            setError('Please enter a job description');
            return;
        }

        // Clear any previous errors
        setError(null);
        setIsProcessing(true);
        setIsExtractingSkills(true);

        try {
            // API call to process the job description and extract skills
            const response = await fetch('/api/extract-skills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobDescription,
                    resumeContent // Pass the resume content if available
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to process job description');
            }

            const data = await response.json();
            console.log("Extracted skills:", data);

            // Validate response data to ensure it has the expected structure
            if (data && data.skills) {
                const technicalSkills = Array.isArray(data.skills.technical) ? data.skills.technical : [];
                const softSkills = Array.isArray(data.skills.soft) ? data.skills.soft : [];

                console.log(`Extracted ${technicalSkills.length} technical skills and ${softSkills.length} soft skills`);

                // Call the onSubmit callback with the job description and extracted skills
                onSubmit(jobDescription, {
                    technical: technicalSkills,
                    soft: softSkills
                });
            } else {
                // If data format is unexpected, provide default skills
                console.warn("Unexpected data format from API, using fallback skills");
                onSubmit(jobDescription, {
                    technical: ["JavaScript", "React", "TypeScript", "Next.js"],
                    soft: ["Communication", "Teamwork", "Problem Solving"]
                });
            }

        } catch (error) {
            console.error('Error processing job description:', error);
            setError('Failed to extract skills. Please try again.');
        } finally {
            setIsProcessing(false);
            setIsExtractingSkills(false);
        }
    };

    return (
        <Card className="shadow-none border-0">
            <CardHeader className="pb-3">
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                    Paste the job description or company requirements to extract relevant skills
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangleIcon className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                        <BriefcaseIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                        <p className="text-sm text-gray-600">
                            Enter the full job description to help our AI identify key skills and requirements to highlight in your tailored resume.
                        </p>
                    </div>

                    <Textarea
                        placeholder="Paste job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="min-h-[200px] resize-y"
                    />

                    <p className="text-xs text-gray-500">
                        For best results, include the complete job listing with all requirements and qualifications.
                    </p>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleSubmit}
                    disabled={!jobDescription.trim() || isProcessing}
                    className="w-full"
                >
                    {isExtractingSkills ? (
                        <>
                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                            Extracting Skills...
                        </>
                    ) : (
                        'Analyze Job Description'
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}