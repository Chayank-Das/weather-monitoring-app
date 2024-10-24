// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        try {
            const url = new URL(origin);
            const allowedHosts = ['localhost', '127.0.0.1'];

            if (allowedHosts.includes(url.hostname)) {
                return callback(null, true);
            } else {
                return callback(new Error('Not allowed by CORS'));
            }
        } catch (err) {
            return callback(new Error('Invalid origin'));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());

// Enable Mongoose Debug Mode
mongoose.set('debug', true);

// Connect to MongoDB
const uri = "mongodb+srv://chayank:Amazing@cluster0.2iw7v.mongodb.net/daily_Weather_summary?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

// Mongoose connection event handlers
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Define the schema for daily summaries
const dailySummarySchema = new mongoose.Schema({
    city: { type: String, required: true },
    date: { type: String, required: true },
    avg_temp: { type: Number, required: true },
    max_temp: { type: Number, required: true },
    min_temp: { type: Number, required: true },
    dominant_condition: { type: String, required: true }
}, { collection: 'reports' }); // Explicitly define collection name

// Create the model
const DailySummary = mongoose.model('DailySummary', dailySummarySchema);

// API Endpoint to Receive Daily Summaries
app.post('/api/daily-summaries', async (req, res) => {
    const summaries = req.body.summaries;
    console.log("Received summaries:", summaries); // Log received data

    if (!summaries || !Array.isArray(summaries)) {
        console.warn("Invalid data format received.");
        return res.status(400).json({ message: "Invalid data format." });
    }

    try {
        // Insert summaries into the database
        const inserted = await DailySummary.insertMany(summaries);
        console.log("Inserted summaries into MongoDB:", inserted);
        res.status(200).json({ message: "Daily summaries stored successfully.", count: inserted.length });
    } catch (error) {
        console.error("Error inserting summaries:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
});

// API Endpoint to Retrieve Daily Summaries
app.get('/api/daily-summaries', async (req, res) => {
    try {
        const summaries = await DailySummary.find().sort({ date: -1, city: 1 });
        res.status(200).json({ summaries });
    } catch (error) {
        console.error("Error retrieving summaries:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.post('/api/test-insert', async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const sampleSummary = {
        city: "TestCity",
        date: today,
        avg_temp: 25.5,
        max_temp: 28,
        min_temp: 22,
        dominant_condition: "Sunny"
    };

    try {
        const inserted = await DailySummary.create(sampleSummary);
        console.log("Inserted sample summary:", inserted);
        res.status(200).json({ message: "Sample summary inserted successfully.", summary: inserted });
    } catch (error) {
        console.error("Error inserting sample summary:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
});
