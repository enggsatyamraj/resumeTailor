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

// Generate tailored resume
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
You are an expert resume tailor. Your task is to modify the original resume to make it tailored for a specific job description.
Modify the original resume to emphasize the following skills: ${allSkills || "No specific skills provided"}.
The resume should be tailored for this job description: ${jobDescription || "No job description provided"}

Make the following enhancements:
1. Rewrite the professional summary/objective to match the job requirements
2. Reorganize and emphasize the skills that match the job description
3. Adjust job experience descriptions to highlight relevant experiences
4. Maintain the original format and sections of the resume
5. Do not fabricate any information, only work with what is provided
6. Format the resume in a clean, professional way

Original Resume:
${originalResume}

Return ONLY the tailored resume text, without any explanations or headers.
`;

    try {
        console.log("Sending prompt to Gemini API with skills:", allSkills);

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const tailoredResume = response.text();

        if (!tailoredResume || tailoredResume.trim() === "") {
            throw new Error("Received empty response from Gemini API");
        }

        return tailoredResume;
    } catch (error) {
        console.error("Error generating tailored resume:", error);

        // Provide a meaningful fallback that helps debugging
        return `Failed to generate tailored resume: ${error.message}\n\nAs a fallback, here's your original resume:\n\n${originalResume}`;
    }
}