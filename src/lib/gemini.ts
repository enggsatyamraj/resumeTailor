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

        // Parse the JSON response
        const skills = JSON.parse(text);
        return skills;
    } catch (error) {
        console.error("Error extracting skills:", error);
        // If parsing failed or there was another error, return default empty structure
        return { technical: [], soft: [] };
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
    const allSkills = [
        ...skills.technical,
        ...skills.soft,
        ...skills.custom
    ].join(", ");

    const prompt = `
You are an expert resume tailor. Your task is to modify the original resume to make it tailored for a specific job description.
Modify the original resume to emphasize the following skills: ${allSkills}.
The resume should be tailored for this job description: ${jobDescription}

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
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const tailoredResume = response.text();

        return tailoredResume;
    } catch (error) {
        console.error("Error generating tailored resume:", error);
        return "Failed to generate tailored resume. Please try again.";
    }
}