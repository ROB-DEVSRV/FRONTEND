function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}

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

document.getElementById('Input').style.display = 'block';

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
                filenameCell.textContent = file;

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
    fetch(`https://opsensemble.com:5000/projects/manage_input_files?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        const imageTableBody = document.querySelector('#imageTable tbody');
        imageTableBody.innerHTML = '';

        data.files.forEach((file) => {
            if (!file.endsWith('.json') && !file.endsWith('.keep')) {
                const row = document.createElement('tr');
                const filenameCell = document.createElement('td');
                const actionsCell = document.createElement('td');

                filenameCell.style.cursor = 'pointer';
                filenameCell.textContent = file;
                filenameCell.addEventListener('click', () => previewImageAndMetadata(file));

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
