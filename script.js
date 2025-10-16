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
        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showNotification('Please select a valid image file (JPG, PNG, GIF, etc.)', 'error');
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showNotification('File size must be less than 10MB.', 'error');
                return;
            }

            // Validate file size (min 1KB)
            if (file.size < 1024) {
                showNotification('File size is too small. Please select a valid image.', 'error');
                return;
            }

            console.log('File selected:', file.name, file.type, file.size, 'bytes');

            // Create preview
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    console.log('FileReader loaded, setting preview image...');
                    
                    // Clear any existing src first
                    previewImg.src = '';
                    
                    // Set the new src
                    previewImg.src = e.target.result;
                    
                    // Add load event listener to confirm image loaded
                    previewImg.onload = function() {
                        console.log('Preview image loaded successfully');
                        uploadArea.style.display = 'none';
                        previewArea.style.display = 'block';
                        showNotification(`Image uploaded successfully: ${file.name}`, 'success');
                    };
                    
                    // Add error event listener for image loading
                    previewImg.onerror = function() {
                        console.error('Preview image failed to load');
                        showNotification('Image preview failed to load', 'error');
                        // Reset to upload area
                        uploadArea.style.display = 'block';
                        previewArea.style.display = 'none';
                    };
                    
                } catch (error) {
                    console.error('Error creating preview:', error);
                    showNotification('Error creating image preview', 'error');
                }
            };
            
            reader.onerror = function() {
                console.error('Error reading file:', reader.error);
                showNotification('Error reading the selected file', 'error');
            };
            
            reader.readAsDataURL(file);
            
        } catch (error) {
            console.error('Error handling file selection:', error);
            showNotification('Error processing the selected file', 'error');
        }
    }
});

// Remove uploaded image
function removeImage() {
    const uploadArea = document.getElementById('upload-area');
    const previewArea = document.getElementById('preview-area');
    const fileInput = document.getElementById('image-upload');
    const previewImg = document.getElementById('preview-img');
    
    // Clear the image src
    previewImg.src = '';
    
    uploadArea.style.display = 'block';
    previewArea.style.display = 'none';
    fileInput.value = '';
    
    console.log('Image removed, reset to upload area');
}

