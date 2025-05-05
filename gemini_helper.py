import os
import re
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Load API key from .env
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def extract_json_from_response(text):
    """
    Extracts the first JSON block from Gemini response text using regex and parses it.
    """
    try:
        json_str = re.search(r'\{.*\}', text, re.DOTALL).group()
        return json.loads(json_str)
    except Exception as e:
        print("⚠️ Gemini raw response (not JSON):\n", text)
        print("⚠️ JSON parsing error:", e)
        return {
            "match_score": 0,
            "predicted_salary": 0,
            "recommended_mba_field": "Unknown",
            "summary": "Failed to parse Gemini output.",
            "rcm_improvement": "No suggestions.",
            "recommended_programs": [],
            "career_path": [],
            "recommended_skills": [],
            "best_locations": [],
            "risk_factors": {},
            "scholarship_probability": 0.0,
            "fit_type": "Unknown",
            "personality_match_summary": "N/A"
        }

def query_gemini(user_data):
    """
    Sends structured MBA profile to Gemini and parses its structured JSON response.
    """
    prompt = f"""
You are an expert MBA advisor AI with deep knowledge of admissions, career outcomes, salaries, and top global business schools.

Use the following candidate profile to generate an intelligent, structured analysis and advice in JSON format.

### Candidate Profile:
- Age: {user_data['Age']}
- Gender: {user_data['Gender']}
- Undergraduate Major: {user_data['Undergraduate_Major']}
- GPA: {user_data['Undergraduate_GPA']}
- Work Experience: {user_data['Years_of_Work_Experience']} years
- Current Job Title: {user_data['Current_Job_Title']}
- Current Salary: ${user_data['Annual_Salary_Before_MBA']}
- Management Experience: {user_data['Has_Management_Experience']}
- GRE/GMAT Score: {user_data['GREGMAT_Score']}
- Undergraduate University Ranking: {user_data['Undergrad_University_Ranking']}
- Entrepreneurial Interest (1-10): {user_data['Entrepreneurial_Interest']}
- Networking Importance (1-10): {user_data['Networking_Importance']}
- MBA Funding Source: {user_data['MBA_Funding_Source']}
- Desired Post-MBA Role: {user_data['Desired_PostMBA_Role']}
- Expected Post-MBA Salary: ${user_data['Expected_PostMBA_Salary']}
- Location Preference After MBA: {user_data['Location_Preference_PostMBA']}
- Reason for MBA: {user_data['Reason_for_MBA']}
- Preferred Format: {user_data['Online_vs_OnCampusMBA']}
- Has Decided to Pursue MBA: {user_data['Decided_to_Pursue_MBA']}

---

### TASKS:

1. Calculate a match score (0-100) indicating MBA suitability.
2. Predict post-MBA salary (USD).
3. Recommend the best-fit MBA specialization.
4. Provide a 1-paragraph executive summary of your assessment.
5. Suggest 2–3 areas for improvement to strengthen MBA success.
6. Recommend 3 global MBA programs with reasons.
7. Predict the user’s potential career path (post-MBA + 5 years).
8. List 3 skills the user should build pre- or during MBA.
9. Suggest 2-3 ideal cities/countries for post-MBA career.
10. Identify 3 risk factors that could weaken the user's MBA application.
Each must be:
- A clear factor name (e.g., "Low GPA", "Short Work Experience")
- An integer risk score from 1 to 10 (1 = low risk, 10 = high risk)
11. Estimate probability of scholarship (0.0 – 1.0).
12. Analyze soft-skills/personality fit for MBA and provide a summary.

---

### Output format — return JSON ONLY:

{{
  "match_score": integer,
  "predicted_salary": float,
  "recommended_mba_field": string,
  "summary": string,
  "rcm_improvement": string,
  "recommended_programs": [
    {{"school": string, "reason": string}}
  ],
  "career_path": [string],
  "recommended_skills": [string],
  "best_locations": [
    {{"city": string, "reason": string}}
  ],
  "risk_factors": {{
    "Factor Name 1": score,
    "Factor Name 2": score,
    "Factor Name 3": score
  }},
  "scholarship_probability": float,
  "fit_type": string,
  "personality_match_summary": string
}}

Respond only with the valid JSON structure above. Do NOT include markdown, explanations, or anything else.
No markdown.
No bullet points.
No line breaks between fields.
No explanations.
No quotes around keys.
Ensure commas are used correctly.
"""

    model = genai.GenerativeModel('models/gemini-1.5-pro-latest')
    response = model.generate_content(prompt)
    return extract_json_from_response(response.text)
