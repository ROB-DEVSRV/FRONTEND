// Function to open the selected tab
function openTab(evt, tabName) {
    console.log("Opening tab: ", tabName);  // Check which tab is being opened

    const tabcontent = document.getElementsByClassName("tab-content");
    const tablinks = document.getElementsByClassName("tablinks");

    // Hide all tab content
    for (let i = 0; i < tabcontent.length; i++) {
        console.log("Hiding tab content: ", tabcontent[i].id);  // Debug each tab being hidden
        tabcontent[i].style.display = "none";
    }

    // Remove the active class from all buttons
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the selected tab's content
    const selectedTab = document.getElementById(tabName);
    console.log("Showing tab: ", selectedTab.id);  // Confirm the correct tab is shown
    selectedTab.style.display = 'block';

    // Add the active class to the clicked button
    evt.currentTarget.className += " active";

    // If the Input tab is opened, update the file list
    if (tabName === 'Input') {
        console.log("Input tab opened, updating file list");
        updateFileList();  // Update the file list whenever the Input tab is opened
    }
}

// Call updateFileList when the page loads for the first time
document.addEventListener('DOMContentLoaded', function() {
    console.log("Page loaded, calling updateFileList");
    updateFileList();  // Ensure that file list is populated on page load
});

document.getElementById('Overview').style.display = 'block';  // Set Overview as default tab

// Queue Mode Button Handling
document.querySelectorAll('.queue-mode-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.queue-mode-btn').forEach(btn => btn.classList.remove('active'));

        // Add active class to the clicked button
        button.classList.add('active');

        // Save the selected mode to the project JSON
        const selectedMode = button.textContent.trim();  // Get mode from button text
        saveQueueMode(selectedMode);  // Save mode via fetch to backend
    });
});