// Debug function for image preview
function debugImagePreview() {
    const previewImg = document.getElementById('preview-img');
    const fileInput = document.getElementById('image-upload');
    
    console.log('=== IMAGE PREVIEW DEBUG ===');
    console.log('Preview image element:', previewImg);
    console.log('Preview image src:', previewImg.src);
    console.log('Preview image complete:', previewImg.complete);
    console.log('Preview image naturalWidth:', previewImg.naturalWidth);
    console.log('Preview image naturalHeight:', previewImg.naturalHeight);
    console.log('File input files length:', fileInput.files.length);
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        console.log('File details:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        });
    }
    
    console.log('=== END DEBUG ===');
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

    // Prepare FormData for the webhook (to include file upload)
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('style', style);
    formData.append('quality', quality);
    formData.append('timestamp', new Date().toISOString());
    formData.append('userAgent', navigator.userAgent);
    formData.append('screenResolution', `${screen.width}x${screen.height}`);
    formData.append('language', navigator.language);
    
    // Add the uploaded image file if it exists
    if (fileInput.files.length > 0) {
        const imageFile = fileInput.files[0];
        
        // Append the file with proper field name and filename
        formData.append('referenceImage', imageFile, imageFile.name);
        formData.append('hasReferenceImage', 'true');
        formData.append('imageFileName', imageFile.name);
        formData.append('imageFileSize', imageFile.size.toString());
        formData.append('imageFileType', imageFile.type);
        
        console.log('Image file added:', {
            name: imageFile.name,
            size: imageFile.size,
            type: imageFile.type,
            lastModified: imageFile.lastModified
        });
        
        // Also add base64 version as backup
        const reader = new FileReader();
        reader.onload = function(e) {
            formData.append('referenceImageBase64', e.target.result);
        };
        reader.readAsDataURL(imageFile);
        
    } else {
        formData.append('hasReferenceImage', 'false');
        console.log('No image file selected');
    }

    // Send request to n8n webhook
    const webhookUrl = 'https://n8n.srv901848.hstgr.cloud/webhook-test/text-to-image';
    
    console.log('Sending request to:', webhookUrl);
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`${key}:`, {
                name: value.name,
                size: value.size,
                type: value.type,
                lastModified: value.lastModified
            });
        } else {
            console.log(`${key}:`, value);
        }
    }
    
    // Additional debug: Check if FormData has the file
    console.log('FormData has referenceImage:', formData.has('referenceImage'));
    console.log('File input files length:', fileInput.files.length);
    if (fileInput.files.length > 0) {
        console.log('First file details:', {
            name: fileInput.files[0].name,
            size: fileInput.files[0].size,
            type: fileInput.files[0].type
        });
    }
    
    // Try multiple approaches for sending data
    const fetchOptions = {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit', // Don't send cookies
        headers: {
            // Don't set Content-Type for FormData - let browser set it with boundary
        }
    };
    
    console.log('Fetch options:', fetchOptions);
    console.log('About to send request to:', webhookUrl);
    
    // Function to attempt the request
    function attemptRequest(options, attemptNumber = 1) {
        console.log(`=== ATTEMPT ${attemptNumber} ===`);
        console.log('URL:', webhookUrl);
        console.log('Options:', options);
        
        return fetch(webhookUrl, options)
        .then(response => {
            console.log(`Attempt ${attemptNumber} - Response status:`, response.status);
            console.log(`Attempt ${attemptNumber} - Response headers:`, response.headers);
            
            if (!response.ok) {
                // Try to get error message from response
                return response.text().then(text => {
                    throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
                });
            }
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            } else {
                return response.text();
            }
        })
        .then(data => {
            // Reset button state
            generateButton.innerHTML = originalContent;
            generateButton.disabled = false;
            
            // Show success message
            showNotification('Image generation request sent successfully!', 'success');
            
            // Log the response for debugging
            console.log(`Attempt ${attemptNumber} - Webhook response:`, data);
            
            // Handle the response data
            if (typeof data === 'object' && data.imageUrl) {
                displayGeneratedImage(data.imageUrl);
            } else if (typeof data === 'object' && data.message) {
                console.log('Workflow message:', data.message);
            }
        })
        .catch(error => {
            console.error(`Attempt ${attemptNumber} failed:`, error);
            
            // If this is the first attempt and it's a network error, try a fallback
            if (attemptNumber === 1 && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
                console.log('First attempt failed with network error, trying fallback...');
                
                // Fallback: Try without FormData (send as JSON with base64 image)
                const fallbackData = {
                    prompt: prompt,
                    style: style,
                    quality: quality,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    screenResolution: `${screen.width}x${screen.height}`,
                    language: navigator.language,
                    hasReferenceImage: fileInput.files.length > 0
                };
                
                if (fileInput.files.length > 0) {
                    // Convert image to base64
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        fallbackData.referenceImageBase64 = e.target.result;
                        fallbackData.imageFileName = fileInput.files[0].name;
                        fallbackData.imageFileSize = fileInput.files[0].size.toString();
                        fallbackData.imageFileType = fileInput.files[0].type;
                        
                        console.log('Fallback data prepared with base64 image');
                        
                        // Try the fallback request
                        attemptRequest({
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(fallbackData),
                            mode: 'cors',
                            credentials: 'omit'
                        }, 2);
                    };
                    reader.onerror = function() {
                        console.error('Failed to read image for base64 conversion');
                        // Try without image
                        attemptRequest({
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(fallbackData),
                            mode: 'cors',
                            credentials: 'omit'
                        }, 2);
                    };
                    reader.readAsDataURL(fileInput.files[0]);
                } else {
                    // No image, try JSON request
                    console.log('Fallback data prepared without image');
                    attemptRequest({
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(fallbackData),
                        mode: 'cors',
                        credentials: 'omit'
                    }, 2);
                }
            } else {
                // Final attempt failed or not a network error
                generateButton.innerHTML = originalContent;
                generateButton.disabled = false;
                
                // Show detailed error message
                console.error('Final error details:', error);
                showNotification(`Error: ${error.message}`, 'error');
                
                // Additional debugging info
                console.error('Request URL:', webhookUrl);
                console.error('Final attempt number:', attemptNumber);
            }
        });
    }
    
    // Start with the first attempt
    attemptRequest(fetchOptions);
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

