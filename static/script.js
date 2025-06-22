document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const predictButton = document.getElementById('predictButton');
    const buttonText = document.querySelector('.button-text');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const previewSection = document.getElementById('previewSection');
    const imagePreview = document.getElementById('imagePreview');
    const resultSection = document.getElementById('resultSection');
    const errorSection = document.getElementById('errorSection');
    const fileInputText = document.querySelector('.file-input-text');

    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file) {
            // Update file input text
            fileInputText.textContent = file.name;
            
            // Enable predict button
            predictButton.disabled = false;
            
            // Show image preview
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                previewSection.style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            // Hide previous results
            hideResults();
        } else {
            // Reset if no file selected
            resetForm();
        }
    });

    // Handle form submission
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const file = fileInput.files[0];
        if (!file) {
            showError('Please select an image file.');
            return;
        }

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/bmp'];
        if (!allowedTypes.includes(file.type)) {
            showError('Please select a valid image file (PNG, JPG, JPEG, GIF, or BMP).');
            return;
        }

        // Validate file size (16MB max)
        const maxSize = 16 * 1024 * 1024;
        if (file.size > maxSize) {
            showError('File size too large. Maximum size is 16MB.');
            return;
        }

        // Show loading state
        setLoadingState(true);
        hideResults();

        // Create form data
        const formData = new FormData();
        formData.append('file', file);

        // Make prediction request
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            setLoadingState(false);
            
            if (data.success) {
                showResult(data);
            } else {
                showError(data.error || 'An error occurred during prediction.');
            }
        })
        .catch(error => {
            setLoadingState(false);
            console.error('Error:', error);
            showError('Network error. Please try again.');
        });
    });

    function setLoadingState(isLoading) {
        if (isLoading) {
            buttonText.style.display = 'none';
            loadingSpinner.style.display = 'inline';
            predictButton.disabled = true;
        } else {
            buttonText.style.display = 'inline';
            loadingSpinner.style.display = 'none';
            predictButton.disabled = false;
        }
    }

    function showResult(data) {
        const animalIcon = document.getElementById('animalIcon');
        const predictionText = document.getElementById('predictionText');
        const confidenceFill = document.getElementById('confidenceFill');
        const confidenceText = document.getElementById('confidenceText');

        // Set animal icon
        animalIcon.textContent = data.prediction === 'cat' ? '🐱' : '🐶';
        
        // Set prediction text
        predictionText.textContent = `This is a ${data.prediction.toUpperCase()}!`;
        
        // Set confidence bar
        confidenceFill.style.width = `${data.confidence}%`;
        confidenceText.textContent = `${data.confidence}% confident`;
        
        // Show result section
        resultSection.style.display = 'block';
        errorSection.style.display = 'none';
        
        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    function showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        
        errorSection.style.display = 'block';
        resultSection.style.display = 'none';
        
        // Scroll to error
        errorSection.scrollIntoView({ behavior: 'smooth' });
    }

    function hideResults() {
        resultSection.style.display = 'none';
        errorSection.style.display = 'none';
    }

    function resetForm() {
        fileInputText.textContent = 'Choose an image file';
        predictButton.disabled = true;
        previewSection.style.display = 'none';
        hideResults();
    }

    // Drag and drop functionality
    const fileInputLabel = document.querySelector('.file-input-label');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileInputLabel.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        fileInputLabel.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileInputLabel.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        fileInputLabel.style.borderColor = '#667eea';
        fileInputLabel.style.backgroundColor = '#f8f9ff';
    }

    function unhighlight(e) {
        fileInputLabel.style.borderColor = '#ddd';
        fileInputLabel.style.backgroundColor = '';
    }

    fileInputLabel.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            fileInput.files = files;
            fileInput.dispatchEvent(new Event('change'));
        }
    }
});