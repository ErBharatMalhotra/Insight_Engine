document.addEventListener('DOMContentLoaded', () => {
    const modeBtns = document.querySelectorAll('.mode-btn');
    const userInput = document.getElementById('user-input');
    const generateBtn = document.getElementById('generate-btn');
    const outputArea = document.getElementById('output-area');
    const textOutput = document.getElementById('text-output');
    const imageOutput = document.getElementById('image-output');
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
        imageOutput.classList.remove('loaded');
        imageLoader.style.display = 'block';

        try {
            // 1. Generate Text
            const textResult = await fetchText(input, currentMode);
            textOutput.textContent = textResult;

            // 2. Generate Image based on text result
            const imagePrompt = constructImagePrompt(textResult, currentMode);
            await generateImage(imagePrompt);

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
            systemPrompt = "You are a wise philosopher. Refine the user's input into a profound, concise insight (max 2 sentences).";
        } else if (mode === 'builder') {
            systemPrompt = "You are an expert prompt engineer. Convert the user's idea into a highly detailed, professional image generation prompt. Output ONLY the prompt text.";
        } else if (mode === 'explain') {
            systemPrompt = "You are a teacher explaining things to a 10-year-old. Explain the concept simply and clearly (max 3 sentences).";
        }

        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: input }
                ],
                seed: Math.floor(Math.random() * 1000) // Random seed for variety
            })
        });

        if (!response.ok) throw new Error('Failed to fetch text');
        return await response.text();
    }

    function constructImagePrompt(textResult, mode) {
        // We use the generated text to drive the image generation
        // For 'builder', the text IS the prompt.
        // For others, we might want to append style keywords if needed, 
        // but Pollinations is smart enough to handle the raw text usually.
        return encodeURIComponent(textResult);
    }

    function generateImage(encodedPrompt) {
        return new Promise((resolve, reject) => {
            // Add random seed to URL to prevent caching same images
            const randomSeed = Math.floor(Math.random() * 10000);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?n=${randomSeed}`;
            
            imageOutput.onload = () => {
                imageOutput.classList.add('loaded');
                imageLoader.style.display = 'none';
                resolve();
            };
            imageOutput.onerror = () => reject(new Error('Image failed to load'));
            imageOutput.src = imageUrl;
        });
    }
});