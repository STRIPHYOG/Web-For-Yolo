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
    selectedModel = 'yolov8'; // Set YOLOv8 as the default model on page load
});

// Model Selection
let selectedModel = null; // Force selection before processing videos

function selectModel(model) {
    selectedModel = model;
    alert(`${model.toUpperCase()} selected!`);
}

document.getElementById('selectYOLOv5').addEventListener('click', () => selectModel('yolov5'));
document.getElementById('selectYOLOv8').addEventListener('click', () => selectModel('yolov8'));
document.getElementById('selectYOLOv9').addEventListener('click', () => selectModel('yolov9'));
document.getElementById('selectYOLOv11').addEventListener('click', () => selectModel('yolov11'));

// Handle image upload
document.getElementById('uploadImageButton').addEventListener('click', () => {
    const fileInput = document.getElementById('imageFileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('detectionOutput').innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;
        document.getElementById('processControls').style.display = 'block'; // Show Process button
    };
    reader.readAsDataURL(file);
});

// Handle video upload (forces model selection)
document.getElementById('uploadVideoButton').addEventListener('click', () => {
    const fileInput = document.getElementById('videoFileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a video file.');
        return;
    }

    if (!selectedModel) {
        alert('Please select a model before processing the video.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('detectionOutput').innerHTML = `
            <video controls autoplay id="uploadedVideo">
                <source src="${e.target.result}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
        document.getElementById('processControls').style.display = 'block';
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

    if (!selectedModel) {
        alert('Please select a model before processing.');
        return;
    }

    // Show the progress bar
    const progressBar = document.getElementById('imageProgressBar');
    const progressBarInner = progressBar.querySelector('.progress-bar');
    progressBar.style.display = 'block';
    progressBarInner.style.width = '0%';

    const formData = new FormData();
    formData.append('input', fileInput);
    formData.append('model', selectedModel);

    const endpoint = fileInput.type.startsWith('image') ? '/process_image' : '/process_video';
    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
    });

    progressBar.style.display = 'none';

    const result = await response.json();
    if (result.error) {
        alert(result.error);
        return;
    }

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

// Prevent form resubmission on reload
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

// Clear file input fields on page load
window.onload = function () {
    document.getElementById('imageFileInput').value = '';
    document.getElementById('videoFileInput').value = '';
};

// Handle image upload and processing
document.getElementById('uploadImageButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('imageFileInput');
    if (fileInput.files.length === 0) {
        alert('Please select an image file first.');
        return;
    }

    const formData = new FormData();
    formData.append('input', fileInput.files[0]);

    const response = await fetch('/process_image', {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();

    if (data.error) {
        alert(`Error: ${data.error}`);
        return;
    }

    document.getElementById('modelName').textContent = data.model || 'N/A';
    document.getElementById('modelAccuracy').textContent = data.metrics?.accuracy || 'N/A';
    document.getElementById('modelSpeed').textContent = data.metrics?.speed || 'N/A';

    document.getElementById('processedImage').src = `data:image/jpeg;base64,${data.image_data}`;
    document.getElementById('processedImage').style.display = 'block';
    document.getElementById('processedVideo').style.display = 'none';
});

// Handle video upload and processing
document.getElementById('uploadVideoButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('videoFileInput');
    if (fileInput.files.length === 0) {
        alert('Please select a video file first.');
        return;
    }

    if (!selectedModel) {
        alert('Please select a model before processing the video.');
        return;
    }

    const formData = new FormData();
    formData.append('input', fileInput.files[0]);

    const response = await fetch('/process_video', {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();

    if (data.error) {
        alert(`Error: ${data.error}`);
        return;
    }

    document.getElementById('modelName').textContent = data.model || 'N/A';
    document.getElementById('modelAccuracy').textContent = data.metrics?.accuracy || 'N/A';
    document.getElementById('modelSpeed').textContent = data.metrics?.speed || 'N/A';

    document.getElementById('processedVideo').src = `/download/${data.video_path}`;
    document.getElementById('processedVideo').style.display = 'block';
    document.getElementById('processedImage').style.display = 'none';
});
