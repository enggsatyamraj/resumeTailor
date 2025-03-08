import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { extractSkillsFromJobDescription } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Parse the request body
        const { jobDescription, resumeContent } = await request.json();

        if (!jobDescription || jobDescription.trim() === '') {
            return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
        }

        // Extract skills using Gemini API
        const skills = await extractSkillsFromJobDescription(jobDescription, resumeContent);

        // Return the extracted skills
        return NextResponse.json({
            success: true,
            skills
        });

    } catch (error) {
        console.error('Error extracting skills:', error);
        return NextResponse.json({ error: 'Failed to extract skills from job description' }, { status: 500 });
    }
}