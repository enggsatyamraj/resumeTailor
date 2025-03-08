'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRightIcon, PlusCircleIcon, XCircleIcon } from "lucide-react";

interface SkillsSelectionProps {
    extractedSkills: {
        technical: { name: string; selected: boolean }[];
        soft: { name: string; selected: boolean }[];
        custom: string[];
    };
    onComplete: (selectedSkills: {
        technical: { name: string; selected: boolean }[];
        soft: { name: string; selected: boolean }[];
        custom: string[];
    }) => void;
}

export default function SkillsSelection({ extractedSkills, onComplete }: SkillsSelectionProps) {
    const [skills, setSkills] = useState(extractedSkills);
    const [customSkill, setCustomSkill] = useState('');
    const [activeTab, setActiveTab] = useState('technical');

    // Toggle a skill selection
    const toggleSkill = (type: 'technical' | 'soft', index: number) => {
        const updatedSkills = { ...skills };
        updatedSkills[type][index].selected = !updatedSkills[type][index].selected;
        setSkills(updatedSkills);
    };

    // Add a custom skill
    const addCustomSkill = () => {
        if (customSkill.trim() && !skills.custom.includes(customSkill.trim())) {
            setSkills({
                ...skills,
                custom: [...skills.custom, customSkill.trim()]
            });
            setCustomSkill('');
        }
    };

    // Remove a custom skill
    const removeCustomSkill = (index: number) => {
        const updatedCustomSkills = [...skills.custom];
        updatedCustomSkills.splice(index, 1);
        setSkills({
            ...skills,
            custom: updatedCustomSkills
        });
    };

    // Handle submit
    const handleSubmit = () => {
        onComplete(skills);
    };

    return (
        <Card className="shadow-none border-0">
            <CardHeader className="pb-3">
                <CardTitle>Select Skills for Your Resume</CardTitle>
                <CardDescription>
                    Choose the skills that best match the job requirements. You can also add custom skills.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 mb-6">
                        <TabsTrigger value="technical">Technical Skills</TabsTrigger>
                        <TabsTrigger value="soft">Soft Skills</TabsTrigger>
                        <TabsTrigger value="custom">Custom Skills</TabsTrigger>
                    </TabsList>

                    <TabsContent value="technical">
                        <div className="mb-4">
                            <h3 className="text-sm font-medium mb-2">Technical skills extracted from the job description:</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Select the skills you want to highlight in your resume.
                            </p>

                            {skills.technical.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    No technical skills were extracted. Try adding custom skills.
                                </div>
                            ) : (
                                <ScrollArea className="h-[240px] rounded-md border p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {skills.technical.map((skill, index) => (
                                            <Badge
                                                key={index}
                                                variant={skill.selected ? "default" : "outline"}
                                                className={`cursor-pointer text-sm py-1.5 ${skill.selected ? '' : 'text-gray-500'}`}
                                                onClick={() => toggleSkill('technical', index)}
                                            >
                                                {skill.name}
                                                {skill.selected ? ' ✓' : ''}
                                            </Badge>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="soft">
                        <div className="mb-4">
                            <h3 className="text-sm font-medium mb-2">Soft skills extracted from the job description:</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Select the soft skills and qualities you want to emphasize.
                            </p>

                            {skills.soft.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    No soft skills were extracted. Try adding custom skills.
                                </div>
                            ) : (
                                <ScrollArea className="h-[240px] rounded-md border p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {skills.soft.map((skill, index) => (
                                            <Badge
                                                key={index}
                                                variant={skill.selected ? "default" : "outline"}
                                                className={`cursor-pointer text-sm py-1.5 ${skill.selected ? '' : 'text-gray-500'}`}
                                                onClick={() => toggleSkill('soft', index)}
                                            >
                                                {skill.name}
                                                {skill.selected ? ' ✓' : ''}
                                            </Badge>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="custom">
                        <div className="mb-4">
                            <h3 className="text-sm font-medium mb-2">Add custom skills:</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Add any additional skills that weren't automatically extracted.
                            </p>

                            <div className="flex gap-2 mb-4">
                                <Input
                                    placeholder="Enter a skill (e.g., Python, Leadership)"
                                    value={customSkill}
                                    onChange={(e) => setCustomSkill(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addCustomSkill();
                                        }
                                    }}
                                />
                                <Button variant="outline" onClick={addCustomSkill}>
                                    <PlusCircleIcon className="h-4 w-4 mr-1" />
                                    Add
                                </Button>
                            </div>

                            {skills.custom.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    No custom skills added yet.
                                </div>
                            ) : (
                                <ScrollArea className="h-[200px] rounded-md border p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {skills.custom.map((skill, index) => (
                                            <Badge
                                                key={index}
                                                className="flex items-center gap-1 py-1.5"
                                            >
                                                {skill}
                                                <XCircleIcon
                                                    className="h-4 w-4 ml-1 cursor-pointer"
                                                    onClick={() => removeCustomSkill(index)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setActiveTab(activeTab === 'technical' ? 'soft' : activeTab === 'soft' ? 'custom' : 'technical')}>
                    {activeTab === 'custom' ? 'Back to Technical Skills' : 'Next Tab'}
                </Button>
                <Button onClick={handleSubmit} className="flex items-center gap-2">
                    Continue to Preview
                    <ChevronRightIcon className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}