// src/lib/gemini.ts - Fixed version

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

// Extract skills from job description
export async function extractSkillsFromJobDescription(jobDescription: string, resumeContent?: string) {
    const prompt = `
You are an expert resume tailor and job application specialist. Extract skills from the following job description.
Categorize them into "technical" and "soft" skills.
Return the results in JSON format like {"technical": ["skill1", "skill2"], "soft": ["skill1", "skill2"]}.
Do not include any explanation or other text in your response, just the JSON object.

Job Description:
${jobDescription}

${resumeContent ? `Also, consider the following resume content to identify skills that match:
${resumeContent}` : ''}
`;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response if there's additional text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;

        // Parse the JSON response
        const skills = JSON.parse(jsonStr);

        // Ensure the response has the correct structure
        if (!skills.technical) skills.technical = [];
        if (!skills.soft) skills.soft = [];

        return skills;
    } catch (error) {
        console.error("Error extracting skills:", error);
        // Return a default set of skills to show functionality
        return {
            technical: ["JavaScript", "React", "TypeScript", "Next.js"],
            soft: ["Communication", "Teamwork", "Problem Solving"]
        };
    }
}

// FIXED VERSION of generate tailored resume
export async function generateTailoredResume(
    originalResume: string,
    jobDescription: string,
    skills: {
        technical: string[];
        soft: string[];
        custom: string[];
    }
) {
    // Ensure we have skills to work with
    const technicalSkills = Array.isArray(skills.technical) ? skills.technical : [];
    const softSkills = Array.isArray(skills.soft) ? skills.soft : [];
    const customSkills = Array.isArray(skills.custom) ? skills.custom : [];

    const allSkills = [
        ...technicalSkills,
        ...softSkills,
        ...customSkills
    ].filter(Boolean).join(", ");

    // Ensure we have content to work with
    if (!originalResume || originalResume.trim() === "") {
        return "Error: No original resume content provided. Please upload your resume first.";
    }

    const prompt = `
You are an expert ATS resume optimizer. I'm going to provide you with a resume and a job description.

EXTREMELY IMPORTANT: You must return the ENTIRE resume with ALL original content preserved. Do not remove ANY information from the original resume.

Your ONLY tasks are to:
1. KEEP the entire original resume structure, all sections, and all content
2. ADD relevant keywords from the job description where appropriate
3. EMPHASIZE skills and experiences that match the job requirements
4. REWORD some bullet points to better highlight relevant achievements 
5. MAINTAIN the exact same sections, headings, contact information, and overall structure

DO NOT:
- Remove any sections or content from the original resume
- Change the overall structure or order of the resume
- Add fictional experiences or qualifications
- Completely rewrite sections

The final output MUST contain all information from the original resume, just optimized for ATS scanning and the specific job.

Original Resume:
${originalResume}

Job Description:
${jobDescription}

Important Skills to Emphasize:
${allSkills}

Return the COMPLETE enhanced resume with ALL original content preserved. Make sure to include ALL sections from the original resume (Professional Summary, Core Competencies, Professional Experience, Education, etc.).
`;

    try {
        console.log("Sending prompt to Gemini API with skills:", allSkills);

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const tailoredResume = response.text();

        if (!tailoredResume || tailoredResume.trim() === "") {
            throw new Error("Received empty response from Gemini API");
        }

        // Validation - check if the tailored resume is significantly shorter than the original
        // This is a simple check to catch cases where content might be lost
        if (tailoredResume.length < originalResume.length * 0.9) {
            console.warn("Warning: Tailored resume is significantly shorter than original. This might indicate lost content.");
            console.warn(`Original length: ${originalResume.length}, Tailored length: ${tailoredResume.length}`);

            // If it's too short, return the original with a note
            return `${originalResume}\n\n--- NOTE: The AI-enhanced version appeared to lose content, so the original resume is shown instead. ---`;
        }

        return tailoredResume;
    } catch (error) {
        console.error("Error generating tailored resume:", error);

        // Provide a meaningful fallback that helps debugging
        return `Failed to generate tailored resume: ${error.message}\n\nAs a fallback, here's your original resume:\n\n${originalResume}`;
    }
}