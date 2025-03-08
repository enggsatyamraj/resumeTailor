import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { authOptions } from '../../auth/[...nextauth]/route';

// Make the uploads directory if it doesn't exist
const ensureUploadsDirectory = async (userId: string) => {
    const userDir = path.join(process.cwd(), 'uploads', userId);
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

        // Parse the multipart form data
        const formData = await request.formData();
        const file = formData.get('resume') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Check file type
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large' }, { status: 400 });
        }

        // Create a safe filename
        const originalName = file.name;
        const fileExtension = path.extname(originalName);
        const timestamp = Date.now();
        const filename = `resume_${timestamp}${fileExtension}`;

        // Ensure the uploads directory exists
        const userDir = await ensureUploadsDirectory(userId);
        const filePath = path.join(userDir, filename);

        // Convert the file to a Buffer and save it
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        // Here you would typically save the file metadata in your database
        // For now, we'll just return the file information
        return NextResponse.json({
            success: true,
            file: {
                name: originalName,
                size: file.size,
                path: filePath,
                type: file.type,
                uploadedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error processing upload:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}