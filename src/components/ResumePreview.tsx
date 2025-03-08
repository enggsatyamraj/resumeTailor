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
                throw new Error('Failed to generate tailored resume');
            }

            const data = await response.json();
            setTailoredResume(data.tailoredResume);

        } catch (error) {
            console.error('Error generating resume:', error);
            setError('Failed to generate tailored resume. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Download the tailored resume
    const downloadResume = async () => {
        if (!tailoredResume) {
            setError('No tailored resume to download. Please generate one first.');
            return;
        }

        setIsDownloading(true);

        try {
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
                throw new Error('Failed to download resume');
            }

            // Get the blob from the response
            const blob = await response.blob();

            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a link element and click it to trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = `tailored_${resumeData.fileName || 'resume.pdf'}`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error downloading resume:', error);
            setError('Failed to download resume. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Card className="shadow-none border-0">
            <CardHeader className="pb-3">
                <CardTitle>Your Tailored Resume</CardTitle>
                <CardDescription>
                    Review and download your tailored resume
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
                                    We&apos;re adding your selected skills and optimizing your resume for the job description.
                                </p>
                            </div>
                        ) : tailoredResume ? (
                            <div className="border rounded-md overflow-hidden bg-white">
                                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                    <div className="flex items-center">
                                        <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
                                        <span className="font-medium">Tailored Resume</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={generateResume} className="flex items-center gap-1">
                                        <RefreshCwIcon className="h-3.5 w-3.5" />
                                        Regenerate
                                    </Button>
                                </div>
                                <ScrollArea className="h-[400px] p-6">
                                    <div className="max-w-3xl mx-auto">
                                        {/* This would ideally be a rich preview with formatting */}
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
            <CardFooter>
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
                            Download Resume
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}