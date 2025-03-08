'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeUploader from '@/components/ResumeUploader';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import {
    CheckCircle2Icon,
} from 'lucide-react';
import SkillsSelection from './SkillSelection';
import ResumePreview from './ResumePreview';

// Define the possible stages in the resume tailoring process
type ProcessStage = 'upload-resume' | 'job-description' | 'skills-selection' | 'preview';

interface DashboardContentProps {
    userId: string | undefined;
}

export default function DashboardContent({ userId }: DashboardContentProps) {
    // Current stage in the process
    const [currentStage, setCurrentStage] = useState<ProcessStage>('upload-resume');

    // Store data across stages
    const [resumeData, setResumeData] = useState<{
        fileId?: string;
        fileName?: string;
        content?: string;
    }>({});

    const [jobDescription, setJobDescription] = useState<string>('');

    const [extractedSkills, setExtractedSkills] = useState<{
        technical: { name: string; selected: boolean }[];
        soft: { name: string; selected: boolean }[];
        custom: string[];
    }>({
        technical: [],
        soft: [],
        custom: []
    });

    // Track completion status of each stage
    const [stageComplete, setStageComplete] = useState({
        'upload-resume': false,
        'job-description': false,
        'skills-selection': false,
        'preview': false
    });

    // Handle resume upload completion
    const handleResumeUploaded = (data: { fileId: string; fileName: string; content: string }) => {
        setResumeData({
            fileId: data.fileId,
            fileName: data.fileName,
            content: data.content
        });
        setStageComplete({ ...stageComplete, 'upload-resume': true });
        setCurrentStage('job-description');
    };

    // Handle job description submission
    const handleJobDescriptionSubmitted = (description: string, skills: { technical: any[], soft: any[] }) => {
        setJobDescription(description);

        // Transform the skills into the format we need with selection state
        const technicalSkills = skills.technical.map(skill => ({ name: skill, selected: true }));
        const softSkills = skills.soft.map(skill => ({ name: skill, selected: true }));

        setExtractedSkills({
            technical: technicalSkills,
            soft: softSkills,
            custom: []
        });

        setStageComplete({ ...stageComplete, 'job-description': true });
        setCurrentStage('skills-selection');
    };

    // Handle skills selection completion
    const handleSkillsSelected = (selectedSkills: {
        technical: { name: string; selected: boolean }[];
        soft: { name: string; selected: boolean }[];
        custom: string[];
    }) => {
        setExtractedSkills(selectedSkills);
        setStageComplete({ ...stageComplete, 'skills-selection': true });
        setCurrentStage('preview');
    };

    return (
        <div>
            {/* Progress Tracker */}
            <div className="mb-8">
                <div className="flex justify-between items-center max-w-3xl mx-auto">
                    {/* Resume Upload Step */}
                    <div className="flex flex-col items-center">
                        <div className={`rounded-full w-10 h-10 flex items-center justify-center border-2 ${stageComplete['upload-resume']
                            ? 'bg-green-100 border-green-500'
                            : currentStage === 'upload-resume'
                                ? 'bg-blue-100 border-blue-500'
                                : 'border-gray-300'
                            }`}>
                            {stageComplete['upload-resume'] ? (
                                <CheckCircle2Icon className="h-6 w-6 text-green-500" />
                            ) : (
                                <span className="font-medium text-sm">1</span>
                            )}
                        </div>
                        <span className="text-xs mt-1">Upload Resume</span>
                    </div>

                    <div className={`h-0.5 flex-1 mx-2 ${stageComplete['upload-resume'] ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>

                    {/* Job Description Step */}
                    <div className="flex flex-col items-center">
                        <div className={`rounded-full w-10 h-10 flex items-center justify-center border-2 ${stageComplete['job-description']
                            ? 'bg-green-100 border-green-500'
                            : currentStage === 'job-description'
                                ? 'bg-blue-100 border-blue-500'
                                : 'border-gray-300'
                            }`}>
                            {stageComplete['job-description'] ? (
                                <CheckCircle2Icon className="h-6 w-6 text-green-500" />
                            ) : (
                                <span className="font-medium text-sm">2</span>
                            )}
                        </div>
                        <span className="text-xs mt-1">Job Description</span>
                    </div>

                    <div className={`h-0.5 flex-1 mx-2 ${stageComplete['job-description'] ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>

                    {/* Skills Selection Step */}
                    <div className="flex flex-col items-center">
                        <div className={`rounded-full w-10 h-10 flex items-center justify-center border-2 ${stageComplete['skills-selection']
                            ? 'bg-green-100 border-green-500'
                            : currentStage === 'skills-selection'
                                ? 'bg-blue-100 border-blue-500'
                                : 'border-gray-300'
                            }`}>
                            {stageComplete['skills-selection'] ? (
                                <CheckCircle2Icon className="h-6 w-6 text-green-500" />
                            ) : (
                                <span className="font-medium text-sm">3</span>
                            )}
                        </div>
                        <span className="text-xs mt-1">Select Skills</span>
                    </div>

                    <div className={`h-0.5 flex-1 mx-2 ${stageComplete['skills-selection'] ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>

                    {/* Preview Step */}
                    <div className="flex flex-col items-center">
                        <div className={`rounded-full w-10 h-10 flex items-center justify-center border-2 ${stageComplete['preview']
                            ? 'bg-green-100 border-green-500'
                            : currentStage === 'preview'
                                ? 'bg-blue-100 border-blue-500'
                                : 'border-gray-300'
                            }`}>
                            {stageComplete['preview'] ? (
                                <CheckCircle2Icon className="h-6 w-6 text-green-500" />
                            ) : (
                                <span className="font-medium text-sm">4</span>
                            )}
                        </div>
                        <span className="text-xs mt-1">Preview & Download</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <Card className="mt-6">
                <Tabs value={currentStage} className="w-full">
                    <TabsList className="hidden">
                        <TabsTrigger value="upload-resume">Upload Resume</TabsTrigger>
                        <TabsTrigger value="job-description">Job Description</TabsTrigger>
                        <TabsTrigger value="skills-selection">Select Skills</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload-resume" className="m-0">
                        <ResumeUploader onUploadComplete={handleResumeUploaded} userId={userId} />
                    </TabsContent>

                    <TabsContent value="job-description" className="m-0">
                        <JobDescriptionInput
                            onSubmit={handleJobDescriptionSubmitted}
                            resumeContent={resumeData.content}
                        />
                    </TabsContent>

                    <TabsContent value="skills-selection" className="m-0">
                        <SkillsSelection
                            extractedSkills={extractedSkills}
                            onComplete={handleSkillsSelected}
                        />
                    </TabsContent>

                    <TabsContent value="preview" className="m-0">
                        <ResumePreview
                            resumeData={resumeData}
                            selectedSkills={extractedSkills}
                            jobDescription={jobDescription}
                        />
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}