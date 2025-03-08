import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { readFile, unlink } from 'fs/promises';
import { generatePdf } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const userId = session.user.id;
        const userName = session.user.name || 'User';

        // Parse the request body
        const { content } = await request.json();

        if (!content) {
            return NextResponse.json({ error: 'Resume content is required' }, { status: 400 });
        }

        // Generate PDF using LaTeX
        const pdfFilePath = await generatePdf(content, userId, userName);

        // Read the generated PDF
        const pdfContent = await readFile(pdfFilePath);

        // Clean up the temporary file
        await unlink(pdfFilePath).catch(() => { });

        // Return the PDF file
        const headers = new Headers();
        headers.append('Content-Type', 'application/pdf');
        headers.append('Content-Disposition', `attachment; filename="tailored_resume.pdf"`);

        return new NextResponse(pdfContent, {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('Error downloading resume:', error);
        return NextResponse.json({ error: 'Failed to download resume' }, { status: 500 });
    }
}