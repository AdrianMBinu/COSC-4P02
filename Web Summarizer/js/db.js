document.addEventListener("DOMContentLoaded", function() {
    // Create an instance of SQL.js
    var SQL = window.SQL;

    // Load the SQLite file
    fetch('../js/url_shortener.db') // Provide the correct path to your SQLite file
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            // Create a Uint8Array from the array buffer
            var uInt8Array = new Uint8Array(arrayBuffer);
            
            try {
                // Create the SQLite database
                var db = new SQL.Database(uInt8Array);
                
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
            } catch (error) {
                console.error('Error creating database:', error);
            }
        })
        .catch(error => {
            console.error('Error loading database:', error);
        });
});
