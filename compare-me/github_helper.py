import os
import re
import json
from dotenv import load_dotenv
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

# Load API key from .env
load_dotenv()
client = ChatCompletionsClient(
    endpoint="https://models.github.ai/inference",
    credential=AzureKeyCredential(os.getenv("GITHUB_TOKEN")),
)
model = "openai/gpt-4.1"


# 🔧 Estimate budget from funding source and salary
def estimate_budget(source, salary):
    try:
        salary = float(salary)
    except:
        salary = 50000  # fallback if parsing fails

    source = source.lower()
    if "scholarship" in source:
        return "$30,000–$50,000"
    elif "employer" in source:
        return "$70,000+"
    elif "loan" in source:
        return "$50,000–$80,000"
    elif "self" in source:
        return f"${int(salary * 0.4):,}–${int(salary * 0.6):,}"
    else:
        return "$40,000–$60,000"

# 🧠 Clean JSON extractor
def extract_json_from_response(text):
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

# 🎓 Core function to query Gemini
def query_github_ai(user_data):
    budget_range = estimate_budget(
        user_data['MBA_Funding_Source'],
        user_data['Annual_Salary_Before_MBA']
    )

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
- Estimated MBA Budget: {budget_range}
- Desired Post-MBA Role: {user_data['Desired_PostMBA_Role']}
- Expected Post-MBA Salary: ${user_data['Expected_PostMBA_Salary']}
- Location Preference After MBA: {user_data['Location_Preference_PostMBA']}
- Reason for MBA: {user_data['Reason_for_MBA']}
- Preferred Format: {user_data['Online_vs_OnCampusMBA']}
- Has Decided to Pursue MBA: {user_data['Decided_to_Pursue_MBA']}

---

### TASKS:
1. match_score: integer
2. predicted_salary: float
3. recommended_mba_field: string
4. summary: string
5. rcm_improvement: string
6. recommended_mba_programs: [
    {{
      school: string,
      program_type: string,
      fit_reason: string,
      location: string
    }}
  ]
7. career_path: [string]
8. recommended_skills: [string]
9. best_locations: [
    {{
      city: string,
      reason: string,
      top_industries: [string],
      average_salary: int,
      top_employers: [string]
    }}
  ]
10. risk_factors: {{
    "factor": score
  }}
11. scholarship_probability: float
12. fit_type: string
13. personality_match_summary: string

Respond only with the valid JSON structure above. No markdown. No explanation. Return valid JSON only.
"""

    response = client.complete(
        model=model,
        messages=[
            SystemMessage("You are an MBA admissions advisor."),
            UserMessage(prompt)
        ],
        temperature=0.4,
        top_p=1.0,
    )

    return extract_json_from_response(response.choices[0].message.content)
