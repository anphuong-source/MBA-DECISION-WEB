from flask import Flask, request, render_template, jsonify
import csv
import os
from gemini_helper import query_gemini
from basic_gemini_helper import get_basic_assessment
from roi_calculator import calculate_roi

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    try:
        # Get form data
        data = request.form.to_dict()
        assessment_type = data.pop('assessment_type', 'advanced')  # Get assessment type from form data
        
        if assessment_type == 'basic':
            # get_basic_assessment already returns the dictionary we need
            basic_data_dict = get_basic_assessment(
                age=data['Age'],
                work_experience=data['Work_Experience'],
                major=data['Undergraduate_Major'],
                job_title=data['Current_Job_Title'],
                gmat_score=data['GMAT_GRE_Score'],
                reason=data['Reason_for_MBA']
            )
            # DO NOT call parse_basic_assessment here.
            # Directly use basic_data_dict for mapped_result

            mapped_result = {
                "recommended_mba_field": basic_data_dict.get("recommended_mba_field", "Unknown"),
                "summary": basic_data_dict.get("summary", "N/A"),
                "rcm_improvement": "N/A",
                "recommended_mba_programs": [],
                "career_path": [],
                "recommended_skills": [],
                "best_locations": [],
                "risk_factors": basic_data_dict.get("risk_factors", []),
                "scholarship_probability": basic_data_dict.get("scholarship_probability", 0),
                "fit_type": "Basic Assessment",
                "personality_match_summary": "N/A",
                "predicted_salary": None,  # or 0, but don't show in frontend
                "roi": None,               # or 0, but don't show in frontend
                "match_score": basic_data_dict.get("match_score", 0),
            }
        else:
            # Advanced assessment
            data['Annual_Salary_Before_MBA'] = float(data['Annual_Salary_Before_MBA'])
            data['Expected_PostMBA_Salary'] = float(data['Expected_PostMBA_Salary'])

            gemini_data_from_helper = query_gemini(data)
            roi = calculate_roi(gemini_data_from_helper.get('predicted_salary', 0), data['Annual_Salary_Before_MBA'], 120000, 5)

            entry = {
                **data,
                **gemini_data_from_helper,
                'ROI': roi,
                'MBA_Cost': 120000
            }

            os.makedirs("data", exist_ok=True)
            with open('data/MBA_dataset.csv', 'a', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=entry.keys())
                if f.tell() == 0:
                    writer.writeheader()
                writer.writerow(entry)

            # Normalize risk_factors for advanced assessment to match basic assessment format (list of dicts)
            adv_risk_factors_raw = gemini_data_from_helper.get("risk_factors")
            normalized_adv_risk_factors = []
            if isinstance(adv_risk_factors_raw, dict):
                for factor, score in adv_risk_factors_raw.items():
                    score_val = 0
                    try:
                        score_val = int(score)
                    except (ValueError, TypeError):
                        pass # score_val remains 0
                    normalized_adv_risk_factors.append({"factor": str(factor), "score": score_val})
            elif isinstance(adv_risk_factors_raw, list):
                # If LLM already returned a list (e.g., if gemini_helper.py changes or LLM output varies)
                for item in adv_risk_factors_raw:
                    if isinstance(item, dict) and "factor" in item and "score" in item:
                        score_val = 0
                        try:
                            score_val = int(item.get("score"))
                        except (ValueError, TypeError):
                            pass # score_val remains 0
                        normalized_adv_risk_factors.append({"factor": str(item.get("factor")), "score": score_val})
                        
            # Map Gemini result fields to frontend expected names
            mapped_result = {
                "recommended_mba_field": gemini_data_from_helper.get("recommended_mba_field") or gemini_data_from_helper.get("best_fit_mba_specialization") or "Unknown",
                "summary": gemini_data_from_helper.get("summary") or gemini_data_from_helper.get("executive_summary") or "N/A",
                "rcm_improvement": (
                    gemini_data_from_helper.get("rcm_improvement")
                    or ". ".join(
                        [
                            item for item in gemini_data_from_helper.get("areas_for_improvement", [])
                            if not str(item).strip().isdigit()
                        ]
                    )
                    or "N/A"
                ),
                "recommended_mba_programs": gemini_data_from_helper.get("recommended_mba_programs") or [],
                "career_path": gemini_data_from_helper.get("career_path") or [],
                "recommended_skills": gemini_data_from_helper.get("recommended_skills") or [],
                "best_locations": gemini_data_from_helper.get("best_locations") or gemini_data_from_helper.get("ideal_cities_countries") or [],
                "risk_factors": normalized_adv_risk_factors, # Use the transformed list
                "scholarship_probability": gemini_data_from_helper.get("scholarship_probability") or 0,
                "fit_type": gemini_data_from_helper.get("fit_type") or "Advanced Assessment", # More specific default
                "personality_match_summary": gemini_data_from_helper.get("personality_match_summary") or "N/A",
                "predicted_salary": gemini_data_from_helper.get("predicted_salary") or 0,
                "roi": roi,
                "match_score": gemini_data_from_helper.get("match_score") or 0,
            }

            # Ensure each recommended MBA program has at least 5 strengths/axes and values
            for program in mapped_result["recommended_mba_programs"]:
                strengths = program.get("strengths") or []
                if strengths and isinstance(strengths[0], dict):
                    labels = [s.get("label") or s.get("axis") or "" for s in strengths]
                    values = [s.get("value", 0) for s in strengths]
                else:
                    labels = strengths
                    values = program.get("strengths_values") or [70] * len(labels)
                default_axes = ["Leadership", "Global", "Technology", "Analytics", "Strategy", "Entrepreneurship", "Finance", "Consulting"]
                while len(labels) < 5:
                    labels.append(default_axes[len(labels) % len(default_axes)])
                    values.append(60)
                if strengths and isinstance(strengths[0], dict):
                    program["strengths"] = [{"label": l, "value": v} for l, v in zip(labels, values)]
                else:
                    program["strengths"] = labels
                    program["strengths_values"] = values

        return jsonify(mapped_result)
    except Exception as e:
        print('Error in /submit:', e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)