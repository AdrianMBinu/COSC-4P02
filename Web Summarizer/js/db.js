
document.addEventListener("DOMContentLoaded", function() {
    // Open a connection to the SQLite database
    var db = openDatabase('url_shortener.db', '1.0', 'My Database', 2 * 1024 * 1024);

    // Check if the database was opened successfully
    if (!db) {
        alert('Database failed to open');
        return;
    }

    // Fetch data from the database and populate the table
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM urls', [], function(tx, results) {
            var len = results.rows.length;
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
                var row = results.rows.item(i);
                var newRow = document.createElement('tr');
                newRow.innerHTML = '<td>' + row.id + '</td>' +
                                   '<td>' + row.shortCode + '</td>' +
                                   '<td>' + row.longUrl + '</td>' +
                                   '<td>' + row.clickCount + '</td>' +
                                   '<td>' + row.createdAt + '</td>' +
                                   '<td>' + row.userId + '</td>';
                tableBody.appendChild(newRow);
            }
        }, null);
    });
});
