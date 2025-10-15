// Tab Functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Initialize first tab as active
    showTab('text-to-image');

    // Add click event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            showTab(tabId);
        });
    });

    function showTab(tabId) {
        // Remove active class from all tabs and panes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        // Add active class to clicked tab and corresponding pane
        const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
        const activePane = document.getElementById(tabId);

        if (activeButton && activePane) {
            activeButton.classList.add('active');
            activePane.classList.add('active');
        }
    }
});

// File Upload Functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('image-upload');
    const previewArea = document.getElementById('preview-area');
    const previewImg = document.getElementById('preview-img');

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // Click to upload functionality
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function handleFileSelect(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB.');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            uploadArea.style.display = 'none';
            previewArea.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Remove uploaded image
function removeImage() {
    const uploadArea = document.getElementById('upload-area');
    const previewArea = document.getElementById('preview-area');
    const fileInput = document.getElementById('image-upload');
    
    uploadArea.style.display = 'block';
    previewArea.style.display = 'none';
    fileInput.value = '';
}

// Generate Image Function
function generateImage() {
    const promptInput = document.getElementById('prompt-input');
    const styleSelect = document.getElementById('style-select');
    const qualitySelect = document.getElementById('quality-select');
    const generateButton = document.querySelector('.generate-button');
    const fileInput = document.getElementById('image-upload');
    
    // Get form values
    const prompt = promptInput.value.trim();
    const style = styleSelect.value;
    const quality = qualitySelect.value;
    
    // Validate input
    if (!prompt) {
        alert('Please enter a description for your image.');
        promptInput.focus();
        return;
    }

    if (prompt.length < 10) {
        alert('Please provide a more detailed description (at least 10 characters).');
        promptInput.focus();
        return;
    }

    // Show loading state
    const originalContent = generateButton.innerHTML;
    generateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Generating...</span>';
    generateButton.disabled = true;

    // Prepare data for the webhook
    const requestData = {
        prompt: prompt,
        style: style,
        quality: quality,
        timestamp: new Date().toISOString(),
        hasReferenceImage: fileInput.files.length > 0
    };

    // Send request to n8n webhook
    fetch('https://n8n.srv901848.hstgr.cloud/webhook-test/text-to-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Reset button state
        generateButton.innerHTML = originalContent;
        generateButton.disabled = false;
        
        // Show success message
        showNotification('Image generation request sent successfully!', 'success');
        
        // Log the response for debugging
        console.log('Webhook response:', data);
        
        // Here you can handle the response data
        // For example, if the API returns an image URL, you could display it
        if (data.imageUrl) {
            displayGeneratedImage(data.imageUrl);
        }
    })
    .catch(error => {
        // Reset button state
        generateButton.innerHTML = originalContent;
        generateButton.disabled = false;
        
        // Show error message
        showNotification(`Error: ${error.message}`, 'error');
        
        console.error('Error calling webhook:', error);
    });
}

// Function to display generated image (if the API returns an image URL)
function displayGeneratedImage(imageUrl) {
    // Create a results section if it doesn't exist
    let resultsSection = document.querySelector('.results-section');
    if (!resultsSection) {
        resultsSection = document.createElement('div');
        resultsSection.className = 'results-section';
        resultsSection.innerHTML = `
            <div class="content-header">
                <h2>Generated Image</h2>
            </div>
            <div class="generated-image-container">
                <img id="generated-image" src="" alt="Generated Image" style="display: none;">
            </div>
        `;
        
        // Insert after the action section
        const actionSection = document.querySelector('.action-section');
        actionSection.parentNode.insertBefore(resultsSection, actionSection.nextSibling);
    }
    
    // Show the generated image
    const generatedImage = document.getElementById('generated-image');
    generatedImage.src = imageUrl;
    generatedImage.style.display = 'block';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                z-index: 1000;
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }
            
            .notification-success {
                border-left: 4px solid #28a745;
            }
            
            .notification-error {
                border-left: 4px solid #dc3545;
            }
            
            .notification-info {
                border-left: 4px solid #17a2b8;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #6c757d;
                padding: 0;
                margin-left: auto;
            }
            
            .notification-close:hover {
                color: #495057;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Form validation and enhancement
document.addEventListener('DOMContentLoaded', function() {
    const promptInput = document.getElementById('prompt-input');
    
    // Character counter
    const charCounter = document.createElement('div');
    charCounter.className = 'char-counter';
    charCounter.style.cssText = `
        text-align: right;
        font-size: 0.9rem;
        color: #6c757d;
        margin-top: 0.5rem;
    `;
    promptInput.parentElement.appendChild(charCounter);
    
    function updateCharCounter() {
        const length = promptInput.value.length;
        const maxLength = 500;
        charCounter.textContent = `${length}/${maxLength} characters`;
        
        if (length > maxLength * 0.9) {
            charCounter.style.color = '#dc3545';
        } else if (length > maxLength * 0.7) {
            charCounter.style.color = '#ffc107';
        } else {
            charCounter.style.color = '#6c757d';
        }
    }
    
    promptInput.addEventListener('input', updateCharCounter);
    promptInput.maxLength = 500;
    
    // Auto-resize textarea
    promptInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeTab = document.querySelector('.tab-pane.active');
        if (activeTab && activeTab.id === 'text-to-image') {
            generateImage();
        }
    }
    
    // Tab switching with number keys
    if (e.altKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                showTab('text-to-image');
                break;
            case '2':
                e.preventDefault();
                showTab('text-to-video');
                break;
            case '3':
                e.preventDefault();
                showTab('image-to-video');
                break;
        }
    }
});

// Utility function to show tab (accessible from global scope)
function showTab(tabId) {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Remove active class from all tabs and panes
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));

    // Add active class to clicked tab and corresponding pane
    const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
    const activePane = document.getElementById(tabId);

    if (activeButton && activePane) {
        activeButton.classList.add('active');
        activePane.classList.add('active');
    }
}
