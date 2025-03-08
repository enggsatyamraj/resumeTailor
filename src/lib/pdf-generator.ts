// src/lib/pdf-generator.ts
import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import * as os from 'os';

/**
 * Generate an ATS-friendly PDF resume from content
 * - Uses a clean, standard structure that ATS systems can parse easily
 * - Maintains proper heading hierarchy and section organization
 * - Avoids complex formatting that might confuse ATS systems
 */
export async function generateAtsFriendlyPdf(content: string, userName: string): Promise<{ filePath: string, buffer: Buffer }> {
    try {
        // Create a temporary directory
        const tempDir = path.join(os.tmpdir(), `resume_${Date.now()}`);
        await mkdir(tempDir, { recursive: true });

        // Generate HTML with ATS-friendly formatting
        const html = generateAtsOptimizedHtml(content, userName);

        // Write HTML to a temporary file
        const htmlPath = path.join(tempDir, 'resume.html');
        await writeFile(htmlPath, html);

        // Use Puppeteer to convert HTML to PDF
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Set PDF options for optimal ATS parsing
        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
                top: '0.5in',
                right: '0.5in',
                bottom: '0.5in',
                left: '0.5in'
            },
            printBackground: true,
            displayHeaderFooter: false,
        });

        await browser.close();

        // Save the PDF
        const pdfPath = path.join(tempDir, 'tailored_resume.pdf');
        await writeFile(pdfPath, pdfBuffer);

        return {
            filePath: pdfPath,
            buffer: pdfBuffer
        };

    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF resume');
    }
}

/**
 * Generate ATS-optimized HTML with clean, scannable structure
 * - Uses semantic HTML elements properly
 * - Applies consistent formatting
 * - Avoids complex layouts that might confuse ATS parsers
 */
function generateAtsOptimizedHtml(content: string, userName: string): string {
    // Format the content into properly structured sections
    const formattedContent = formatResumeContent(content);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${userName}'s Resume</title>
  <style>
    /* ATS-friendly styles - simple, clean, and straightforward */
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
      margin: 0;
      padding: 0;
    }
    
    /* Main container */
    .container {
      padding: 0.5in;
      max-width: 8.5in;
      margin: 0 auto;
    }
    
    /* Header section */
    header {
      margin-bottom: 20px;
      text-align: center;
    }
    
    h1 {
      font-size: 18pt;
      margin: 0 0 5px 0;
      text-transform: uppercase;
    }
    
    .contact-info {
      font-size: 10pt;
      margin-bottom: 15px;
    }
    
    /* Section styling */
    section {
      margin-bottom: 20px;
    }
    
    h2 {
      font-size: 14pt;
      border-bottom: 1px solid #000;
      margin-bottom: 10px;
      padding-bottom: 2px;
      text-transform: uppercase;
    }
    
    h3 {
      font-size: 12pt;
      margin: 0 0 5px 0;
    }
    
    .job-title {
      font-weight: bold;
    }
    
    .company {
      font-weight: bold;
    }
    
    .date {
      font-style: italic;
      font-weight: normal;
    }
    
    .job-description {
      margin-top: 5px;
    }
    
    ul {
      margin: 5px 0;
      padding-left: 20px;
    }
    
    li {
      margin-bottom: 5px;
    }
    
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      margin: 0;
      padding: 0;
      list-style-type: none;
    }
    
    .skills-list li {
      margin-right: 15px;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    ${formattedContent}
  </div>
</body>
</html>`;
}

/**
 * Format resume content into structured sections
 * This function attempts to identify and format different resume sections
 */
function formatResumeContent(content: string): string {
    // For now, we'll wrap the content directly while preserving its structure
    // A more sophisticated version would parse and reorganize sections

    // Replace newlines with <br> tags to preserve formatting
    const formattedContent = content
        .replace(/\n/g, '<br>')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

    return formattedContent;
}