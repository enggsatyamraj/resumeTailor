'use client';

import { useState } from 'react';
import ResumeUploader from '@/components/ResumeUploader';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowRightIcon,
    UploadCloudIcon,
    BriefcaseIcon,
    SparklesIcon
} from 'lucide-react';

export default function ResumeWorkflow() {
    const [activeStep, setActiveStep] = useState('upload-resume');
    const [resumeUploaded, setResumeUploaded] = useState(false);
    const [jobDescriptionEntered, setJobDescriptionEntered] = useState(false);

    // Placeholder callback for when resume upload is complete
    const handleResumeUploadComplete = () => {
        setResumeUploaded(true);
        // Automatically move to next step
        setActiveStep('job-description');
    };

    // Placeholder callback for when job description is processed
    const handleJobDescriptionComplete = () => {
        setJobDescriptionEntered(true);
        // In a real app, you'd move to resume generation step
        setActiveStep('generate-resume');
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-center mb-8">
                Create Your Tailored Resume
            </h1>

            <div className="flex justify-center mb-8">
                <div className="flex items-center max-w-2xl w-full">
                    <div className={`flex flex-col items-center ${activeStep === 'upload-resume' ? 'text-primary' : 'text-gray-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${activeStep === 'upload-resume' ? 'border-primary bg-primary/10' : resumeUploaded ? 'border-green-500 bg-green-100 text-green-500' : 'border-gray-300'}`}>
                            {resumeUploaded ? '✓' : <UploadCloudIcon className="h-5 w-5" />}
                        </div>
                        <span className="text-xs mt-1">Upload</span>
                    </div>

                    <div className={`flex-1 h-0.5 ${resumeUploaded ? 'bg-green-500' : 'bg-gray-200'}`}></div>

                    <div className={`flex flex-col items-center ${activeStep === 'job-description' ? 'text-primary' : 'text-gray-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${activeStep === 'job-description' ? 'border-primary bg-primary/10' : jobDescriptionEntered ? 'border-green-500 bg-green-100 text-green-500' : 'border-gray-300'}`}>
                            {jobDescriptionEntered ? '✓' : <BriefcaseIcon className="h-5 w-5" />}
                        </div>
                        <span className="text-xs mt-1">Job Info</span>
                    </div>

                    <div className={`flex-1 h-0.5 ${jobDescriptionEntered ? 'bg-green-500' : 'bg-gray-200'}`}></div>

                    <div className={`flex flex-col items-center ${activeStep === 'generate-resume' ? 'text-primary' : 'text-gray-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${activeStep === 'generate-resume' ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
                            <SparklesIcon className="h-5 w-5" />
                        </div>
                        <span className="text-xs mt-1">Generate</span>
                    </div>
                </div>
            </div>

            <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full max-w-3xl mx-auto">
                <TabsList className="hidden">
                    <TabsTrigger value="upload-resume">Upload Resume</TabsTrigger>
                    <TabsTrigger value="job-description">Job Description</TabsTrigger>
                    <TabsTrigger value="generate-resume">Generate Resume</TabsTrigger>
                </TabsList>

                <TabsContent value="upload-resume" className="mt-0">
                    <ResumeUploader />

                    {/* This would be wired up to real events in a complete app */}
                    <div className="flex justify-center mt-6">
                        <Button
                            onClick={handleResumeUploadComplete}
                            className="flex items-center gap-2"
                        >
                            Continue <ArrowRightIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="job-description" className="mt-0">
                    <JobDescriptionInput />

                    {/* This would be wired up to real events in a complete app */}
                    <div className="flex justify-center mt-6">
                        <Button
                            onClick={handleJobDescriptionComplete}
                            className="flex items-center gap-2"
                        >
                            Generate Tailored Resume <ArrowRightIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="generate-resume" className="mt-0">
                    <div className="bg-white p-8 rounded-lg shadow-sm border text-center max-w-md mx-auto">
                        <SparklesIcon className="h-16 w-16 text-primary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Generating Your Resume</h2>
                        <p className="text-gray-600 mb-6">
                            We're analyzing your resume and the job description to create a perfectly tailored version.
                        </p>

                        {/* This would be replaced with a real implementation */}
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
                            <div className="bg-primary h-2.5 rounded-full w-3/4"></div>
                        </div>

                        <p className="text-sm text-gray-500">
                            This will just take a moment...
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}