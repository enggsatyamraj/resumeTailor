import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { createDownloadableHtml } from '@/lib/html-to-pdf';

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

        console.log('Generating HTML for resume download');

        // Generate HTML instead of PDF
        const htmlContent = createDownloadableHtml(content, userName);

        // Return the HTML file
        const headers = new Headers();
        headers.append('Content-Type', 'text/html');
        headers.append('Content-Disposition', `attachment; filename="tailored_resume.html"`);

        return new NextResponse(htmlContent, {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('Error downloading resume:', error);
        return NextResponse.json({ error: 'Failed to download resume' }, { status: 500 });
    }
}