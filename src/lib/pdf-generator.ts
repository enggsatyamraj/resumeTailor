// src/lib/pdf-generator.ts - Fixed version
import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import * as os from 'os';

/**
 * Generate an ATS-friendly PDF resume from content
 * - Preserves all original content
 * - Maintains proper formatting for ATS compatibility
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
 * Generate ATS-optimized HTML that preserves all original content and formatting
 */
function generateAtsOptimizedHtml(content: string, userName: string): string {
  // Better format the content while preserving structure
  const formattedContent = preserveResumeStructure(content);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${userName}'s Resume</title>
  <style>
    /* ATS-friendly styles */
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #000;
      margin: 0;
      padding: 0;
    }
    
    .container {
      padding: 0.5in;
      max-width: 8.5in;
      margin: 0 auto;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 12px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }
    
    h1 { font-size: 18pt; }
    h2 { font-size: 14pt; }
    h3 { font-size: 12pt; }
    
    p {
      margin: 6px 0;
      text-align: justify;
    }
    
    .section {
      margin-bottom: 15px;
      page-break-inside: avoid;
    }
    
    ul, ol {
      margin: 6px 0;
      padding-left: 18px;
    }
    
    li {
      margin-bottom: 6px;
      text-align: justify;
      position: relative;
    }
    
    /* Specific element styling */
    .name {
      font-size: 22pt;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .contact-info {
      margin-bottom: 12px;
    }
    
    .section-heading {
      font-weight: bold;
      border-bottom: 1px solid #000;
      padding-bottom: 3px;
      margin-top: 15px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    
    .job-title {
      font-weight: bold;
    }
    
    .company {
      font-weight: bold;
    }
    
    .date {
      font-style: italic;
    }
    
    .preserve-format {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    /* Create a multi-column layout for skills if needed */
    .skills-list {
      column-count: 2;
      column-gap: 20px;
    }
    
    @media print {
      body {
        padding: 0;
        font-size: 11pt;
      }
      
      .container {
        padding: 0;
        box-shadow: none;
      }
      
      a {
        text-decoration: none;
        color: #000;
      }
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
 * Preserve and enhance the resume structure for HTML conversion
 */
function preserveResumeStructure(content: string): string {
  let processedContent = content;

  // First, identify and handle section headings
  // Look for common section names (all caps followed by newline)
  const sectionPattern = /\b(PROFESSIONAL SUMMARY|EXPERIENCE|EDUCATION|SKILLS|CORE COMPETENCIES|PROFESSIONAL EXPERIENCE|ACHIEVEMENTS|CERTIFICATIONS|PROJECTS|WORK EXPERIENCE|TECHNICAL SKILLS)\b/gi;
  processedContent = processedContent.replace(sectionPattern, match => {
    return `<div class="section-heading">${match}</div>`;
  });

  // Handle bullet points (lines starting with • or -, or numbers followed by a period)
  const bulletPattern = /^(•|-|\d+\.) (.*?)$/gm;
  processedContent = processedContent.replace(bulletPattern, '<li>$2</li>');

  // Wrap consecutive list items in <ul> tags
  processedContent = processedContent.replace(/(<li>.*?<\/li>\s*)+/g, '<ul>$&</ul>');

  // Handle paragraphs (text blocks separated by multiple newlines)
  const paragraphPattern = /(.+?)(\n{2,}|$)/g;
  processedContent = processedContent.replace(paragraphPattern, (_, paragraph) => {
    // Skip if it already has HTML tags
    if (paragraph.includes('<') && paragraph.includes('>')) {
      return paragraph;
    }
    return `<p>${paragraph}</p>\n\n`;
  });

  // Convert remaining newlines to <br> tags
  processedContent = processedContent.replace(/\n/g, '<br>');

  // Handle job titles and companies with dates
  const jobTitlePattern = /([A-Za-z\s]+) \| ([A-Za-z\s]+) \(([A-Za-z0-9\s-]+)\)/g;
  processedContent = processedContent.replace(jobTitlePattern,
    '<div class="job-title">$1</div> <div class="company">$2</div> <span class="date">$3</span>');

  // Clean up any double <br> tags
  processedContent = processedContent.replace(/<br><br>/g, '<br>');

  return processedContent;
}