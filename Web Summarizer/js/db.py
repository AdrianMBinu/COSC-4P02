import sqlite3

# Connect to the database
conn = sqlite3.connect('your_database.db')
cursor = conn.cursor()

# Execute a query to fetch all data from the table
cursor.execute('SELECT * FROM your_table')
rows = cursor.fetchall()

# Close the cursor and connection
cursor.close()
conn.close()

# Generate HTML table
html_table = '<table border="1">'
html_table += '<tr>' + ''.join(f'<th>{col[0]}</th>' for col in cursor.description) + '</tr>'
for row in rows:
    html_table += '<tr>' + ''.join(f'<td>{cell}</td>' for cell in row) + '</tr>'
html_table += '</table>'

# Write HTML to a separate file
with open('output.html', 'w') as f:
    f.write(html_table)
