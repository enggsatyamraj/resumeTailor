// src/app/api/download-resume/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { generateAtsFriendlyPdf } from '@/lib/pdf-generator';

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

        console.log('Generating ATS-friendly PDF resume');

        // Generate PDF using the optimized generator
        const { buffer } = await generateAtsFriendlyPdf(content, userName);

        // Set appropriate headers for PDF download
        const headers = new Headers();
        headers.append('Content-Type', 'application/pdf');
        headers.append('Content-Disposition', `attachment; filename="tailored_resume.pdf"`);

        // Return the PDF file
        return new NextResponse(buffer, {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('Error generating/downloading resume:', error);
        return NextResponse.json({ error: 'Failed to generate resume PDF' }, { status: 500 });
    }
}