document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    // PASTE YOUR GEMINI API KEY HERE
    const GEMINI_API_KEY = "AIzaSyDyY3X1_10WfL7VlHFS85Jn2_H-vVm0hag";

    // --- DOM ELEMENTS ---
    const generateBtn = document.getElementById('generate-btn');
    const locationInput = document.getElementById('location-input');
    const interestsInput = document.getElementById('interests-input');
    const resultsSection = document.getElementById('results-section');
    const loadingSpinner = document.getElementById('loading-spinner');
    const itineraryOutput = document.getElementById('itinerary-output');
    const mapContainer = document.getElementById('map-container');
    const mapFrame = document.getElementById('map-frame');

    // --- EVENT LISTENER ---
    generateBtn.addEventListener('click', generateItinerary);

    // --- MAIN FUNCTION ---
    async function generateItinerary() {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "AIzaSyDyY3X1_10WfL7VlHFS85Jn2_H-vVm0hag") {
            alert("ERROR: Please paste your Gemini API key into the script.js file.");
            return;
        }

        const location = locationInput.value.trim();
        const interests = interestsInput.value.trim();

        if (!location || !interests) {
            alert("Please fill in both your location and interests.");
            return;
        }

        // --- UI STATE: START LOADING ---
        resultsSection.classList.remove('hidden');
        loadingSpinner.classList.remove('hidden');
        itineraryOutput.classList.add('hidden');
        mapContainer.classList.add('hidden');
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating...`;

        try {
            // --- CONSTRUCT THE AI PROMPT ---
            const prompt = `
                You are "Myathra", an expert local tour guide for Kerala, India.
                A user is currently at "${location}" and is interested in "${interests}".

                Your tasks are:
                1.  Create a short, friendly, and practical tour itinerary for them. Include a creative title, a welcoming intro, and 2-3 specific, real tourist spots or activities near their location that match their interests. For each spot, provide a brief, appealing description.
                2.  At the very end of your response, on a new line, write "MAP_QUERY:" followed by a simple, effective Google Maps search query that would show these locations. For example: "MAP_QUERY:Tourist places near Kodakara, Kerala".

                Keep the itinerary text engaging and easy to read.
            `;

            // --- CALL THE GEMINI API ---
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
            const payload = { contents: [{ parts: [{ text: prompt }] }] };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const result = await response.json();
            const fullResponseText = result.candidates[0].content.parts[0].text;

            // --- PARSE THE RESPONSE ---
            const parts = fullResponseText.split("MAP_QUERY:");
            const itineraryText = parts[0].trim();
            const mapQuery = parts[1] ? parts[1].trim() : `Tourist places near ${location}`;

            // --- UPDATE THE UI ---
            itineraryOutput.textContent = itineraryText;
            updateMap(mapQuery);

            itineraryOutput.classList.remove('hidden');
            mapContainer.classList.remove('hidden');

        } catch (error) {
            console.error("Error generating itinerary:", error);
            itineraryOutput.textContent = `Sorry, an error occurred. Please try again.\n\nDetails: ${error.message}`;
            itineraryOutput.classList.remove('hidden');
        } finally {
            // --- UI STATE: END LOADING ---
            loadingSpinner.classList.add('hidden');
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Find Places`;
        }
    }

    function updateMap(query) {
        // Use Google Maps Embed API
        const encodedQuery = encodeURIComponent(query);
        const mapUrl = `https://www.google.com/maps/embed/v1/search?key=${GEMINI_API_KEY}&q=${encodedQuery}`;
        mapFrame.src = mapUrl;
    }
});
