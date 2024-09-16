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

    fetch(`https://opsensemble.com:5000/projects/project_level/overview?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success' && data.project_data.settings) {
            const queueMode = data.project_data.settings.queue_mode || 'Off';  // Default to 'Off' if not found
            console.log("Queue mode fetched: ", queueMode);  // Log the queue mode
            updateQueueModeUI(queueMode);  // Update UI based on the mode
        } else {
            console.error('Error fetching queue mode:', data.message);
        }
    })
    .catch(error => {
        console.error('Error fetching queue status:', error);
    });
}

// Function to show or hide manual processing based on queue mode
function toggleManualProcessingVisibility(queueMode) {
    const manualProcessingSection = document.getElementById('manual-processing-container');
    
    if (queueMode === 'Manual') {
        manualProcessingSection.style.display = 'block';  // Show the section if mode is Manual
    } else {
        manualProcessingSection.style.display = 'none';  // Hide the section for other modes
    }
}

// Function to update button states based on selected queue mode
function updateQueueModeUI(queueMode) {
    console.log("Updating UI with queue mode: ", queueMode);  // Log queueMode for debugging

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
            console.log("Setting mode to Off");
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
            
            // IMPORTANT: Ensure manual mode is also turned Off when Queue Mode is Off
            updateManualMode('Off');
            break;

        case 'Manual':
            console.log("Setting mode to Manual");
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
            console.log("Setting mode to Auto");
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

            // IMPORTANT: Ensure manual mode is also turned Off when Queue Mode is Off
            updateManualMode('Off');
            break;

        case 'Auto-API':
            console.log("Setting mode to Auto-API");
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

            // IMPORTANT: Ensure manual mode is also turned Off when Queue Mode is Off
            updateManualMode('Off');
            break;
    }
    	
    // Toggle the visibility of the manual processing section
    toggleManualProcessingVisibility(queueMode);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchQueueStatus();  // Fetch the current queue mode and set the buttons
});



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

// Function to format the date for display (removing the milliseconds and Z)
function formatDateForDisplay(fullDate) {
    const dateObject = new Date(fullDate);  // Convert the full ISO date string to a Date object
    const formattedDate = dateObject.toISOString().substring(0, 19).replace('T', ' ');  // Format to 'YYYY-MM-DD HH:MM:SS'
    return formattedDate;
}

// Function to update the table rows with the simplified date for display
function updateTableWithFormattedDates() {
    const table = document.getElementById("imageTable");
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    
    rows.forEach(row => {
        const uploadedColumnIndex = getColumnIndex('uploaded');  // Get the index of the 'uploaded' column
        const uploadedCell = row.querySelector(`td:nth-child(${uploadedColumnIndex})`);
        const fullDate = uploadedCell.getAttribute('data-full-date');  // Get the full date from the 'data-full-date' attribute

        if (fullDate) {
            // Format and update the cell with the shorter display version of the date
            uploadedCell.textContent = formatDateForDisplay(fullDate);
        }
    });
}


// Helper function to format the date for display (removing the milliseconds and Z)
function formatDateForDisplay(fullDate) {
    const dateObject = new Date(fullDate);  // Convert the full ISO date string to a Date object
    const formattedDate = dateObject.toISOString().substring(0, 19).replace('T', ' ');  // Format to 'YYYY-MM-DD HH:MM:SS'
    return formattedDate;
}

// Function to fetch the metadata for each file
function fetchMetadata(file) {
    return fetch(`https://opsensemble.com:5000/projects/manage_input_files?project_id=${projectId}&file_name=${file}.json`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            return JSON.parse(data.metadata);
        } else {
            throw new Error('Metadata not found for file: ' + file);
        }
    });
}

