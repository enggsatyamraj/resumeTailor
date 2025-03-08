import { spawn } from 'child_process';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import * as os from 'os';

// Generate a LaTeX document from resume content
function generateLatexDocument(content: string, userName: string): string {
    // Sanitize content for LaTeX
    const sanitizedContent = content
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}')
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}');

    // Create a basic LaTeX document template
    return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{hyperref}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{fontawesome5}
\\usepackage{tabularx}

\\titleformat{\\section}{\\normalfont\\Large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{*2}{*1}

\\setlist{nolistsep}
\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
    {\\huge \\textbf{${userName}'s Resume}}
\\end{center}

${sanitizedContent}

\\end{document}`;
}

// Compile LaTeX to PDF using pdflatex
export async function generatePdf(content: string, userId: string, userName: string): Promise<string> {
    try {
        // Create a temporary directory
        const tempDir = path.join(os.tmpdir(), `resume_${userId}_${Date.now()}`);
        await mkdir(tempDir, { recursive: true });

        // Create LaTeX file
        const latexContent = generateLatexDocument(content, userName);
        const latexFilePath = path.join(tempDir, 'resume.tex');
        await writeFile(latexFilePath, latexContent);

        // Output PDF path
        const pdfFilePath = path.join(tempDir, 'resume.pdf');

        // Run pdflatex
        return new Promise((resolve, reject) => {
            const pdflatex = spawn('pdflatex', [
                '-interaction=nonstopmode',
                `-output-directory=${tempDir}`,
                latexFilePath
            ]);

            pdflatex.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`pdflatex process exited with code ${code}`));
                } else {
                    resolve(pdfFilePath);
                }
            });

            pdflatex.on('error', (err) => {
                reject(new Error(`Failed to start pdflatex: ${err.message}`));
            });
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
}