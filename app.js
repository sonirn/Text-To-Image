// Initialize Janus Pro Model
const janusModel = new JanusPro(); // Replace with actual model initialization

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAZKtnnm3hc6ViJLSLhV7PK8calqELiL_4",
    authDomain: "magic-image-ai-15a0d.firebaseapp.com",
    databaseURL: "https://magic-image-ai-15a0d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "magic-image-ai-15a0d",
    storageBucket: "magic-image-ai-15a0d.firebasestorage.app",
    messagingSenderId: "864109068756",
    appId: "1:864109068756:web:2d680b0c0d5b791f32d641"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const database = firebase.database();

async function generateImage() {
    const prompt = document.getElementById('prompt').value;
    const loading = document.getElementById('loading');
    
    try {
        loading.classList.remove('hidden');
        
        // Generate image using Janus Pro model
        const generatedImage = await janusModel.generate(prompt);
        
        // Upload to Firebase Storage
        const storageRef = storage.ref(`images/${Date.now()}.png`);
        await storageRef.put(generatedImage);
        
        // Get download URL
        const downloadURL = await storageRef.getDownloadURL();
        
        // Save to Realtime Database
        await database.ref('images').push({
            prompt,
            url: downloadURL,
            timestamp: Date.now()
        });
        
        // Refresh gallery
        loadGallery();
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loading.classList.add('hidden');
    }
}

async function loadGallery() {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    
    const snapshot = await database.ref('images').once('value');
    const images = Object.values(snapshot.val() || {});
    
    images.forEach(img => {
        gallery.innerHTML += `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                <img src="${img.url}" alt="${img.prompt}" class="w-full h-64 object-cover">
                <div class="p-4">
                    <p class="text-gray-700 mb-2">${img.prompt}</p>
                    <a href="${img.url}" download 
                        class="bg-purple-600 text-white px-4 py-2 rounded-lg block text-center hover:bg-purple-700">
                        Download ⬇️
                    </a>
                </div>
            </div>
        `;
    });
}

// Initial gallery load
loadGallery();
