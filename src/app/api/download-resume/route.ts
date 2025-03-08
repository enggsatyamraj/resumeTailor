import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { mkdir, writeFile } from 'fs/promises';
import * as path from 'path';

// Make sure the directory exists
const ensureDirectory = async (userId: string) => {
    const userDir = path.join(process.cwd(), 'downloads', userId);
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
        const { content, originalFileName } = await request.json();

        if (!content) {
            return NextResponse.json({ error: 'Resume content is required' }, { status: 400 });
        }

        // Generate a filename if not provided
        const fileName = originalFileName || 'tailored_resume.txt';

        // In a real implementation, you would convert the content to PDF or DOCX format
        // For now, we'll just create a text file

        // Ensure the downloads directory exists
        const userDir = await ensureDirectory(userId);
        const timestamp = Date.now();
        const filePath = path.join(userDir, `tailored_${timestamp}_${fileName}`);

        // Write the content to a file
        await writeFile(filePath, content);

        // In a real app, you would stream the file back to the client
        // For simplicity, we'll just return the content as text
        const headers = new Headers();
        headers.append('Content-Type', 'text/plain');
        headers.append('Content-Disposition', `attachment; filename="tailored_${fileName}"`);

        return new NextResponse(content, {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('Error downloading resume:', error);
        return NextResponse.json({ error: 'Failed to download resume' }, { status: 500 });
    }
}