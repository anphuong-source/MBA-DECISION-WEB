document.getElementById("mbaForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  const res = await fetch('/submit', {
    method: 'POST',
    body: new URLSearchParams(data)
  });

  const result = await res.json();

  document.getElementById("result").innerHTML = `
    <h2>Result Summary</h2>
    <p><strong>🎯 Match Score:</strong> ${result.match_score}</p>
    <p><strong>💰 Predicted Salary:</strong> $${result.predicted_salary}</p>
    <p><strong>📚 Recommended Field:</strong> ${result.recommended_mba_field}</p>
    <p><strong>🧾 Summary:</strong> ${result.summary}</p>
    <p><strong>🛠 Improvements:</strong> ${result.rcm_improvement}</p>

    <h3>🎓 Recommended MBA Programs</h3>
    <ul>${result.recommended_programs?.map(p => `<li>${p.school}: ${p.reason}</li>`).join('')}</ul>

    <h3>🚀 Career Path</h3>
    <ul>${result.career_path?.map(role => `<li>${role}</li>`).join('')}</ul>

    <h3>🧠 Skills to Build</h3>
    <ul>${result.recommended_skills?.map(skill => `<li>${skill}</li>`).join('')}</ul>

    <h3>🌍 Best Locations</h3>
    <ul>${result.best_locations?.map(loc => `<li>${loc.city}: ${loc.reason}</li>`).join('')}</ul>

    <h3>⚠️ Risk Factors</h3>
    <ul>${Object.entries(result.risk_factors || {}).map(([factor, score]) => `<li>${factor}: ${score}/10</li>`).join('')}</ul>

    <p><strong>🎓 Scholarship Probability:</strong> ${Math.round(result.scholarship_probability * 100)}%</p>
    <p><strong>🧬 Fit Type:</strong> ${result.fit_type}</p>
    <p><strong>🧠 Personality Summary:</strong> ${result.personality_match_summary}</p>
    <p><strong>💸 ROI (5 years):</strong> $${result.roi}</p>
  `;
});