function saveQueueMode(queueMode) {
    const projectId = new URLSearchParams(window.location.search).get('project_id'); // Getting project_id from URL

    fetch(`https://opsensemble.com:5000/projects/project_level/queue_pv?project_id=${projectId}`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),  // Use JWT for authentication
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            project_id: projectId,
            queue_mode: queueMode // Sending the selected queue mode
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log('Queue mode saved successfully.');
            updateQueueModeUI(queueMode);
        } else {
            console.error('Error saving queue mode:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function fetchQueueStatus() {
    const projectId = new URLSearchParams(window.location.search).get('project_id');

    fetch(`https://opsensemble.com:5000/projects/project_level/queue_pv?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Update the buttons UI based on the queue mode
            updateQueueModeUI(data.queue_mode);
        }
    })
    .catch(error => {
        console.error('Error fetching queue status:', error);
    });
}

// Function to update button states based on selected queue mode
function updateQueueModeUI(queueMode) {
    const buttons = document.querySelectorAll('.queue-mode-btn');
    
    // Reset all buttons to the default state (background color, opacity, text color)
    buttons.forEach(button => {
        button.classList.remove('active');
        button.disabled = false;
        button.style.opacity = "1.0";
        button.style.color = '#fff'; // Reset text color to default (white)
    });

    // Apply the logic from the truth table
    switch (queueMode) {
        case 'Off':
            document.getElementById('off-btn').classList.add('active');
            document.getElementById('off-btn').style.backgroundColor = '#4caf50';
            document.getElementById('off-btn').style.opacity = "1.0";

            document.getElementById('manual-btn').style.backgroundColor = '#ccc';
            document.getElementById('manual-btn').style.opacity = "1.0";
            document.getElementById('manual-btn').style.color = '#333'; // Grey text for disabled manual

            document.getElementById('auto-btn').style.backgroundColor = '#ccc';
            document.getElementById('auto-btn').style.opacity = "1.0";
            document.getElementById('auto-btn').style.color = '#333'; // Grey text for disabled auto

            document.getElementById('autoapi-btn').style.backgroundColor = '#ccc';
            document.getElementById('autoapi-btn').style.opacity = "1.0";
            document.getElementById('autoapi-btn').style.color = '#333'; // Grey text for disabled auto-api
            break;

        case 'Manual':
            document.getElementById('manual-btn').classList.add('active');
            document.getElementById('manual-btn').style.backgroundColor = '#4caf50';  // Green when active
            document.getElementById('manual-btn').style.opacity = "1.0";

            document.getElementById('off-btn').style.backgroundColor = '#f44336';
            document.getElementById('off-btn').style.opacity = "1.0";
            document.getElementById('off-btn').style.color = '#fff'; // Ensure white text on red

            document.getElementById('auto-btn').style.backgroundColor = '#e0e0e0';
            document.getElementById('auto-btn').style.opacity = "0.8";
            document.getElementById('auto-btn').style.color = '#fff'; // Grey text for disabled auto
            document.getElementById('auto-btn').disabled = true;

            document.getElementById('autoapi-btn').style.backgroundColor = '#e0e0e0';
            document.getElementById('autoapi-btn').style.opacity = "0.8";
            document.getElementById('autoapi-btn').style.color = '#fff'; // Grey text for disabled auto-api
            document.getElementById('autoapi-btn').disabled = true;
            break;

        case 'Auto':
            document.getElementById('auto-btn').classList.add('active');
            document.getElementById('auto-btn').style.backgroundColor = '#4caf50';  // Green when active
            document.getElementById('auto-btn').style.opacity = "1.0";

            document.getElementById('off-btn').style.backgroundColor = '#f44336';
            document.getElementById('off-btn').style.opacity = "1.0";
            document.getElementById('off-btn').style.color = '#fff'; // Ensure white text on red

            document.getElementById('manual-btn').style.backgroundColor = '#e0e0e0';
            document.getElementById('manual-btn').style.opacity = "0.8";
            document.getElementById('manual-btn').style.color = '#fff'; // Grey text for disabled manual
            document.getElementById('manual-btn').disabled = true;

            document.getElementById('autoapi-btn').style.backgroundColor = '#e0e0e0';
            document.getElementById('autoapi-btn').style.opacity = "0.8";
            document.getElementById('autoapi-btn').style.color = '#fff'; // Grey text for disabled auto-api
            document.getElementById('autoapi-btn').disabled = true;
            break;

        case 'Auto-API':
            document.getElementById('autoapi-btn').classList.add('active');
            document.getElementById('autoapi-btn').style.backgroundColor = '#4caf50';  // Green when active
            document.getElementById('autoapi-btn').style.opacity = "1.0";

            document.getElementById('off-btn').style.backgroundColor = '#f44336';
            document.getElementById('off-btn').style.opacity = "1.0";
            document.getElementById('off-btn').style.color = '#fff'; // Ensure white text on red

            document.getElementById('manual-btn').style.backgroundColor = '#e0e0e0';
            document.getElementById('manual-btn').style.opacity = "0.8";
            document.getElementById('manual-btn').style.color = '#fff'; // Grey text for disabled manual
            document.getElementById('manual-btn').disabled = true;

            document.getElementById('auto-btn').style.backgroundColor = '#e0e0e0';
            document.getElementById('auto-btn').style.opacity = "0.8";
            document.getElementById('auto-btn').style.color = '#fff'; // Grey text for disabled auto
            document.getElementById('auto-btn').disabled = true;
            break;
    }
}

// Fetch the initial queue mode when the page loads
fetchQueueStatus();



// Function to open sub-tabs within the Queueing tab
function openSubTab(evt, subTabName) {
    var i, subtabcontent, subtablinks;
    subtabcontent = document.getElementsByClassName("sub-tab-content");
    for (i = 0; i < subtabcontent.length; i++) {
        subtabcontent[i].style.display = "none";  // Hide all sub-tab content
    }
    subtablinks = document.getElementsByClassName("sub-tablinks");
    for (i = 0; i < subtablinks.length; i++) {
        subtablinks[i].className = subtablinks[i].className.replace(" active", "");
    }
    document.getElementById(subTabName).style.display = "block";  // Show the selected sub-tab content
    evt.currentTarget.className += " active";  // Mark the clicked sub-tab as active
}

// Fetch project details on page load
const token = localStorage.getItem('token');
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('project_id');

if (!token) {
    console.log('No token found.');
} else {
    // Fetch project details (top section)
    fetch(`https://opsensemble.com:5000/projects/get_details?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('greeting').innerText = `Hello, ${data.user.name}`;
            document.getElementById('projects-token').innerText = `Projects Account Number: ${data.projects_token}`;
            document.getElementById('project-id').innerText = `Project ID: ${projectId}`;
            document.getElementById('project-name').innerText = `Project Name: ${data.project.project_name || 'Unnamed Project'}`;
        }
    })
    .catch(error => {
        console.error('Error fetching project details:', error);
    });

    // Fetch input files (lower section)
    fetch(`https://opsensemble.com:5000/projects/manage_input_files?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        const imageTableBody = document.querySelector('#imageTable tbody');
        imageTableBody.innerHTML = ''; // Clear existing rows

        data.files.forEach((file) => {
            if (!file.endsWith('.json') && !file.endsWith('.keep')) { // Exclude JSON and .keep files
                const row = document.createElement('tr');
                const filenameCell = document.createElement('td');
                const actionsCell = document.createElement('td');

                filenameCell.style.cursor = 'pointer';
                filenameCell.textContent = file.split(/[/\\]/).pop();  // Handles both forward and backslashes


                filenameCell.addEventListener('click', () => {
                    previewImageAndMetadata(file);
                    highlightSelectedFile(row);
                });

                const trashIcon = document.createElement('span');
                trashIcon.innerHTML = '🗑️';
                trashIcon.style.cursor = 'pointer';
                trashIcon.addEventListener('click', () => {
                    const folderName = getFolderName(file);
                    deleteFolder(folderName);
                });

                actionsCell.appendChild(trashIcon);
                row.appendChild(filenameCell);
                row.appendChild(actionsCell);
                imageTableBody.appendChild(row);
            }
        });
    })
    .catch(error => {
        console.error('Error fetching files:', error);
    });

    // Handle file upload
    document.getElementById('imageUpload').addEventListener('change', function(event) {
        const files = event.target.files;
        const formData = new FormData();
        
        Array.from(files).forEach(file => {
            formData.append('files', file);
            formData.append('lastModified', file.lastModified);
        });

        fetch(`https://opsensemble.com:5000/projects/manual_upload_files?project_id=${projectId}`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Files uploaded successfully');
                updateFileList();
                document.getElementById('imageUpload').value = '';
            } else {
                alert('Error uploading files: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error during file upload:', error);
            alert('Error uploading files');
        });
    });
}

