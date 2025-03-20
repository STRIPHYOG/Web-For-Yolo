// Starfield Animation
function createStarfield() {
    const stars = document.getElementById('stars');
    const stars2 = document.getElementById('stars2');
    const stars3 = document.getElementById('stars3');

    function generateStars(element, count) {
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.style.position = 'absolute';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.width = Math.random() * 3 + 'px';
            star.style.height = star.style.width;
            star.style.backgroundColor = 'white';
            star.style.borderRadius = '50%';
            element.appendChild(star);
        }
    }

    generateStars(stars, 200);
    generateStars(stars2, 100);
    generateStars(stars3, 50);
}

// Initialize cosmic effects
document.addEventListener('DOMContentLoaded', () => {
    createStarfield();
});

// Model Selection
let selectedModel = 'yolov8'; // Default model

document.getElementById('selectYOLOv5').addEventListener('click', () => {
    selectedModel = 'yolov5';
    alert('YOLOv5 selected!');
});

document.getElementById('selectYOLOv8').addEventListener('click', () => {
    selectedModel = 'yolov8';
    alert('YOLOv8 selected!');
});

document.getElementById('selectYOLOv9').addEventListener('click', () => {
    selectedModel = 'yolov9';
    alert('YOLOv9 selected!');
});

document.getElementById('selectYOLOv11').addEventListener('click', () => {
    selectedModel = 'yolov11';
    alert('YOLOv11 selected!');
});

// Handle image upload
document.getElementById('uploadImageButton').addEventListener('click', () => {
    const fileInput = document.getElementById('imageFileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an image file.');
        return;
    }

    // Display the uploaded image
    const reader = new FileReader();
    reader.onload = (e) => {
        const detectionOutput = document.getElementById('detectionOutput');
        detectionOutput.innerHTML = `
            <img src="${e.target.result}" alt="Uploaded Image">
        `;
        document.getElementById('processControls').style.display = 'block'; // Show Process button
    };
    reader.readAsDataURL(file);
});

// Handle video upload
document.getElementById('uploadVideoButton').addEventListener('click', () => {
    const fileInput = document.getElementById('videoFileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a video file.');
        return;
    }

    // Display the uploaded video
    const reader = new FileReader();
    reader.onload = (e) => {
        const detectionOutput = document.getElementById('detectionOutput');
        detectionOutput.innerHTML = `
            <video controls autoplay id="uploadedVideo">
                <source src="${e.target.result}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
        document.getElementById('processControls').style.display = 'block'; // Show Process button
    };
    reader.readAsDataURL(file);
});

// Handle process button
document.getElementById('processButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('imageFileInput').files[0] || document.getElementById('videoFileInput').files[0];
    if (!fileInput) {
        alert('Please upload an image or video first.');
        return;
    }

    // Show the progress bar
    const progressBar = document.getElementById('imageProgressBar');
    const progressBarInner = progressBar.querySelector('.progress-bar');
    progressBar.style.display = 'block';
    progressBarInner.style.width = '0%';

    // Upload the file
    const formData = new FormData();
    formData.append('input', fileInput);
    formData.append('model', selectedModel); // Send selected model

    const endpoint = fileInput.type.startsWith('image') ? '/process_image' : '/process_video';
    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
    });

    // Hide the progress bar
    progressBar.style.display = 'none';

    // Handle the response
    const result = await response.json();
    if (result.error) {
        alert(result.error); // Show error message
        return;
    }

    // Display the processed results
    const detectionOutput = document.getElementById('detectionOutput');
    if (fileInput.type.startsWith('image')) {
        detectionOutput.innerHTML = `
            <img src="data:image/jpeg;base64,${result.image_data}" alt="Processed Image">
            <p class="mt-3">Model: ${result.model} | Accuracy: ${result.metrics?.accuracy || 'N/A'} | Speed: ${result.metrics?.speed || 'N/A'} FPS</p>
        `;
    } else {
        detectionOutput.innerHTML = `
            <video controls autoplay id="processedVideo">
                <source src="data:video/mp4;base64,${result.video_data}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <p class="mt-3">Model: ${result.model} | Accuracy: ${result.metrics?.accuracy || 'N/A'} | Speed: ${result.metrics?.speed || 'N/A'} FPS</p>
        `;
    }
});