// Full function to populate the table with files and metadata
function updateFileList() {
    console.log("updateFileList is running");

    fetch(`https://opsensemble.com:5000/projects/manage_input_files?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        console.log('Fetch response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Data fetched:', data);

        const imageTableBody = document.querySelector('#imageTable tbody');
        imageTableBody.innerHTML = ''; // Clear existing rows

        data.files.forEach((file) => {
            if (!file.endsWith('.json') && !file.endsWith('.keep')) {
                const row = document.createElement('tr');

                // Filename column
                const filenameCell = document.createElement('td');
                filenameCell.style.cursor = 'pointer';
                filenameCell.textContent = file.split(/[/\\]/).pop();  // Extract filename
                filenameCell.addEventListener('click', () => previewImageAndMetadata(file));
                row.appendChild(filenameCell);

                // Fetch Metadata for each file
                fetchMetadata(file).then(metadata => {
                    // Uploaded column with full date for sorting and formatted date for display
                    const uploadedCell = document.createElement('td');
                    uploadedCell.setAttribute('data-full-date', metadata.upload_time);  // Store full ISO date for sorting
                    uploadedCell.textContent = formatDateForDisplay(metadata.upload_time);  // Display formatted date
                    row.appendChild(uploadedCell);

                    // Size (MB) column
                    const sizeCell = document.createElement('td');
                    sizeCell.textContent = metadata.size || 'Unknown';  // Display the file size
                    sizeCell.setAttribute('data-size-bytes', metadata.size_bytes);  // Add the size in bytes for sorting
                    row.appendChild(sizeCell);

                    // Failed column
                    const failedCell = document.createElement('td');
                    failedCell.textContent = metadata.failed || '0';  // Display failure status
                    row.appendChild(failedCell);

                    // Select column with a checkbox
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
                }).catch(error => {
                    console.error('Error fetching metadata:', error);
                });
            }
        });
    })
    .catch(error => {
        console.error('Error fetching files:', error);
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


// Event listener for the "Show quarantined only" checkbox
document.getElementById('showQuarantinedInput').addEventListener('change', function() {
    const showQuarantinedOnly = this.checked;
    filterQuarantinedFiles(showQuarantinedOnly);
});

// Function to filter rows based on the "Failed" column value
function filterQuarantinedFiles(showQuarantinedOnly) {
    const table = document.getElementById("imageTable");
    const rows = Array.from(table.querySelectorAll("tbody tr"));

    rows.forEach(row => {
        const failedColumnIndex = getColumnIndex('failed');  // Reusing getColumnIndex function
        const failedValue = parseInt(row.querySelector(`td:nth-child(${failedColumnIndex})`).textContent.trim(), 10);

        if (showQuarantinedOnly) {
            // Show rows where 'Failed' value is greater than 0
            if (failedValue > 0) {
                row.style.display = "";  // Show the row
            } else {
                row.style.display = "none";  // Hide the row
            }
        } else {
            // If the checkbox is unchecked, show all rows
            row.style.display = "";  // Show all rows
        }
    });
}


// To track current sort direction for each column
let sortDirection = {
    filename: 'none',  // 'asc' or 'desc'
    uploaded: 'none',
    size: 'none',
    failed: 'none'
};

// Function to sort the table based on the column and direction (asc/desc)
function sortTable(column, direction) {
    const table = document.getElementById("imageTable");
    const tbody = table.querySelector("tbody");

    const rows = Array.from(tbody.querySelectorAll("tr"));

    const sortedRows = rows.sort((a, b) => {
        const aValue = getCellValue(a, column);
        const bValue = getCellValue(b, column);

        // Sorting logic for each specific column type
        if (column === 'uploaded') {
            // Sort by date (full date)
            const fullDateA = a.querySelector(`td:nth-child(${getColumnIndex('uploaded')})`).getAttribute('data-full-date');
            const fullDateB = b.querySelector(`td:nth-child(${getColumnIndex('uploaded')})`).getAttribute('data-full-date');

            const dateA = new Date(fullDateA);
            const dateB = new Date(fullDateB);

            return direction === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (column === 'size') {
            // Sort by file size in bytes (stored in data-size-bytes attribute)
            const sizeA = parseInt(a.querySelector(`td:nth-child(${getColumnIndex('size')})`).getAttribute('data-size-bytes'), 10);
            const sizeB = parseInt(b.querySelector(`td:nth-child(${getColumnIndex('size')})`).getAttribute('data-size-bytes'), 10);

            return direction === 'asc' ? sizeA - sizeB : sizeB - sizeA;
        } else if (column === 'filename') {
            // Sort by filename alphabetically
            return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else if (column === 'failed') {
            // Sort by failure count (numeric)
            const failedA = parseInt(aValue, 10);
            const failedB = parseInt(bValue, 10);

            return direction === 'asc' ? failedA - failedB : failedB - failedA;
        }
    });

    // Re-append sorted rows to the table body
    sortedRows.forEach(row => tbody.appendChild(row));

    // Update sort icons
    updateSortIcons(column, direction);
}


// Helper function to extract the correct value for sorting from the row
function getCellValue(row, column) {
    const columnIndex = getColumnIndex(column);  // Get the correct column index
    const cell = row.querySelector(`td:nth-child(${columnIndex})`);

    if (column === 'size') {
        // Return the size in bytes for the size column, which is stored in the data-size-bytes attribute
        return parseInt(cell.getAttribute('data-size-bytes'), 10) || 0;
    }

    if (column === 'uploaded') {
        // Return the full date string for sorting
        return cell.getAttribute('data-full-date') || '';
    }

    // Default case: return the cell's text content for other columns (like filename and failed)
    return cell.textContent.trim().toLowerCase();
}


// Helper function to extract the byte value from the size string
function extractBytes(sizeText) {
    const match = sizeText.match(/\((\d+)\sbytes\)/);  // Extract number inside parentheses
    return match ? parseInt(match[1]) : 0;  // Return the extracted number or 0 if not found
}

// Helper function to get the column index based on the column name
function getColumnIndex(column) {
    switch (column) {
        case 'filename':
            return 1;
        case 'uploaded':
            return 2;
        case 'size':
            return 3;
        case 'failed':
            return 4;
        default:
            return 1;
    }
}

// Function to update the sort icons based on the current sort direction
function updateSortIcons(column, direction) {
    // Reset all icons to their default state
    document.querySelectorAll('.sort-icon').forEach(icon => {
        icon.classList.remove('active');
    });

    // Activate the relevant icon (based on direction)
    const activeIcon = document.querySelector(`th[data-column="${column}"] .sort-icon.${direction}`);
    if (activeIcon) {
        activeIcon.classList.add('active');  // Add the active class to the sorted direction
    }
}

// Add event listeners to the sort icons for sorting
document.querySelectorAll('.sort-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const column = icon.closest('th').getAttribute('data-column');
        const direction = icon.classList.contains('asc') ? 'asc' : 'desc';
        sortTable(column, direction);
    });
});





// Fetch the project JSON and ensure queue_mode and manual_mode are separate
function fetchProjectJSON() {
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
            document.getElementById('project-json').textContent = jsonString;  // Display JSON in the element
            
            // Now handle queue_mode and manual_mode separately
            const queueMode = data.project_data.settings?.queue_mode || 'Off';  // Queue mode from Overview tab
            const manualMode = data.project_data.settings?.manual_mode || 'Off';  // Manual mode from Input tab

            console.log(`Queue Mode: ${queueMode}`);
            console.log(`Manual Mode: ${manualMode}`);

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


// Function to handle Input tab buttons
document.querySelectorAll('#Input .input-mode-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons in the Input tab
        document.querySelectorAll('#Input .input-mode-btn').forEach(btn => btn.classList.remove('active'));

        // Add active class to the clicked button
        button.classList.add('active');

        // Get the selected mode (either 'Off' or 'Processing')
        const selectedMode = button.textContent.trim() === 'Off' ? 'Off' : 'Processing';

        // Update the UI immediately to reflect the selected mode
        updateInputModeUI(selectedMode);

        // Update the manual_mode in the project settings
        updateManualMode(selectedMode);
    });
});

// Function to update the manual_mode in the project JSON (without affecting queue_mode)
function updateManualMode(manualMode) {
    const projectId = new URLSearchParams(window.location.search).get('project_id'); // Fetch the project_id from URL

    fetch(`https://opsensemble.com:5000/projects/project_level/queue_pv?project_id=${projectId}`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),  // Use JWT for authentication
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            project_id: projectId,
            manual_mode: manualMode  // Send the updated manual_mode
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log(`Manual Mode updated to: ${manualMode}`);
        } else {
            console.error('Error updating manual mode:', data.message);
        }
    })
    .catch(error => {
        console.error('Error updating manual mode:', error);
    });
}

