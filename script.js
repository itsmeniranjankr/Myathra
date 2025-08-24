document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    // Your Gemini API Key is embedded here.
    const GEMINI_API_KEY = "AIzaSyDyY3X1_10WfL7VlHFS85Jn2_H-vVm0hag";

    // --- DOM ELEMENTS ---
    const generateBtn = document.getElementById('generate-btn');
    const locationInput = document.getElementById('location-input');
    const interestsInput = document.getElementById('interests-input');
    const resultsSection = document.getElementById('results-section');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultsGrid = document.getElementById('results-grid');

    // --- EVENT LISTENER ---
    generateBtn.addEventListener('click', generateItinerary);

    // --- MAIN FUNCTION ---
    async function generateItinerary() {
        const location = locationInput.value.trim();
        const interests = interestsInput.value.trim();

        if (!location || !interests) {
            alert("Please fill in both your location and interests.");
            return;
        }

        // --- UI STATE: START LOADING ---
        resultsSection.classList.remove('hidden');
        loadingSpinner.classList.remove('hidden');
        resultsGrid.innerHTML = ''; // Clear previous results
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating...`;

        try {
            // --- CONSTRUCT THE AI PROMPT ---
            const prompt = `
                You are "Myathra", an expert local tour guide for Kerala, India.
                A user is currently at "${location}" and is interested in "${interests}".

                Your task is to generate a list of 2-3 specific, real tourist spots or activities near their location that match their interests.

                You MUST respond with ONLY a valid JSON array of objects. Each object in the array should represent one location and have the following three properties:
                1. "name": A string with the name of the location (e.g., "Athirappilly Falls").
                2. "description": A string with a short, friendly, and appealing description of the location.
                3. "imageQuery": A simple, effective search string for finding a good photo of the location (e.g., "Athirappilly Falls Kerala").

                Do not include any text, titles, or introductions before or after the JSON array.
            `;

            // --- CALL THE GEMINI API ---
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
            const payload = { 
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const result = await response.json();
            const jsonResponseText = result.candidates[0].content.parts[0].text;
            const locations = JSON.parse(jsonResponseText);

            // --- UPDATE THE UI ---
            displayResults(locations);

        } catch (error) {
            console.error("Error generating itinerary:", error);
            resultsGrid.innerHTML = `<p class="text-red-500 text-center">Sorry, an error occurred. Please try again. Details: ${error.message}</p>`;
        } finally {
            // --- UI STATE: END LOADING ---
            loadingSpinner.classList.add('hidden');
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Find Places`;
        }
    }

    function displayResults(locations) {
        if (!locations || locations.length === 0) {
            resultsGrid.innerHTML = `<p class="text-center text-gray-400">The AI couldn't find any specific recommendations. Try being more specific with your interests!</p>`;
            return;
        }

        locations.forEach(location => {
            const card = document.createElement('div');
            card.className = 'result-card';

            // Use a placeholder image service to generate images from the AI's query
            const imageUrl = `https://placehold.co/600x400/1f2937/374151?text=${encodeURIComponent(location.imageQuery)}`;

            card.innerHTML = `
                <img src="${imageUrl}" alt="${location.name}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/1f2937/374151?text=Image+Not+Found';">
                <div class="result-card-content">
                    <h3>${location.name}</h3>
                    <p>${location.description}</p>
                </div>
            `;
            resultsGrid.appendChild(card);
        });
    }
});
