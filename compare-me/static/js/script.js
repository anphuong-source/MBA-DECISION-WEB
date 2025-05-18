// Mode toggle functionality
document.getElementById('basicMode').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('advancedMode').classList.remove('active');
    document.getElementById('basicForm').style.display = 'block';
    document.getElementById('advancedForm').style.display = 'none';
    document.getElementById('basicResults').style.display = 'none';
    document.getElementById('result').style.display = 'none';
});

document.getElementById('advancedMode').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('basicMode').classList.remove('active');
    document.getElementById('basicForm').style.display = 'none';
    document.getElementById('advancedForm').style.display = 'block';
    document.getElementById('basicResults').style.display = 'none';
    document.getElementById('result').style.display = 'none';
});

// Basic form submission
document.addEventListener('DOMContentLoaded', function() {
  const basicForm = document.getElementById('basicAssessmentForm');
  if (!basicForm) return;

  basicForm.addEventListener('submit', async function(e) {
    console.log("Basic form submitted! (listener called)");
    e.preventDefault();

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    const formData = {
      age: document.getElementById('age').value,
      work_experience: document.getElementById('workExperience').value,
      major: document.getElementById('major').value,
      job_title: document.getElementById('jobTitle').value,
      score: document.getElementById('testScore').value,
      reason: document.getElementById('reason').value
    };

    try {
      const response = await fetch('/basic-assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      // Display results
      const resultsDiv = document.getElementById('basicResults');
      resultsDiv.style.display = 'block';

      // Update result elements
      resultsDiv.querySelector('.score').textContent = `Match Score: ${result.match_score}/100`;
      resultsDiv.querySelector('.specialization').textContent = `Recommended Specialization: ${result.specialization}`;
      resultsDiv.querySelector('.summary').textContent = result.summary;

      // Display risks
      const risksDiv = resultsDiv.querySelector('.risks');
      risksDiv.innerHTML = '<h3>Risk Factors:</h3>';
      (result.risks || []).forEach(risk => {
        const riskItem = document.createElement('div');
        riskItem.className = 'risk-item';
        riskItem.innerHTML = `
          <span>${risk.name}</span>
          <span class="risk-score">Risk Level: ${risk.risk_score}/10</span>
        `;
        risksDiv.appendChild(riskItem);
      });

      // Display scholarship probability
      const scholarshipProb = (result.scholarship_probability * 100).toFixed(1);
      resultsDiv.querySelector('.scholarship').textContent =
        `Estimated Scholarship Probability: ${scholarshipProb}%`;

    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your assessment. Please try again.');
    } finally {
      // Reset button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});

// Advanced form submission
document.getElementById('mbaForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        // Display results
        const resultDiv = document.getElementById('result');
        resultDiv.style.display = 'block';
        
        // Your existing result display code here
        // This should match your original advanced form result display logic
        
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your assessment. Please try again.');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}); 