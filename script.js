const POLLINATIONS_KEY = "pk_4lawhhbmjTjD4xdw";

document.addEventListener('DOMContentLoaded', () => {
    const modeBtns = document.querySelectorAll('.mode-btn');
    const userInput = document.getElementById('user-input');
    const generateBtn = document.getElementById('generate-btn');
    const outputArea = document.getElementById('output-area');
    const textOutput = document.getElementById('text-output');
    const imageContainer = document.getElementById('image-container');
    const imageLoader = document.getElementById('image-loader');

    let currentMode = 'insight';

    // Mode Selection Logic
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            
            // Update placeholder based on mode
            switch(currentMode) {
                case 'insight':
                    userInput.placeholder = "Enter a thought or topic (e.g., 'The future of time travel')...";
                    break;
                case 'builder':
                    userInput.placeholder = "Enter a simple image idea (e.g., 'A cat in space')...";
                    break;
                case 'explain':
                    userInput.placeholder = "Enter a complex concept (e.g., 'Quantum Entanglement')...";
                    break;
            }
        });
    });

    // Generate Logic
    generateBtn.addEventListener('click', async () => {
        const input = userInput.value.trim();
        if (!input) return;

        setLoading(true);
        outputArea.classList.remove('hidden');
        textOutput.textContent = "Generating text...";
        
        imageContainer.innerHTML = ''; // Clear previous images
        imageContainer.appendChild(imageLoader); // Ensure loader is present
        imageLoader.style.display = 'block';

        try {
            // 1. Generate Text
            const textResult = await fetchText(input, currentMode);
            textOutput.textContent = textResult;

            // 2. Generate Image based on text result
            const imagePrompt = constructImagePrompt(textResult, currentMode);
            await generateImage(imagePrompt, imageContainer);

        } catch (error) {
            textOutput.textContent = "Error: " + error.message;
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        generateBtn.disabled = isLoading;
        generateBtn.textContent = isLoading ? 'Processing...' : 'Generate';
    }

    async function fetchText(input, mode) {
        let systemPrompt = "";

        if (mode === 'insight') {
            systemPrompt =
              "You are a wise philosopher. Refine the user's input into a profound, concise insight (max 2 sentences).";
        } else if (mode === 'builder') {
            systemPrompt =
              "You are an expert prompt engineer. Convert the user's idea into a highly detailed, professional image generation prompt. Output ONLY the prompt text.";
        } else if (mode === 'explain') {
            systemPrompt =
              "You are a teacher explaining things to a 10-year-old. Explain the concept simply and clearly (max 3 sentences).";
        }

        const fullPrompt = `${systemPrompt}\nUser Input: ${input}`;

        const url =
          `https://gen.pollinations.ai/text/${encodeURIComponent(fullPrompt)}` +
          `?model=openai-fast&temperature=0.8&key=${POLLINATIONS_KEY}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Text generation failed");

        return (await response.text()).trim();
    }

    function constructImagePrompt(textResult, mode) {
        let prompt = textResult;

        if (mode === 'explain') {
            prompt += ", simple conceptual illustration, clean style";
        }

        return prompt.slice(0, 280); // safety clamp
    }

    async function generateImage(prompt, container) {
        const encoded = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 10000);

        // Models sorted by price (cheapest to highest)
        const models = [
            "gptimage",       // 0.000008
            "nanobanana",     // 0.00003
            "gptimage-large", // 0.000032
            "flux",           // 0.00012
            "nanobanana-pro", // 0.00012
            "zimage",         // 0.0002
            "turbo"           // 0.0003
        ];

        const img = new Image();
        img.loading = "lazy";
        img.alt = prompt;
        img.id = "image-output"; // Restore ID for CSS styling
        img.style.display = "block"; // Ensure it is visible
        
        let currentModelIndex = 0;

        const loadNextModel = async () => {
            if (currentModelIndex >= models.length) {
                console.warn("Authenticated attempts failed. Trying public endpoint fallback...");
                
                // Final fallback to public URL (no auth header needed)
                const publicUrl = `https://image.pollinations.ai/prompt/${encoded}?model=flux&width=512&height=512&nologo=true&seed=${seed}`;
                
                img.onerror = () => {
                    console.error("All image models failed");
                    imageLoader.style.display = "none";
                    img.replaceWith(document.createTextNode("⚠️ Image failed to load"));
                };
                
                img.src = publicUrl;
                return;
            }

            const model = models[currentModelIndex];
            const url =
              `https://gen.pollinations.ai/image/${encoded}` +
              `?model=${model}&width=512&height=512` +
              `&nologo=true&nofeed=true` +
              `&seed=${seed}` +
              `&key=${POLLINATIONS_KEY}`;

            try {
                // Debug log for manual testing
                console.log(`Debug CURL: curl "${url}"`);

                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const blob = await response.blob();
                img.src = URL.createObjectURL(blob);
            } catch (err) {
                console.warn(`Model ${model} failed: ${err.message}`);
                currentModelIndex++;
                loadNextModel();
            }
        };

        img.onload = () => {
            imageLoader.style.display = "none";
            img.classList.add('loaded'); // Add class for CSS transitions
        };
        img.onerror = () => {
            console.warn(`Model ${models[currentModelIndex]} image corrupt, trying next...`);
            currentModelIndex++;
            loadNextModel();
        };

        container.appendChild(img);
        loadNextModel();

        // IMPORTANT delay to avoid rate-limit
        await new Promise(r => setTimeout(r, 1300)); // rate-safe
    }
});