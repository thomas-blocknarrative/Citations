document.getElementById('citationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    generateCitation();
});

document.getElementById('copyButton').addEventListener('click', function() {
    const button = this;
    const originalText = button.textContent;
    
    navigator.clipboard.writeText(document.getElementById('citationOutput').textContent)
        .then(() => {
            button.textContent = 'Copied';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        })
        .catch(err => console.error('Failed to copy:', err));
});

// Reset button for author field
document.querySelector('.icon-button').addEventListener('click', function() {
    document.getElementById('authors').value = '';
});

function getFormattedDate() {
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const day = document.getElementById('day').value;

    if (!year) return '';

    if (!month && !day) return year;
    if (!day) return `${year}-${month.padStart(2, '0')}`;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function generateCitation() {
    // Check basic fields first
    const type = document.getElementById('citationType').value;
    const authors = document.getElementById('authors').value;
    const year = document.getElementById('year').value;
    const title = document.getElementById('title').value;
    const style = document.getElementById('citationStyle').value;

    // Basic validation - only check year, not month or day
    if (!type || !authors || !year || !title || !style) {
        alert('Please fill in all required fields');
        return;
    }

    let details;
    // Validate and gather type-specific fields
    try {
        switch(type) {
            case 'journal':
                if (!document.getElementById('journalName').value || !document.getElementById('pages').value) {
                    alert('Please fill in all required fields');
                    return;
                }
                details = {
                    journalName: document.getElementById('journalName').value,
                    volume: document.getElementById('volume').value || '',
                    issue: document.getElementById('issue').value || '',
                    pages: document.getElementById('pages').value
                };
                break;

            case 'book':
                if (!document.getElementById('publisher').value || !document.getElementById('location').value) {
                    alert('Please fill in all required fields');
                    return;
                }
                details = {
                    publisher: document.getElementById('publisher').value,
                    location: document.getElementById('location').value,
                    edition: document.getElementById('edition').value || ''
                };
                break;

            case 'bookChapter':
                if (!document.getElementById('bookTitle').value || 
                    !document.getElementById('publisher').value || 
                    !document.getElementById('location').value || 
                    !document.getElementById('pages').value) {
                    alert('Please fill in all required fields');
                    return;
                }
                details = {
                    bookTitle: document.getElementById('bookTitle').value,
                    editors: document.getElementById('editors').value || '',
                    publisher: document.getElementById('publisher').value,
                    location: document.getElementById('location').value,
                    pages: document.getElementById('pages').value
                };
                break;

            case 'website':
                if (!document.getElementById('websiteName').value || 
                    !document.getElementById('url').value || 
                    !document.getElementById('accessDate').value) {
                    alert('Please fill in all required fields');
                    return;
                }
                details = {
                    websiteName: document.getElementById('websiteName').value,
                    url: document.getElementById('url').value,
                    accessDate: document.getElementById('accessDate').value
                };
                break;

            case 'conference':
                if (!document.getElementById('conferenceName').value || 
                    !document.getElementById('location').value) {
                    alert('Please fill in all required fields');
                    return;
                }
                details = {
                    conferenceName: document.getElementById('conferenceName').value,
                    location: document.getElementById('location').value,
                    organizer: document.getElementById('organizer').value || ''
                };
                break;
        }

        // Get the formatted date
        const date = getFormattedDate();
        const authorList = authors.split(';').map(author => author.trim());

        // Generate the citation based on style
        let citation = '';
        switch(style) {
            case 'apa':
                citation = generateAPACitation(authorList, date, title, details, type);
                break;
            case 'mla':
                citation = generateMLACitation(authorList, date, title, details, type);
                break;
            case 'chicago':
                citation = generateChicagoCitation(authorList, date, title, details, type);
                break;
        }

        // Display the citation
        document.getElementById('citationOutput').textContent = citation;
        document.getElementById('result').classList.remove('hidden');

    } catch (error) {
        console.error('Error generating citation:', error);
        alert('An error occurred while generating the citation. Please try again.');
    }
}

// Add the New Citation button functionality
document.getElementById('newCitationButton').addEventListener('click', function() {
    // Clear all input fields
    document.getElementById('citationForm').reset();
    
    // Clear the dynamic fields
    const publicationFieldsContainer = document.getElementById('publicationFields');
    publicationFieldsContainer.innerHTML = '';
    
    // Hide the result section
    document.getElementById('result').classList.add('hidden');
    
    // Reset the copy button
    const copyButton = document.getElementById('copyButton');
    copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
    copyButton.classList.remove('copied');
});

function generateAPACitation(authors, date, title, details, type) {
    let citation = '';
    
    if (authors.length === 1) {
        citation += `${authors[0]}.`;
    } else if (authors.length === 2) {
        citation += `${authors[0]} & ${authors[1]}.`;
    } else if (authors.length > 2) {
        citation += `${authors[0]} et al.`;
    }

    citation += ` (${date}). `;
    
    switch(type) {
        case 'journal':
            citation += `${title}. `;
            citation += `${details.journalName}`;
            if (details.volume) citation += `, ${details.volume}`;
            if (details.issue) citation += `(${details.issue})`;
            if (details.pages) citation += `, ${details.pages}`;
            citation += '.';
            break;
            
        case 'book':
            citation += `${title}. `;
            if (details.edition && details.edition !== '1') {
                citation += `(${details.edition} ed.). `;
            }
            citation += `${details.publisher}`;
            if (details.location) {
                citation += `, ${details.location}`;
            }
            citation += '.';
            break;
            
        case 'bookChapter':
            citation += `${title}. `;
            if (details.editors) {
                citation += `In ${details.editors} (Ed${details.editors.includes(';') ? 's' : ''}.), `;
            }
            citation += `${details.bookTitle} `;
            if (details.pages) {
                citation += `(pp. ${details.pages}). `;
            }
            citation += `${details.publisher}`;
            if (details.location) {
                citation += `, ${details.location}`;
            }
            citation += '.';
            break;
            
        case 'website':
            citation += `${title}. ${details.websiteName}. `;
            citation += `Retrieved ${details.accessDate}, from ${details.url}`;
            break;
            
        case 'conference':
            citation += `${title} [Conference presentation]. `;
            citation += `${details.conferenceName}`;
            if (details.location) {
                citation += `, ${details.location}`;
            }
            if (details.organizer) {
                citation += `, ${details.organizer}`;
            }
            citation += '.';
            break;
    }
    
    return citation;
}

function generateMLACitation(authors, date, title, details, type) {
    let citation = '';
    
    // Author formatting
    if (authors.length === 1) {
        citation += `${authors[0]}.`;
    } else if (authors.length === 2) {
        citation += `${authors[0]} and ${authors[1]}.`;
    } else if (authors.length > 2) {
        citation += `${authors[0]} et al.`;
    }

    switch(type) {
        case 'book':
            citation += ` ${title}. `;
            if (details.edition && details.edition !== '1') {
                citation += `${details.edition} ed., `;
            }
            if (details.publisher) {
                citation += `${details.publisher}`;
            }
            if (details.location) {
                citation += `, ${details.location}`;
            }
            citation += `, ${date}.`;
            break;
            
        case 'bookChapter':
            citation += ` "${title}." `;
            citation += `${details.bookTitle}, `;
            if (details.editors) {
                citation += `edited by ${details.editors}, `;
            }
            if (details.publisher) {
                citation += `${details.publisher}`;
            }
            if (details.location) {
                citation += `, ${details.location}`;
            }
            citation += `, ${date}, pp. ${details.pages}.`;
            break;
            
        case 'journal':
            citation += ` "${title}." `;
            citation += `${details.journalName}`;
            if (details.volume) {
                citation += `, vol. ${details.volume}`;
            }
            if (details.issue) {
                citation += `, no. ${details.issue}`;
            }
            citation += `, ${date}, pp. ${details.pages}.`;
            break;
            
        case 'website':
            citation += ` "${title}." `;
            citation += `${details.websiteName}, `;
            citation += `${date}, ${details.url}. `;
            citation += `Accessed ${details.accessDate}.`;
            break;
            
        case 'conference':
            citation += ` "${title}." `;
            citation += `${details.conferenceName}`;
            if (details.location) {
                citation += `, ${details.location}`;
            }
            if (details.organizer) {
                citation += `, ${details.organizer}`;
            }
            citation += `, ${date}.`;
            break;
    }
    
    return citation;
}

function generateChicagoCitation(authors, date, title, details, type) {
    let citation = '';
    
    // Author formatting
    if (authors.length === 1) {
        citation += `${authors[0]},`;
    } else if (authors.length === 2) {
        citation += `${authors[0]} and ${authors[1]},`;
    } else if (authors.length > 2) {
        citation += `${authors[0]} et al.,`;
    }

    switch(type) {
        case 'book':
            citation += ` ${title}. `;
            if (details.location) {
                citation += `${details.location}: `;
            }
            citation += `${details.publisher}`;
            if (details.edition && details.edition !== '1') {
                citation += `, ${details.edition} ed.`;
            }
            citation += `, ${date}.`;
            break;
            
        case 'bookChapter':
            citation += ` "${title}," in `;
            citation += `${details.bookTitle}`;
            if (details.editors) {
                citation += `, edited by ${details.editors}`;
            }
            if (details.location) {
                citation += ` (${details.location}: `;
            }
            citation += `${details.publisher}, ${date}), `;
            citation += `${details.pages}.`;
            break;
            
        case 'journal':
            citation += ` "${title}," `;
            citation += `${details.journalName} `;
            if (details.volume) {
                citation += `${details.volume}`;
            }
            if (details.issue) {
                citation += `, no. ${details.issue}`;
            }
            citation += ` (${date}): ${details.pages}.`;
            break;
            
        case 'website':
            citation += ` "${title}," `;
            citation += `${details.websiteName}, `;
            citation += `${date}. ${details.url}. `;
            citation += `Accessed ${details.accessDate}.`;
            break;
            
        case 'conference':
            citation += ` "${title}." Paper presented at `;
            citation += `${details.conferenceName}`;
            if (details.location) {
                citation += `, ${details.location}`;
            }
            citation += `, ${date}.`;
            break;
    }
    
    return citation;
}

// Add this event listener for the type selection
document.getElementById('citationType').addEventListener('change', function() {
    updatePublicationFields(this.value);
});

function updatePublicationFields(type) {
    const publicationFieldsContainer = document.getElementById('publicationFields');
    publicationFieldsContainer.innerHTML = ''; // Clear existing fields
    
    let newHTML = '';
    switch(type) {
        case 'journal':
            newHTML = `
                <div class="input-group">
                    <label for="journalName" class="required">Journal Name</label>
                    <input type="text" id="journalName" required>
                </div>
                <div class="input-group">
                    <label for="volume">Volume Number</label>
                    <input type="text" id="volume">
                </div>
                <div class="input-group">
                    <label for="issue">Issue Number</label>
                    <input type="text" id="issue">
                </div>
                <div class="input-group">
                    <label for="pages" class="required">Page Range</label>
                    <input type="text" id="pages" placeholder="e.g., 123-145" required>
                </div>
            `;
            break;
        case 'book':
            newHTML = `
                <div class="input-group">
                    <label for="publisher" class="required">Publisher Name</label>
                    <input type="text" id="publisher" required>
                </div>
                <div class="input-group">
                    <label for="location" class="required">Publication Location</label>
                    <input type="text" id="location" placeholder="City, Country" required>
                </div>
                <div class="input-group">
                    <label for="edition">Edition</label>
                    <input type="text" id="edition" placeholder="e.g., 2nd">
                </div>
            `;
            break;
        case 'bookChapter':
            newHTML = `
                <div class="input-group">
                    <label for="bookTitle" class="required">Book Title</label>
                    <input type="text" id="bookTitle" required>
                </div>
                <div class="input-group">
                    <label for="editors">Editor(s)</label>
                    <input type="text" id="editors" placeholder="Separate multiple editors with semicolons">
                </div>
                <div class="input-group">
                    <label for="publisher" class="required">Publisher Name</label>
                    <input type="text" id="publisher" required>
                </div>
                <div class="input-group">
                    <label for="location" class="required">Publication Location</label>
                    <input type="text" id="location" placeholder="City, Country" required>
                </div>
                <div class="input-group">
                    <label for="pages" class="required">Page Range</label>
                    <input type="text" id="pages" placeholder="e.g., 123-145" required>
                </div>
            `;
            break;
        case 'website':
            newHTML = `
                <div class="input-group">
                    <label for="websiteName" class="required">Website Name</label>
                    <input type="text" id="websiteName" required>
                </div>
                <div class="input-group">
                    <label for="url" class="required">URL</label>
                    <input type="url" id="url" required>
                </div>
                <div class="input-group">
                    <label for="accessDate" class="required">Date Accessed</label>
                    <input type="text" id="accessDate" placeholder="e.g., July 1, 2023" required>
                </div>
            `;
            break;
        case 'conference':
            newHTML = `
                <div class="input-group">
                    <label for="conferenceName" class="required">Conference Name</label>
                    <input type="text" id="conferenceName" required>
                </div>
                <div class="input-group">
                    <label for="location" class="required">Conference Location</label>
                    <input type="text" id="location" placeholder="City, Country" required>
                </div>
                <div class="input-group">
                    <label for="organizer">Conference Organizer</label>
                    <input type="text" id="organizer">
                </div>
            `;
            break;
    }
    
    publicationFieldsContainer.innerHTML = newHTML;
} 