function updateFileList() {
    console.log("updateFileList is running"); // To check if the function is being called

    fetch(`https://opsensemble.com:5000/projects/manage_input_files?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        console.log('Fetch response status:', response.status);  // Log the status of the fetch response
        return response.json();
    })
    .then(data => {
        console.log('Data fetched:', data);  // Log the fetched data to see if it's correct

        const imageTableBody = document.querySelector('#imageTable tbody');
        imageTableBody.innerHTML = ''; // Clear existing rows

        data.files.forEach((file) => {
            console.log('Processing file:', file);  // Log each file being processed

            if (!file.endsWith('.json') && !file.endsWith('.keep')) {
                const row = document.createElement('tr');

                // Filename column
                const filenameCell = document.createElement('td');
                filenameCell.style.cursor = 'pointer';
                filenameCell.textContent = file.split(/[/\\]/).pop();  // Extract filename
                filenameCell.addEventListener('click', () => previewImageAndMetadata(file));
                row.appendChild(filenameCell);

                // Add a log to check if static values are being populated
                console.log('Adding static data for uploaded and size fields');

                // Uploaded column (for now, using static data as placeholder)
                const uploadedCell = document.createElement('td');
                uploadedCell.textContent = '2024-09-12T21:00:21';  // Example uploaded date (replace with actual data)
                row.appendChild(uploadedCell);

                // Size (MB) column (using static data as placeholder)
                const sizeCell = document.createElement('td');
                sizeCell.textContent = '1.2';  // Example file size in MB (replace with actual data)
                row.appendChild(sizeCell);

                // Quarantined column (for now, static data as placeholder)
                const quarantinedCell = document.createElement('td');
                quarantinedCell.textContent = '0';  // Example quarantine status (replace with actual data)
                row.appendChild(quarantinedCell);

                // Select column with checkbox
                const selectCell = document.createElement('td');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                selectCell.appendChild(checkbox);
                row.appendChild(selectCell);

                // Actions column (bin icon)
                const actionsCell = document.createElement('td');
                const trashIcon = document.createElement('span');
                trashIcon.innerHTML = '🗑️';
                trashIcon.style.cursor = 'pointer';
                trashIcon.addEventListener('click', () => {
                    const folderName = getFolderName(file);
                    deleteFolder(folderName);
                });
                actionsCell.appendChild(trashIcon);
                row.appendChild(actionsCell);

                // Append the row to the table body
                imageTableBody.appendChild(row);
            }
        });
    })
    .catch(error => {
        console.error('Error fetching files:', error);  // Log errors during the fetch request
    });
}




function highlightSelectedFile(row) {
    const rows = document.querySelectorAll('#imageTable tr');
    rows.forEach(r => r.classList.remove('selected-file'));
    row.classList.add('selected-file');
}

function getFolderName(fileName) {
    return fileName.split('/')[0];
}

function deleteFolder(folderName) {
    const sanitizedFolderName = getFolderName(folderName);
    const confirmed = confirm('Are you sure you want to delete this folder and all its contents?');
    if (!confirmed) return;

    fetch(`https://opsensemble.com:5000/projects/delete_file`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            project_id: projectId,
            file_name: sanitizedFolderName
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Folder deleted successfully');
            updateFileList();
            document.getElementById('imagePreview').style.display = 'none';
            document.getElementById('formattedMetadata').innerHTML = '';
        } else {
            alert('Error deleting folder: ' + data.message);
        }
    })
    .catch(error => {
        alert('Error deleting folder');
    });
}

