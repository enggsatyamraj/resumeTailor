import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import * as path from 'path';
import { authOptions } from '../auth/[...nextauth]/route';

// Make sure the directory exists
const ensureDirectory = async (userId: string) => {
    const userDir = path.join(process.cwd(), 'data', userId);
    try {
        await mkdir(userDir, { recursive: true });
    } catch (error) {
        console.error('Error creating directory:', error);
    }
    return userDir;
};

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const userId = session.user.id;

        // Parse the request body
        const { jobDescription } = await request.json();

        if (!jobDescription || jobDescription.trim() === '') {
            return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
        }

        // Save the job description to a file
        const userDir = await ensureDirectory(userId);
        const timestamp = Date.now();
        const filename = `job_description_${timestamp}.txt`;
        const filePath = path.join(userDir, filename);

        await writeFile(filePath, jobDescription);

        // For now, we'll just return success
        // In a real implementation, you'd process with Gemini API here
        return NextResponse.json({
            success: true,
            message: 'Job description saved successfully',
            // In a real app, you might return extracted keywords here
            // keywords: [...extracted keywords...]
        });

    } catch (error) {
        console.error('Error processing job description:', error);
        return NextResponse.json({ error: 'Failed to process job description' }, { status: 500 });
    }
}