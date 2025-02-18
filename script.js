document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const requiredColumns = ["Gregorian Date", "YearName", "Ayana", "LunarMonth", "Paksha", "Tithi", "Day", "Nakshatra", "Yoga", "Karana", "RahuKala", "Person1_tara", "Person2_tara"];
        
        // Map column names to their indexes in the file
        const headerRow = jsonData[0];
        const headerIndexMap = {};
        requiredColumns.forEach(col => {
            const index = headerRow.indexOf(col);
            if (index !== -1) headerIndexMap[col] = index;
        });
        
        // Filter and format data correctly
        const filteredData = jsonData.slice(1).map(row => {
            return requiredColumns.map(key => {
                let value = row[headerIndexMap[key]];
                if (key === "Gregorian Date" && value) {
                    const date = new Date((value - 25569) * 86400000);
                    value = date.toLocaleDateString('en-GB'); // Format as dd/mm/yyyy
                }
                if ((key === "Sunrise" || "Sunset") && !isNaN(value)) {
                    const time = XLSX.SSF.parse_date_code(value);
                    value = time ? `${String(time.H).padStart(2, '0')}:${String(time.M).padStart(2, '0')}` : "-";
                }
                return value || "-"; // Handle undefined values
            });
        });
        
        fetch('asta.txt')
            .then(response => response.text())
            .then(text => {
                const events = text.split('\n').map(line => {
                    const [startDate, endDate, eventName] = line.split(',').map(value => value.trim());
                    return { startDate: new Date(startDate), endDate: new Date(endDate), eventName };
                });
                displayTable([requiredColumns, ...filteredData], events);
                setDefaultDates(filteredData);
            });
    };
    reader.readAsArrayBuffer(file);
});

document.getElementById('shudhiButton').addEventListener('click', function() {
    fetch('auspicious.txt')
        .then(response => response.text())
        .then(text => {
            const auspiciousValues = text.split('\n').map(value => value.trim());
            highlightAuspiciousCells(auspiciousValues);
        });
});

document.getElementById('filterButton').addEventListener('click', function() {
    filterTable();
});

function highlightAuspiciousCells(auspiciousValues) {
    const table = document.getElementById('panchangaTable');
    const rows = table.getElementsByTagName('tr');
    const headerRow = rows[0];
    const headerIndexMap = {};
    for (let i = 0; i < headerRow.cells.length; i++) {
        headerIndexMap[headerRow.cells[i].textContent] = i;
    }
    for (let i = 1; i < rows.length; i++) { // Skip header row
        const cells = rows[i].getElementsByTagName('td');
        let allGreen = true;
        const requiredColumns = ["Tithi", "Day", "Nakshatra", "Yoga", "Karana"];
        const requiredIndexes = requiredColumns.map(col => headerIndexMap[col]);

        for (let j = 0; j < cells.length; j++) {
            if (auspiciousValues.includes(cells[j].textContent)) {
                cells[j].classList.add('green');
            }
        }

        // Check if all required cells are green
        for (let index of requiredIndexes) {
            if (!cells[index].classList.contains('green')) {
                allGreen = false;
                break;
            }
        }

        // Highlight Gregorian Date if all required cells are green
        if (allGreen) {
            cells[0].classList.add('green');
        }
    }
}

function displayTable(data, events) {
    const table = document.getElementById('panchangaTable');
    table.innerHTML = ""; // Clear existing table content

    // Create table header
    const headerRow = document.createElement('tr');
    data[0].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows
    data.slice(1).forEach(row => {
        const rowElement = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            if (headerRow.cells[0].textContent === "Gregorian Date") {
                const date = new Date(cell.split('/').reverse().join('-')); // Convert dd/mm/yyyy to yyyy-mm-dd
                td.textContent = date.toLocaleDateString('en-GB'); // Format as dd/mm/yyyy
            } else {
                td.textContent = cell;
            }
            rowElement.appendChild(td);
        });
        table.appendChild(rowElement);
    });

    // Highlight events
    highlightEvents(events);
}

function highlightEvents(events) {
    const table = document.getElementById('panchangaTable');
    const rows = table.getElementsByTagName('tr');
    for (let i = 1; i < rows.length; i++) { // Skip header row
        const cells = rows[i].getElementsByTagName('td');
        const dateCell = cells[0]; // Assuming the date is in the first column
        const date = new Date(dateCell.textContent.split('/').reverse().join('-')); // Convert dd/mm/yyyy to yyyy-mm-dd
        events.forEach(event => {
            if (date >= event.startDate && date <= event.endDate) {
                rows[i].classList.add('highlight');
                const eventCell = document.createElement('td');
                eventCell.textContent = event.eventName;
                rows[i].appendChild(eventCell);
            }
        });
    }
}

function setDefaultDates(data) {
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
    const firstDate = new Date(data[0][0].split('/').reverse().join('-')); // Convert dd-mm-yyyy to yyyy-mm-dd
    const lastDate = new Date(data[data.length - 1][0].split('/').reverse().join('-')); // Convert dd-mm-yyyy to yyyy-mm-dd
    fromDateInput.value = firstDate.toLocaleDateString('en-GB'); // Format as dd/mm/yyyy
    toDateInput.value = lastDate.toLocaleDateString('en-GB'); // Format as dd/mm/yyyy
}

function filterTable() {
    const fromDateInput = document.getElementById('fromDate').value.split('/').reverse().join('-'); // Convert dd/mm/yyyy to yyyy-mm-dd
    const toDateInput = document.getElementById('toDate').value.split('/').reverse().join('-'); // Convert dd/mm/yyyy to yyyy-mm-dd
    const fromDate = new Date(fromDateInput);
    const toDate = new Date(toDateInput);

    const table = document.getElementById('panchangaTable');
    const rows = table.getElementsByTagName('tr');
    for (let i = 1; i < rows.length; i++) { // Skip header row
        const cells = rows[i].getElementsByTagName('td');
        const dateCell = cells[0]; // Assuming the date is in the first column
        const date = new Date(dateCell.textContent.split('/').reverse().join('-')); // Convert dd/mm/yyyy to yyyy-mm-dd
        if (date >= fromDate && date <= toDate) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }
}
