document.addEventListener('DOMContentLoaded', function() {
    const nakshatras = [
        "Aswi", "Bhar", "Krit", "Rohi", "Mrig", "Ardr", "Puna", "Push", "Asre", "Magh",
        "PPha", "UPha", "Hast", "Chit", "Swat", "Visa", "Anu", "Jye", "Mool", "PSha",
        "USha", "Srav", "Dhan", "Sata", "PBha", "UBha", "Reva"
    ];
    const taraTexts = ["P.MITRA", "JANMA", "SAMPATH", "VIPATH", "KSHEMA", "PRATYAK", "SADHANA", "NAIDHANA", "MITRA"];
    
    populateDropdown('person1', nakshatras);
    populateDropdown('person2', nakshatras);

    document.getElementById('tarabalaButton').addEventListener('click', function() {
        const person1Nakshatra = document.getElementById('person1').value;
        const person2Nakshatra = document.getElementById('person2').value;
        calculateTarabala(person1Nakshatra, person2Nakshatra, nakshatras, taraTexts);
    });
});

function populateDropdown(dropdownId, options) {
    const dropdown = document.getElementById(dropdownId);
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        dropdown.appendChild(opt);
    });
}

function calculateTarabala(person1Nakshatra, person2Nakshatra, nakshatras, taraTexts) {
    const person1NakshatraNo = nakshatras.indexOf(person1Nakshatra) + 1;
    const person2NakshatraNo = nakshatras.indexOf(person2Nakshatra) + 1;

    const table = document.getElementById('panchangaTable');
    const rows = table.getElementsByTagName('tr');

    // Check if the columns already exist
    let person1TaraIndex = -1;
    let person2TaraIndex = -1;
    const headerRow = rows[0];
    for (let i = 0; i < headerRow.cells.length; i++) {
        if (headerRow.cells[i].textContent === 'Person1_tara') {
            person1TaraIndex = i;
        }
        if (headerRow.cells[i].textContent === 'Person2_tara') {
            person2TaraIndex = i;
        }
    }

    // Add new column headers if they don't exist
    if (person1TaraIndex === -1) {
        const person1TaraHeader = document.createElement('th');
        person1TaraHeader.textContent = 'Person1_tara';
        headerRow.appendChild(person1TaraHeader);
        person1TaraIndex = headerRow.cells.length - 1;
    }
    if (person2TaraIndex === -1) {
        const person2TaraHeader = document.createElement('th');
        person2TaraHeader.textContent = 'Person2_tara';
        headerRow.appendChild(person2TaraHeader);
        person2TaraIndex = headerRow.cells.length - 1;
    }

    // Fetch auspicious values for highlighting
    fetch('auspicious.txt')
        .then(response => response.text())
        .then(text => {
            const auspiciousValues = text.split('\n').map(value => value.trim());

            // Calculate Tarabala for each row
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName('td');
                const nakshatra = cells[8].textContent; // Assuming Nakshatra is in the 9th column
                const nakshatraNo = nakshatras.indexOf(nakshatra) + 1;

                const person1Tara = (nakshatraNo - person1NakshatraNo + 1 + 27) % 9;
                const person2Tara = (nakshatraNo - person2NakshatraNo + 1 + 27) % 9;

                const person1TaraText = taraTexts[person1Tara];
                const person2TaraText = taraTexts[person2Tara];

                // Clear existing classes
                if (person1TaraIndex < cells.length) {
                    cells[person1TaraIndex].classList.remove('green');
                    cells[person1TaraIndex].textContent = person1TaraText;
                    if (auspiciousValues.includes(person1TaraText)) {
                        cells[person1TaraIndex].classList.add('green');
                    }
                } else {
                    const person1TaraCell = document.createElement('td');
                    person1TaraCell.textContent = person1TaraText;
                    if (auspiciousValues.includes(person1TaraText)) {
                        person1TaraCell.classList.add('green');
                    }
                    rows[i].appendChild(person1TaraCell);
                }

                if (person2TaraIndex < cells.length) {
                    cells[person2TaraIndex].classList.remove('green');
                    cells[person2TaraIndex].textContent = person2TaraText;
                    if (auspiciousValues.includes(person2TaraText)) {
                        cells[person2TaraIndex].classList.add('green');
                    }
                } else {
                    const person2TaraCell = document.createElement('td');
                    person2TaraCell.textContent = person2TaraText;
                    if (auspiciousValues.includes(person2TaraText)) {
                        person2TaraCell.classList.add('green');
                    }
                    rows[i].appendChild(person2TaraCell);
                }
            }
        });
}
