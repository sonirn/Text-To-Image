// app.js
// Replace with your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAZKtnnm3hc6ViJLSLhV7PK8calqELiL_4",
    authDomain: "magic-image-ai-15a0d.firebaseapp.com",
    projectId: "magic-image-ai-15a0d",
    storageBucket: "magic-image-ai-15a0d.firebasestorage.app",
    messagingSenderId: "864109068756",
    appId: "1:864109068756:web:2d680b0c0d5b791f32d641"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Elements
const promptInput = document.querySelector('.prompt-input');
const generateBtn = document.querySelector('.generate-btn');
const gallery = document.getElementById('gallery');

// Janus Pro API Configuration
const JANUS_PRO_API_KEY = 'sk-4bd6535dbe254768be64b798cb53e623'; // Replace with your Janus Pro API key
const JANUS_PRO_API_URL = 'https://api.januspro.com/generate'; // Replace with the actual API endpoint

// Generate Image using Janus Pro API
async function generateImage(prompt) {
    try {
        const response = await fetch(JANUS_PRO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JANUS_PRO_API_KEY}`
            },
            body: JSON.stringify({
                prompt: prompt,
                width: 512, // Adjust based on API requirements
                height: 512, // Adjust based on API requirements
                quality: 'high' // Adjust based on API requirements
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate image');
        }

        const data = await response.json();
        return {
            imageUrl: data.imageUrl, // Replace with the actual response field for the image URL
            prompt: prompt
        };
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}

// Save Image to Firebase
async function saveImage(imageUrl, prompt) {
    const imageRef = storage.ref().child(`images/${Date.now()}.jpg`);
    
    // Fetch and upload image
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    await imageRef.put(blob);
    
    // Get download URL
    const downloadUrl = await imageRef.getDownloadURL();
    
    // Save to Firestore
    await db.collection('images').add({
        url: downloadUrl,
        prompt: prompt,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return downloadUrl;
}

// Load Gallery Images
function loadGallery() {
    db.collection('images').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        gallery.innerHTML = '';
        snapshot.forEach(doc => {
            const image = doc.data();
            const card = document.createElement('div');
            card.className = 'image-card';
            card.innerHTML = `
                <img src="${image.url}" alt="${image.prompt}">
                <sl-button class="download-btn" variant="success">
                    Download
                </sl-button>
            `;
            
            card.querySelector('sl-button').addEventListener('click', () => {
                window.open(image.url, '_blank');
            });
            
            gallery.appendChild(card);
        });
    });
}

// Generate Button Click
generateBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;
    
    generateBtn.loading = true;
    
    try {
        const { imageUrl } = await generateImage(prompt);
        await saveImage(imageUrl, prompt);
        promptInput.value = '';
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate image. Please try again.');
    }
    
    generateBtn.loading = false;
});

// Initial Load
loadGallery();
