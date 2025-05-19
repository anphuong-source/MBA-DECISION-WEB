// script.js

// Descriptions for each major.
// Keys MUST EXACTLY match the 'data-major' attribute values in your HTML.
const majorDescriptions = {
  "Economics": "The graph for Economics majors shows a relatively balanced interest in various post-MBA roles over the years of work experience. Marketing Director and Finance Manager positions consistently attract a high number of individuals, with Marketing Director roles peaking slightly in the early to mid-career stages. Executive roles steadily increase over time, indicating growing leadership aspirations. Startup Founder roles maintain a lower but stable interest. Overall, Economics graduates appear to pursue a diverse range of roles with a slight emphasis on marketing and finance-related positions.",
  "Business": "For Business majors, the demand for Marketing Director roles is notably high compared to other positions, peaking around years four to six of work experience. Finance Manager and Executive roles also receive considerable interest, with the Executive role showing a steady trend throughout the career span. Consultant and Startup Founder roles are less popular but remain consistent. This pattern suggests that Business graduates tend to focus more on leadership and marketing-oriented roles after completing their MBA.",
  "Arts": "The graph for Arts graduates indicates a fairly even distribution of desired post-MBA roles, without a dominant preference for any specific position. Executive and Consultant roles attract a slightly higher number of people, with some fluctuations across the years of experience. Marketing Director and Finance Manager roles show moderate interest, while Startup Founder roles maintain a steady but lower demand. This suggests that Arts majors explore a wide range of career paths with a modest focus on executive and consulting positions.",
  "Science": "Science majors show a distinct preference for Startup Founder and Marketing Director roles, both of which demonstrate peaks at different points in the career timeline. The Marketing Director role tends to peak earlier, whereas Startup Founder roles remain relatively stable with minor fluctuations. Executive and Consultant roles hold moderate interest, while Finance Manager roles attract a smaller group. This pattern reflects Science graduates’ inclination towards innovative and managerial positions post-MBA.",
  "Engineering": "Among Engineering majors, the Finance Manager and Executive roles are the most sought-after post-MBA positions, both maintaining steady interest throughout the years of work experience. Startup Founder roles also attract a moderate number of individuals, especially in mid-career stages. Marketing Director roles, however, are less favored in comparison. Consultant roles show a consistent but lower level of interest. These trends suggest that Engineering graduates aim for leadership roles in finance and executive management following their MBA.",
};

