function displayTable(data, events) {
    const table = document.getElementById('panchangaTable');
    table.innerHTML = '';
    data[0].splice(1, 0, 'ASTHA'); // Add 'Event' column header
    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        row.forEach((cell, colIndex) => {
            const td = document.createElement(rowIndex === 0 ? 'th' : 'td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        if (rowIndex > 0) {
            const dateCell = row[0];
            const dateParts = dateCell.split('/');
            const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`); // Convert dd/mm/yyyy to yyyy-mm-dd
            const event = events.find(event => date >= event.startDate && date <= event.endDate);
            const eventTd = document.createElement('td');
            eventTd.textContent = event ? event.eventName : '-';
            tr.insertBefore(eventTd, tr.children[1]);
        }
        table.appendChild(tr);
    });
}