function previewImageAndMetadata(fileName) {
    const imageUrl = `https://opsensemble.com:5000/projects/manage_input_files?project_id=${projectId}&file_name=${fileName}`;
    const metadataUrl = `https://opsensemble.com:5000/projects/manage_input_files?project_id=${projectId}&file_name=${fileName}.json`;

    fetch(imageUrl, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch image for preview');
        }
        return response.blob();
    })
    .then(blob => {
        const imageURL = URL.createObjectURL(blob);
        document.getElementById('previewImage').src = imageURL;
        document.getElementById('imagePreview').style.display = 'block';
    })
    .catch(error => {
        alert('Error loading image preview.');
    });

    fetch(metadataUrl, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch metadata');
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success' && data.metadata) {
            const formattedMetadata = formatMetadata(JSON.parse(data.metadata));
            document.getElementById('formattedMetadata').innerHTML = formattedMetadata;
        } else {
            document.getElementById('formattedMetadata').textContent = "No metadata available.";
        }
    })
    .catch(error => {
        document.getElementById('formattedMetadata').textContent = 'Error loading metadata.';
    });
}

function formatMetadata(metadata) {
    return `
        <div class="metadata-item"><span>Upload Time:</span> ${metadata.upload_time || 'N/A'}</div>    
        <div class="metadata-item"><span>Filename:</span> ${metadata.filename}</div>
        <div class="metadata-item"><span>Full Path:</span> ${metadata.full_path}</div>
        <div class="metadata-item"><span>MIME Type:</span> ${metadata.mime_type}</div>
        <div class="metadata-item"><span>Created:</span> ${metadata.created}</div>
        <div class="metadata-item"><span>Size:</span> ${metadata.size}</div>
        <div class="metadata-item"><span>Last Modified:</span> ${metadata.last_modified}</div>
        <div class="metadata-item"><span>Resolution:</span> ${metadata.resolution ? metadata.resolution.join('x') : 'N/A'}</div>
        <div class="metadata-item"><span>Pixel Count:</span> ${metadata.pixel_count}</div>
        <div class="metadata-item"><span>Aspect Ratio:</span> ${metadata.aspect_ratio}</div>
        <div class="metadata-item"><span>Color Depth:</span> ${metadata.color_depth || 'N/A'}</div>
        <div class="metadata-item"><span>Bit Depth:</span> ${metadata.bit_depth || 'N/A'}</div>
        <div class="metadata-item"><span>File Hash:</span> ${metadata.file_hash}</div>
        <div class="metadata-item"><span>Upload Source:</span> ${metadata.upload_source}</div>
        <div class="metadata-item"><span>Compression Type:</span> ${metadata.compression_type || 'N/A'}</div>
        <div class="metadata-item"><span>Compression Ratio:</span> ${metadata.compression_ratio || 'N/A'}</div>
    `;
}

