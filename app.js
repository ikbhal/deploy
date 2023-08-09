const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const fs = require('fs').promises;
const { exec } = require('child_process');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'muhammed', // Change this to your actual secret
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.get('/', async (req, res) => {
    db.all('SELECT * FROM scripts', (err, scripts) => {
        if (err) {
            req.flash('error', 'Error fetching scripts');
            return res.redirect('/');
        }
        res.render('index', { scripts });
    });
});

app.post('/save', async (req, res) => {
    const { script_name, script_body } = req.body;
    db.run('INSERT INTO scripts (name, body) VALUES (?, ?)', [script_name, script_body], (err) => {
        if (err) {
            req.flash('error', 'Error saving script');
        } else {
            req.flash('success', 'Script saved successfully');
        }
        res.redirect('/');
    });
});

app.get('/delete/:id', async (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM scripts WHERE id = ?', [id], (err) => {
        if (err) {
            req.flash('error', 'Error deleting script');
        } else {
            req.flash('success', 'Script deleted successfully');
        }
        res.redirect('/');
    });
});

app.get('/edit/:id', async (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM scripts WHERE id = ?', [id], (err, script) => {
        if (err || !script) {
            req.flash('error', 'Script not found');
            return res.redirect('/');
        }
        res.render('edit_script', { script });
    });
});

app.post('/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { script_name, script_body } = req.body;

    db.run('UPDATE scripts SET name = ?, body = ? WHERE id = ?', [script_name, script_body, id], (err) => {
        if (err) {
            req.flash('error', 'Error updating script');
        } else {
            req.flash('success', 'Script updated successfully');
        }
        res.redirect(`/view/${id}`);
    });
});


app.get('/view/:id', async (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM scripts WHERE id = ?', [id], (err, script) => {
        if (err || !script) {
            req.flash('error', 'Script not found');
            return res.redirect('/');
        }
        res.render('view_script', { script });
    });
});

app.get('/run/:id', async (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM scripts WHERE id = ?', [id], (err, script) => {
        if (err || !script) {
            req.flash('error', 'Script not found');
            return res.redirect('/');
        }
        // Implement script execution logic and send output
        // (Execute the script and send output as response)
    });
});

app.get('/run/:id/sudo', async (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM scripts WHERE id = ?', [id], (err, script) => {
        if (err || !script) {
            req.flash('error', 'Script not found');
            return res.redirect('/');
        }
        const scriptCommand = script.body;

        const shellCommand = `bash -c "${scriptCommand}"`;

        exec(`sudo ${shellCommand}`, (error, stdout, stderr) => {
            if (error) {
                req.flash('error', `Error: ${error.message}`);
            } else if (stderr) {
                req.flash('error', `stderr: ${stderr}`);
            } else {
                req.flash('success', `stdout: ${stdout}`);
            }
            res.redirect('/');
        });
    });
});

app.get('/list-files', async (req, res) => {
    try {
        const filesDir = '/home/contact/scripts'; // Update with your desired directory
        const files = await fs.readdir(filesDir);

        const filesWithContent = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(filesDir, file);
                const content = await fs.readFile(filePath, 'utf-8');
                return { name: file, content };
            })
        );

        res.render('list_files', { filesWithContent });
    } catch (error) {
        req.flash('error', 'An error occurred');
        res.redirect('/');
    }
});

const PORT = process.env.PORT || 3019;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