// Function to update the UI for Input tab buttons
function updateInputModeUI(inputMode) {
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
    } else if (inputMode === 'Processing') {
        // On state (Red Off, Green Process Files)
        processFilesButton.classList.add('active');
        processFilesButton.style.backgroundColor = '#4caf50'; // Green for active 'Process Files'
        processFilesButton.style.color = '#fff'; // White text for active 'Process Files'
        processFilesButton.style.border = '2px solid black'; // Solid border for active button

        offButton.style.backgroundColor = '#f44336'; // Red for 'Off'
        offButton.style.color = '#fff'; // White text for Off
    }
}

// Function to fetch the current manual_mode from the JSON and update the UI accordingly
function fetchManualModeAndSetUI() {
    const projectId = new URLSearchParams(window.location.search).get('project_id'); // Fetch project_id from URL

    fetch(`https://opsensemble.com:5000/projects/project_level/overview?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),  // Use JWT for authentication
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success' && data.project_data.settings) {
            const manualMode = data.project_data.settings.manual_mode || 'Off';  // Default to 'Off' if not found

            // Update UI based on the manual_mode value
            updateInputModeUI(manualMode);
        } else {
            console.error('Error fetching project settings:', data.message);
        }
    })
    .catch(error => {
        console.error('Error fetching manual_mode:', error);
    });
}

// Call the fetch function when the page loads or the Input tab is opened
document.addEventListener('DOMContentLoaded', () => {
    fetchManualModeAndSetUI();  // Fetch the manual_mode and set the UI when the page loads
});
