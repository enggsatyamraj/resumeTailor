'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileIcon, UploadCloudIcon, AlertTriangleIcon, XIcon, LoaderIcon } from "lucide-react";

interface ResumeUploaderProps {
    onUploadComplete: (data: { fileId: string; fileName: string; content: string }) => void;
    userId?: string;
}

export default function ResumeUploader({ onUploadComplete }: ResumeUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];

        // Validate file type
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('Please upload a PDF or Word document (.doc, .docx) or text file (.txt)');
            return;
        }

        // Validate file size (5MB max)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setFile(selectedFile);
        setError(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
        }
    });

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        // Create a FormData object
        const formData = new FormData();
        formData.append('resume', file);

        try {
            // Send the file to the API for text extraction
            const response = await fetch('/api/resume/upload', {
                method: 'POST',
                body: formData,
            });

            console.log("Response::::::", response);

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            // Handle successful upload
            const data = await response.json();
            console.log('Upload successful:', data);

            // Call the onUploadComplete callback with the extracted data
            if (data.success && data.content) {
                onUploadComplete({
                    fileId: data.file.id,
                    fileName: data.file.name,
                    content: data.content
                });
            } else {
                throw new Error('Failed to extract content from resume');
            }

        } catch (error) {
            console.error('Error uploading file:', error);
            setError('Failed to upload resume. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = () => {
        setFile(null);
    };

    return (
        <Card className="shadow-none border-0">
            <CardHeader className="pb-3">
                <CardTitle>Upload Your Resume</CardTitle>
                <CardDescription>
                    Upload your existing resume in PDF, Word, or Text format
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangleIcon className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!file ? (
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
                            }`}
                    >
                        <input {...getInputProps()} />
                        <UploadCloudIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">
                            {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
                        </p>
                        <p className="text-xs text-gray-500">
                            Supports PDF, DOC, DOCX, and TXT (max 5MB)
                        </p>
                    </div>
                ) : (
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FileIcon className="h-8 w-8 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium truncate max-w-[200px]">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={removeFile}
                                aria-label="Remove file"
                            >
                                <XIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="w-full"
                >
                    {isUploading ? (
                        <>
                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Upload Resume'
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}