// Function to select a major, fetch the chart data, and update description
function selectMajor(wordElement) {
    if (!wordElement || !wordElement.dataset || typeof wordElement.dataset.major === 'undefined') {
        console.error("selectMajor called with invalid word element or missing data-major:", wordElement);
        const firstMajorWord = document.querySelector('#chart-section .major-word');
        if (firstMajorWord && (!wordElement || wordElement !== firstMajorWord) ) {
             console.warn("Attempting to select the first major word as a fallback due to invalid input.");
             selectMajor(firstMajorWord); // Call with the first valid element
        }
        return;
    }

    const majorName = wordElement.dataset.major;
    console.log("Selected Major:", majorName);

    // Fetch and display chart
    fetch(`/get_chart/${majorName}`)
    .then(response => {
        if (!response.ok) {
            // Try to parse error from backend if JSON, otherwise use status text
            return response.json().then(errData => {
                throw new Error(`HTTP error! status: ${response.status}, message: ${errData.error || response.statusText}`);
            }).catch(() => { // Fallback if response isn't JSON
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            console.error(`Error from /get_chart endpoint for ${majorName}:`, data.error);
            const chartArea = document.getElementById('chart-area');
            if (chartArea) chartArea.innerHTML = `<p style="color: red; padding: 20px;">Error loading chart: ${data.error}</p>`;
            // Also hide/clear description on chart error
            const descriptionBox = document.getElementById("description-box");
            if (descriptionBox) descriptionBox.style.display = "none";
            return;
        }
        // console.log("Graph Data Response:", data.graph_html); // Usually too verbose for regular logging
        const chartArea = document.getElementById('chart-area');
        if (chartArea) {
            chartArea.innerHTML = '';
            chartArea.innerHTML = data.graph_html;
            // Re-evaluate scripts for Plotly (important)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data.graph_html;
            const scripts = tempDiv.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.textContent = oldScript.textContent;
                document.body.appendChild(newScript).remove(); // Appends, executes, then removes
            });
            console.log(`Chart updated for ${majorName}`);
        } else {
            console.error("Chart area element (#chart-area) not found.");
        }
    })
    .catch(error => {
        console.error(`Network or other error fetching chart data for major '${majorName}':`, error);
        const chartArea = document.getElementById('chart-area');
        if (chartArea) chartArea.innerHTML = `<p style="color: red; padding: 20px;">Failed to load chart data for ${majorName}. Please check network or console.</p>`;
        // Also hide/clear description on chart error
        const descriptionBox = document.getElementById("description-box");
        if (descriptionBox) descriptionBox.style.display = "none";
    });

    // Update Description Box
    const descriptionBox = document.getElementById("description-box");
    const descriptionTextElement = document.getElementById("description-text");

    if (descriptionBox && descriptionTextElement) {
        const description = majorDescriptions[majorName];
        if (description) {
            descriptionTextElement.textContent = description;
            descriptionBox.style.display = "block";
            console.log(`Displaying description for ${majorName}`);
        } else {
            descriptionTextElement.textContent = "No specific insights available for this major at the moment.";
            descriptionBox.style.display = "block"; // Still show the box
            console.warn("No description found in majorDescriptions object for major:", majorName);
        }
    } else {
        console.error("HTML elements for description (#description-box or #description-text) not found.");
    }

    // Style the selected word in the word cloud
    const allMajorWords = document.querySelectorAll('#chart-section .major-word');
    allMajorWords.forEach(mw => {
        if (mw.classList.contains('selected')) {
            mw.classList.remove('selected');
            // Reset to original styles if stored (ensure dataset.originalSize is always set)
            if (mw.dataset.originalSize) {
                 mw.style.fontSize = mw.dataset.originalSize + "px";
            }
            mw.style.fontWeight = '300'; // Or your default non-selected weight
        }
    });

    // Style the newly clicked word
    if (wordElement.dataset.originalSize) { // Check it exists before trying to style
        wordElement.classList.add('selected');
        wordElement.style.fontSize = '1.5em'; // Or a fixed px value like '24px'
        wordElement.style.fontWeight = 'bold';
    }
}

// Main DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
  console.log("--- DOMContentLoaded event fired ---");

  // GSAP and ScrollTrigger are not used in this version, so no need to register.
  // console.log("GSAP and ScrollTrigger libraries would be loaded here if used.");

  // Setup for Word Cloud interaction
  const majors = document.querySelectorAll('#chart-section .major-word'); // Scoped to chart-section
  console.log(`Found ${majors.length} .major-word elements.`);

  if (majors.length > 0) {
    majors.forEach(word => {
      // Set initial random styles and store original font size for reset
      const randomFontSize = 14 + Math.random() * 10; // Base font size range in px
      word.style.fontSize = `${randomFontSize}px`;
      word.dataset.originalSize = randomFontSize; // Store it correctly

      word.style.marginTop = `${Math.random() * 10}px`;
      word.style.marginLeft = `${Math.random() * 15}px`;
      word.style.transform = `rotate(${(Math.random() - 0.5) * 12}deg)`; // Subtle rotation

      word.addEventListener('click', () => selectMajor(word));
    });
    console.log("Word cloud initialized with styles and event listeners.");

    // Load default chart and description for the first major word
    if (typeof selectMajor === "function") {
        selectMajor(majors[0]); // majors[0] is the first span.major-word
        console.log("Default chart and description loaded for:", majors[0].dataset.major);
    }
  } else {
    console.warn("No .major-word elements found for word cloud setup.");
  }

  console.log("--- DOMContentLoaded setup complete (Chart & Description Focus) ---");
});