// Test webhook function (for debugging)
function testWebhook() {
    const webhookUrl = 'https://n8n.srv901848.hstgr.cloud/webhook-test/text-to-image';
    console.log('=== WEBHOOK TEST START ===');
    console.log('Testing webhook URL:', webhookUrl);
    console.log('Current page URL:', window.location.href);
    console.log('Protocol:', window.location.protocol);
    
    // Test 0: Check if URL is reachable with different methods
    console.log('Test 0: Checking URL accessibility');
    
    // Test with no-cors mode first
    fetch(webhookUrl, {
        method: 'GET',
        mode: 'no-cors'
    })
    .then(response => {
        console.log('No-CORS test completed (response will be opaque)');
        console.log('Response type:', response.type);
        
        // Now try with CORS
        console.log('Test 1: GET request with CORS');
        return fetch(webhookUrl, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit'
        });
    })
    .then(response => {
        console.log('GET test response status:', response.status);
        console.log('GET test response headers:', response.headers);
        return response.text();
    })
    .then(data => {
        console.log('GET test response data:', data);
        showNotification('Webhook GET test successful!', 'success');
        
        // Test 2: POST with JSON
        console.log('Test 2: POST with JSON');
        return fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ test: 'data', timestamp: new Date().toISOString() }),
            mode: 'cors',
            credentials: 'omit'
        });
    })
    .then(response => {
        console.log('POST JSON test response status:', response.status);
        console.log('POST JSON test response headers:', response.headers);
        return response.text();
    })
    .then(data => {
        console.log('POST JSON test response data:', data);
        showNotification('Webhook POST JSON test successful!', 'success');
        
        // Test 3: POST with FormData (no file)
        console.log('Test 3: POST with FormData (no file)');
        const testFormData = new FormData();
        testFormData.append('test', 'data');
        testFormData.append('timestamp', new Date().toISOString());
        
        return fetch(webhookUrl, {
            method: 'POST',
            body: testFormData,
            mode: 'cors',
            credentials: 'omit'
        });
    })
    .then(response => {
        console.log('POST FormData test response status:', response.status);
        console.log('POST FormData test response headers:', response.headers);
        return response.text();
    })
    .then(data => {
        console.log('POST FormData test response data:', data);
        showNotification('Webhook POST FormData test successful!', 'success');
        console.log('=== WEBHOOK TEST COMPLETE ===');
    })
    .catch(error => {
        console.error('Webhook test error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        showNotification(`Webhook test failed: ${error.message}`, 'error');
        console.log('=== WEBHOOK TEST FAILED ===');
    });
}

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

// Simple connectivity test
function simpleTest() {
    const webhookUrl = 'https://n8n.srv901848.hstgr.cloud/webhook-test/text-to-image';
    
    // Try opening in new window first
    console.log('Opening webhook URL in new window...');
    const newWindow = window.open(webhookUrl, '_blank');
    
    // Also try with XMLHttpRequest as fallback
    setTimeout(() => {
        console.log('Trying XMLHttpRequest...');
        const xhr = new XMLHttpRequest();
        xhr.open('GET', webhookUrl, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                console.log('XMLHttpRequest status:', xhr.status);
                console.log('XMLHttpRequest response:', xhr.responseText);
                if (xhr.status === 200) {
                    showNotification('Webhook is reachable via XMLHttpRequest!', 'success');
                } else {
                    showNotification(`XMLHttpRequest failed: ${xhr.status}`, 'error');
                }
            }
        };
        xhr.onerror = function() {
            console.error('XMLHttpRequest error');
            showNotification('XMLHttpRequest failed: Network error', 'error');
        };
        xhr.send();
    }, 1000);
}

// Add test buttons for debugging (remove in production)
document.addEventListener('DOMContentLoaded', function() {
    // Add a test button for debugging webhook connectivity
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Webhook';
    testButton.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #28a745;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        z-index: 1000;
    `;
    testButton.onclick = testWebhook;
    document.body.appendChild(testButton);
    
    // Add a simple test button
    const simpleTestButton = document.createElement('button');
    simpleTestButton.textContent = 'Simple Test';
    simpleTestButton.style.cssText = `
        position: fixed;
        top: 50px;
        right: 10px;
        background: #007bff;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        z-index: 1000;
    `;
    simpleTestButton.onclick = simpleTest;
    document.body.appendChild(simpleTestButton);
    
    // Add an image debug button
    const imageDebugButton = document.createElement('button');
    imageDebugButton.textContent = 'Debug Image';
    imageDebugButton.style.cssText = `
        position: fixed;
        top: 90px;
        right: 10px;
        background: #ffc107;
        color: black;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        z-index: 1000;
    `;
    imageDebugButton.onclick = debugImagePreview;
    document.body.appendChild(imageDebugButton);
});
