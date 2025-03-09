// src/lib/resume-validator.ts

/**
 * Validates that the tailored resume preserves important content from the original
 * Returns { valid: true } if valid, or { valid: false, issues: string[] } if there are issues
 */
export function validateResumeContent(
    originalResume: string,
    tailoredResume: string
): { valid: boolean; issues?: string[] } {
    const issues: string[] = [];

    // 1. Check if the tailored resume is significantly shorter
    if (tailoredResume.length < originalResume.length * 0.9) {
        issues.push('Tailored resume is significantly shorter than the original, which may indicate content loss');
    }

    // 2. Extract key sections from both resumes
    const sectionsToCheck = [
        'PROFESSIONAL SUMMARY',
        'EXPERIENCE',
        'EDUCATION',
        'SKILLS',
        'CORE COMPETENCIES',
        'PROFESSIONAL EXPERIENCE',
        'ACHIEVEMENTS',
        'PROJECTS'
    ];

    // Check for missing sections
    for (const section of sectionsToCheck) {
        if (
            originalResume.includes(section) &&
            !tailoredResume.includes(section)
        ) {
            issues.push(`Section "${section}" is missing from the tailored resume`);
        }
    }

    // 3. Check for critical information loss
    // Extract contact information (phone, email) from original
    const phonePattern = /\+?\d[\d\s-]{8,}/g;
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    const originalPhones = originalResume.match(phonePattern) || [];
    const originalEmails = originalResume.match(emailPattern) || [];
    const tailoredPhones = tailoredResume.match(phonePattern) || [];
    const tailoredEmails = tailoredResume.match(emailPattern) || [];

    // Check if contact information is preserved
    if (originalPhones.length > 0 && tailoredPhones.length === 0) {
        issues.push('Phone number(s) missing from tailored resume');
    }

    if (originalEmails.length > 0 && tailoredEmails.length === 0) {
        issues.push('Email address(es) missing from tailored resume');
    }

    // 4. Check name preservation
    // Extract what appears to be a name from the first few lines
    const originalFirstLines = originalResume.split('\n').slice(0, 5).join(' ');
    const tailoredFirstLines = tailoredResume.split('\n').slice(0, 5).join(' ');
    const namePattern = /([A-Z][a-z]+ [A-Z][a-z]+)/;

    const originalNameMatch = originalFirstLines.match(namePattern);
    if (originalNameMatch && originalNameMatch[1]) {
        const originalName = originalNameMatch[1];
        if (!tailoredFirstLines.includes(originalName)) {
            issues.push(`Name "${originalName}" may be missing from tailored resume`);
        }
    }

    return {
        valid: issues.length === 0,
        issues: issues.length > 0 ? issues : undefined
    };
}

/**
 * Apply fixes to a potentially broken tailored resume
 * Falls back to the original resume with highlighted skills when needed
 */
export function applyResumeFixes(
    originalResume: string,
    tailoredResume: string,
    skills: string[]
): string {
    const validation = validateResumeContent(originalResume, tailoredResume);

    // If there are no issues, return the tailored resume as is
    if (validation.valid) {
        return tailoredResume;
    }

    console.warn('Issues detected with tailored resume:', validation.issues);

    // If there are issues, create a basic enhanced version of the original resume
    // that highlights the key skills without changing structure
    let enhancedOriginal = originalResume;

    // Simple enhancement: for each skill, add emphasis if it exists in the original
    for (const skill of skills) {
        if (skill && skill.trim().length > 0) {
            const skillRegex = new RegExp(`\\b${skill}\\b`, 'gi');
            enhancedOriginal = enhancedOriginal.replace(skillRegex, `**${skill}**`);
        }
    }

    // Add a note at the top about the fallback
    const fallbackNote = `
NOTE: This resume has been lightly enhanced to highlight key skills while preserving your original content.
\n\n`;

    return fallbackNote + enhancedOriginal;
}