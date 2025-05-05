// Randomize the word cloud on page load
document.addEventListener('DOMContentLoaded', () => {
    const majors = document.querySelectorAll('.major-word');
    
    // Set random sizes and positions for the word cloud
    majors.forEach(word => {
        const randomFontSize = 20 + Math.random() * 20; // 20px to 40px
        const randomTopMargin = Math.random() * 30;     // 0px to 30px
        const randomLeftMargin = Math.random() * 40;    // 0px to 40px
        const randomRotate = (Math.random() - 0.5) * 20; // -10deg to 10deg

        word.style.fontSize = `${randomFontSize}px`;
        word.style.marginTop = `${randomTopMargin}px`;
        word.style.marginLeft = `${randomLeftMargin}px`;
        word.dataset.originalSize = randomFontSize; // save the original random size
        word.style.transform = `rotate(${randomRotate}deg)`;

        // Add event listener to each major word for selecting
        word.addEventListener('click', () => selectMajor(word)); // Add event listener
    });
});

// Function to select a major and fetch the chart data
function selectMajor(word) {
    const major = word.innerText;
    console.log("Selected Major:", major);  // Debugging line

    fetch(`/get_chart/${major}`)
    .then(response => response.json())
    .then(data => {
        console.log("Graph Data Response:", data.graph_html);

        const chartArea = document.getElementById('chart-area');
        
        if (chartArea) {  // Check if the chart area exists
            chartArea.innerHTML = ''; // Clear previous content
            chartArea.innerHTML = data.graph_html; // Inject the new graph HTML

            // Ensure the embedded script is executed
            const scripts = chartArea.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                newScript.src = script.src;
                newScript.innerHTML = script.innerHTML;
                document.body.appendChild(newScript);  // Execute the script to render the graph
            });
        } else {
            console.error("Chart area element not found.");
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });


    // Apply styles to the selected word
    const selectedMajor = document.querySelector('.major-word.selected');
    if (selectedMajor) {
        selectedMajor.classList.remove('selected');
        selectedMajor.style.fontSize = selectedMajor.dataset.originalSize + "px"; // Reset font size
        selectedMajor.style.fontWeight = '300'; // Reset font weight
    }

    word.classList.add('selected'); // Add 'selected' class to the clicked word
    word.style.fontSize = '36px'; // Make it bigger
    word.style.fontWeight = 'bold'; // Make it bold
}
