import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as path from 'path';
import { mkdir, writeFile, readFile, unlink } from 'fs/promises';
import { authOptions } from '../../auth/[...nextauth]/route';
import { extractTextFromDocument } from '@/lib/document-parser';
import * as os from 'os';

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
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large' }, { status: 400 });
        }

        // Create a temporary file for processing
        const originalName = file.name;
        const fileExtension = path.extname(originalName);
        const timestamp = Date.now();
        const filename = `resume_${timestamp}${fileExtension}`;

        // Create temp directory
        const tempDir = path.join(os.tmpdir(), `resume_${userId}_${timestamp}`);
        await mkdir(tempDir, { recursive: true });

        const tempFilePath = path.join(tempDir, filename);

        // Convert the file to a Buffer and save it temporarily
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(tempFilePath, buffer);

        // Extract text from the uploaded document
        let textContent;

        try {
            textContent = await extractTextFromDocument(tempFilePath);
        } catch (err) {
            console.error('Error extracting text:', err);
            textContent = "Error extracting text from document. Please try again with a different file.";
        }

        // Delete the temp file after processing
        try {
            await unlink(tempFilePath);
        } catch (err) {
            console.error('Error deleting temp file:', err);
        }

        // Return file information and extracted content
        return NextResponse.json({
            success: true,
            file: {
                id: filename, // This is now just an identifier, not a physical file path
                name: originalName,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString()
            },
            content: textContent
        });

    } catch (error) {
        console.error('Error processing upload:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}