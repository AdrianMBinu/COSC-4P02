document.addEventListener("DOMContentLoaded", function() {
    // Create an instance of SQL.js
    var SQL = window.SQL;

    // Create or open a database
    var db = new SQL.Database();

    // Check if the database was created successfully
    if (!db) {
        alert('Database failed to open');
        return;
    }

    // Execute SQL commands to create the table and insert data
    var createTableQuery = `
        CREATE TABLE IF NOT EXISTS urls (
            id INTEGER PRIMARY KEY,
            shortCode TEXT UNIQUE,
            longUrl TEXT UNIQUE,
            clickCount INTEGER DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            userId TEXT
        )
    `;
    db.run(createTableQuery);

    // Fetch data from the database and populate the table
    var selectQuery = 'SELECT * FROM urls';
    var results = db.exec(selectQuery);

    var len = results[0].values.length;
    var tableHead = document.getElementById('tableHead');
    var tableBody = document.getElementById('tableBody');

    // Generate table headers
    var headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>ID</th>' +
                          '<th>Short Code</th>' +
                          '<th>Long URL</th>' +
                          '<th>Click Count</th>' +
                          '<th>Created At</th>' +
                          '<th>User ID</th>';
    tableHead.appendChild(headerRow);

    // Generate table rows
    for (var i = 0; i < len; i++) {
        var row = results[0].values[i];
        var newRow = document.createElement('tr');
        newRow.innerHTML = '<td>' + row[0] + '</td>' +
                           '<td>' + row[1] + '</td>' +
                           '<td>' + row[2] + '</td>' +
                           '<td>' + row[3] + '</td>' +
                           '<td>' + row[4] + '</td>' +
                           '<td>' + row[5] + '</td>';
        tableBody.appendChild(newRow);
    }
});
