import 'dotenv/config';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
// Server modules
import express, { application } from 'express';
import exphbs from 'express-handlebars';
import morgan from 'morgan';
import helmet from 'helmet';
import { expressCspHeader } from 'express-csp-header';
import session from 'express-session';
// Multer
import multer from 'multer';
// Database modules
import { connectToServer }  from './db/conn.js';
// Routers
import baseRoute from './routes/base.js';
import userRoute from './routes/users.js';
import authRoute from './routes/auth.js';
import discussionRoute from './routes/discussions.js';
// Generate sample data
import { generateData } from './db/sample.js';


const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
// Set port
const port = process.env.PORT || 3000;
// Set static folder
app.use(express.static(__dirname + "/public"));
// Set handlebars as the app's view engine.
// `{extname: 'hbs'}` informs the handlebars engine that the file extension to read is .hbs 
app.engine("hbs", exphbs.engine({extname: 'hbs'}));
// Set express' default file extension for views as .hbs
app.set("view engine", "hbs");
// Set the directory for the views
app.set("views", "./views");
// Set view cache to false so browsers wouldn't save views into their cache
app.set("view cache", false);
// Parse request body as JSON
app.use(express.json());
// Parse request body as URL encoded data
app.use(express.urlencoded({ extended: false }));
// Use helmet
app.use(helmet());
// Use morgan
app.use(morgan("dev"));
// Set CSP header to allow Font Awesome script kit to load
app.use(expressCspHeader({
    policies: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "https://kit.fontawesome.com/e5cabd2361.js"],    }
}));

// Use flash and session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// Assign routes
app.use(baseRoute);
app.use("/users",userRoute);
app.use("/auth",authRoute);
app.use("/discussions",discussionRoute);

// Manage Multer errors
app.use((err, req, res, next) => {
    if(err instanceof multer.MulterError){
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ message: 'File too big. Max size is 5MB.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            res.status(400).json({ message: 'Invalid filetype.' });
        }
    }
});

// 404 not found page
app.use((req, res, err) => {
    res.status(404).render("404", {
        title: "404 Not Found",
        styles: [ "404.css" ],
    });
});

// Connect to MongoDB
connectToServer( (err) => {
    if (err){
        console.error(err);
        process.exit();
    }
    console.log("Successfully connected to MongoDB...");
    
    app.listen(port, () => {
        console.log("Server now listening on port " + port);
    });
});

// Populate database with sample data
if (process.env.NODE_ENV === "development") {
    generateData();
}