function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("fileSelectionTable");
    switching = true;
    dir = "asc"; 

    while (switching) {
        switching = false;
        rows = table.rows;

        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;

            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];

            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

function fetchProjectJSON() {
    // Get the projectId dynamically from the URL or another source
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project_id');  // Fetch the project_id from the URL

    if (!projectId) {
        document.getElementById('project-json').textContent = "Error: Project ID not found in URL.";
        return;
    }

    fetch(`https://opsensemble.com:5000/projects/project_level/overview?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')  // Use JWT for authentication
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch project JSON');
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            const jsonString = JSON.stringify(data.project_data, null, 2);  // Format JSON with indentation
            document.getElementById('project-json').textContent = jsonString;  // Display JSON
        } else {
            document.getElementById('project-json').textContent = "Error: " + data.message;
        }
    })
    .catch(error => {
        document.getElementById('project-json').textContent = "Error fetching project JSON: " + error.message;
    });
}

// Auto-refresh the Project JSON every 0.5 seconds
setInterval(fetchProjectJSON, 500);  // Refresh JSON section every 500ms

// Start polling for queue status updates
//startPollingQueueStatus();

// Polling interval in milliseconds (5 seconds)
const POLLING_INTERVAL = 5000;

function startPollingQueueStatus() {
    setInterval(fetchQueueStatus, POLLING_INTERVAL);
}

function fetchQueueStatus() {
    const projectId = new URLSearchParams(window.location.search).get('project_id');

    fetch(`https://opsensemble.com:5000/projects/project_level/queue_pv?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            updateQueueModeUI(data.queue_mode);
        }
    })
    .catch(error => {
        console.error('Error fetching queue status:', error);
    });
}

// Function to handle Input tab buttons
document.querySelectorAll('#Input .input-mode-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons in the Input tab
        document.querySelectorAll('#Input .input-mode-btn').forEach(btn => btn.classList.remove('active'));

        // Add active class to the clicked button
        button.classList.add('active');

        // Get the selected mode (either 'Off' or 'Process Files')
        const selectedMode = button.textContent.trim();
        
        // Update the Input tab UI based on the selected mode
        updateInputModeUI(selectedMode);
    });
});

// Function to update the UI for Input tab buttons
function updateInputModeUI(inputMode) {
    // Get the buttons in the Input tab
    const offButton = document.querySelector('#Input .stop-processing-files-btn');
    const processFilesButton = document.querySelector('#Input .process-files-btn');

    // Reset buttons to default state
    offButton.classList.remove('active');
    processFilesButton.classList.remove('active');
    offButton.style.border = 'none';
    processFilesButton.style.border = 'none';

    // Apply the logic based on the selected mode
    if (inputMode === 'Off') {
        // Off state (Green Off, Grey Process Files)
        offButton.classList.add('active');
        offButton.style.backgroundColor = '#4caf50'; // Green for active 'Off'
        offButton.style.color = '#fff'; // White text for active 'Off'
        offButton.style.border = '2px solid black'; // Solid border for active button

        processFilesButton.style.backgroundColor = '#ccc'; // Grey for inactive Process Files
        processFilesButton.style.color = '#333'; // Grey text for inactive Process Files
    } else if (inputMode === 'Process Files') {
        // On state (Red Off, Green Process Files)
        processFilesButton.classList.add('active');
        processFilesButton.style.backgroundColor = '#4caf50'; // Green for active 'Process Files'
        processFilesButton.style.color = '#fff'; // White text for active 'Process Files'
        processFilesButton.style.border = '2px solid black'; // Solid border for active button

        offButton.style.backgroundColor = '#f44336'; // Red for 'Off'
        offButton.style.color = '#fff'; // White text for Off
    }
}
