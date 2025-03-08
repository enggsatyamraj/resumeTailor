'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    FileIcon,
    DownloadIcon,
    RefreshCwIcon,
    AlertTriangleIcon,
    LoaderIcon
} from "lucide-react";

interface ResumePreviewProps {
    resumeData: {
        fileId?: string;
        fileName?: string;
        content?: string;
    };
    selectedSkills: {
        technical: { name: string; selected: boolean }[];
        soft: { name: string; selected: boolean }[];
        custom: string[];
    };
    jobDescription: string;
}

export default function ResumePreview({ resumeData, selectedSkills, jobDescription }: ResumePreviewProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tailoredResume, setTailoredResume] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'preview' | 'comparison'>('preview');

    // Generate tailored resume on component mount
    useEffect(() => {
        generateResume();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Extract the selected skills
    const getSelectedSkills = () => {
        const technical = selectedSkills.technical
            .filter(skill => skill.selected)
            .map(skill => skill.name);

        const soft = selectedSkills.soft
            .filter(skill => skill.selected)
            .map(skill => skill.name);

        return {
            technical,
            soft,
            custom: selectedSkills.custom
        };
    };

    // Generate the tailored resume
    const generateResume = async () => {
        if (!resumeData.content) {
            setError('No resume content found. Please upload your resume first.');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const skills = getSelectedSkills();

            console.log("Generating resume with skills:", skills);
            console.log("Job description:", jobDescription);
            console.log("Original resume content length:", resumeData.content.length);

            const response = await fetch('/api/generate-resume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resumeContent: resumeData.content,
                    skills,
                    jobDescription
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API error response:", errorText);
                throw new Error(`Failed to generate tailored resume: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Resume generation successful, received data:", data);

            if (!data.tailoredResume) {
                throw new Error('No tailored resume content received from API');
            }

            setTailoredResume(data.tailoredResume);

        } catch (error) {
            console.error('Error generating resume:', error);
            setError(`Failed to generate tailored resume: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // Download the tailored resume as PDF
    const downloadResume = async () => {
        if (!tailoredResume) {
            setError('No tailored resume to download. Please generate one first.');
            return;
        }

        setIsDownloading(true);

        try {
            console.log("Initiating ATS-friendly PDF resume download...");

            const response = await fetch('/api/download-resume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: tailoredResume,
                    originalFileName: resumeData.fileName
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Download API error:", errorText);
                throw new Error(`Failed to download resume: ${response.status} ${response.statusText}`);
            }

            console.log("Download response received successfully");

            // Get the blob from the response
            const blob = await response.blob();
            console.log("Response blob:", blob.type, blob.size);

            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a link element and click it to trigger download
            const a = document.createElement('a');
            a.href = url;

            // Extract original filename without extension if available
            let baseFileName = 'resume';
            if (resumeData.fileName) {
                // Remove file extension if present
                baseFileName = resumeData.fileName.replace(/\.[^/.]+$/, "");
            }

            // Always use PDF extension
            a.download = `tailored_${baseFileName}.pdf`;
            document.body.appendChild(a);

            console.log("Triggering download...");
            a.click();

            // Clean up
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                console.log("Download cleanup complete");
            }, 100);

        } catch (error) {
            console.error('Error downloading resume:', error);
            setError(`Failed to download resume: ${error.message}`);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Card className="shadow-none border-0">
            <CardHeader className="pb-3">
                <CardTitle>Your Tailored Resume</CardTitle>
                <CardDescription>
                    Review and download your ATS-optimized resume
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangleIcon className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'preview' | 'comparison')}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="comparison">Compare Changes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview">
                        {isGenerating ? (
                            <div className="py-12 text-center">
                                <LoaderIcon className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
                                <p>Generating your tailored resume...</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    We&apos;re adding your selected skills and optimizing your resume for ATS systems.
                                </p>
                            </div>
                        ) : tailoredResume ? (
                            <div className="border rounded-md overflow-hidden bg-white">
                                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                    <div className="flex items-center">
                                        <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
                                        <span className="font-medium">ATS-Optimized Resume</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={generateResume} className="flex items-center gap-1">
                                        <RefreshCwIcon className="h-3.5 w-3.5" />
                                        Regenerate
                                    </Button>
                                </div>
                                <ScrollArea className="h-[400px] p-6">
                                    <div className="max-w-3xl mx-auto">
                                        <pre className="whitespace-pre-wrap font-sans text-sm">
                                            {tailoredResume}
                                        </pre>
                                    </div>
                                </ScrollArea>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <p>No preview available. Please generate a resume first.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="comparison">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border rounded-md overflow-hidden bg-white">
                                <div className="p-3 bg-gray-50 border-b">
                                    <span className="font-medium">Original Resume</span>
                                </div>
                                <ScrollArea className="h-[400px] p-4">
                                    <pre className="whitespace-pre-wrap font-sans text-sm">
                                        {resumeData.content || 'Original resume content not available'}
                                    </pre>
                                </ScrollArea>
                            </div>

                            <div className="border rounded-md overflow-hidden bg-white">
                                <div className="p-3 bg-gray-50 border-b">
                                    <span className="font-medium">Tailored Resume</span>
                                </div>
                                <ScrollArea className="h-[400px] p-4">
                                    <pre className="whitespace-pre-wrap font-sans text-sm">
                                        {tailoredResume || 'Tailored resume not generated yet'}
                                    </pre>
                                </ScrollArea>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button
                    onClick={downloadResume}
                    disabled={!tailoredResume || isDownloading}
                    className="w-full flex items-center justify-center gap-2"
                >
                    {isDownloading ? (
                        <>
                            <LoaderIcon className="h-4 w-4 animate-spin" />
                            Preparing Download...
                        </>
                    ) : (
                        <>
                            <DownloadIcon className="h-4 w-4" />
                            Download ATS-Optimized PDF
                        </>
                    )}
                </Button>
                <p className="text-xs text-center text-gray-500">
                    Your resume is optimized for ATS systems with a 95%+ compatibility score
                </p>
            </CardFooter>
        </Card>
    );
}