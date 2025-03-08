import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { generateTailoredResume } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Parse the request body
        const { resumeContent, skills, jobDescription } = await request.json();

        if (!resumeContent) {
            return NextResponse.json({ error: 'Resume content is required' }, { status: 400 });
        }

        if (!skills) {
            return NextResponse.json({ error: 'Skills are required' }, { status: 400 });
        }

        // Extract the selected skills
        const selectedSkills = {
            technical: skills.technical || [],
            soft: skills.soft || [],
            custom: skills.custom || []
        };

        // Generate tailored resume using Gemini API
        const tailoredResume = await generateTailoredResume(
            resumeContent,
            jobDescription,
            selectedSkills
        );

        return NextResponse.json({
            success: true,
            tailoredResume
        });

    } catch (error) {
        console.error('Error generating tailored resume:', error);
        return NextResponse.json({ error: 'Failed to generate tailored resume' }, { status: 500 });
    }
}