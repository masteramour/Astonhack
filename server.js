import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Path to the donations JSON file
const donationsFile = path.join(__dirname, 'donations.json');

// Initialize donations file if it doesn't exist
if (!fs.existsSync(donationsFile)) {
  fs.writeFileSync(donationsFile, JSON.stringify([], null, 2));
}

// POST endpoint to handle donations
app.post('/api/donate', (req, res) => {
  try {
    const donation = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...req.body
    };

    // Read existing donations
    const donationsData = JSON.parse(fs.readFileSync(donationsFile, 'utf-8'));
    
    // Add new donation
    donationsData.push(donation);
    
    // Write back to file
    fs.writeFileSync(donationsFile, JSON.stringify(donationsData, null, 2));
    
    console.log('Donation saved:', donation);
    res.json({ success: true, message: 'Donation recorded successfully', id: donation.id });
  } catch (error) {
    console.error('Error saving donation:', error);
    res.status(500).json({ success: false, message: 'Error saving donation' });
  }
});

// GET endpoint to retrieve all donations
app.get('/api/donations', (req, res) => {
  try {
    const donations = JSON.parse(fs.readFileSync(donationsFile, 'utf-8'));
    res.json(donations);
  } catch (error) {
    console.error('Error reading donations:', error);
    res.status(500).json({ success: false, message: 'Error reading donations' });
  }
});

app.listen(PORT, () => {
  console.log(`Donations server running on http://localhost:${PORT}`);
});
