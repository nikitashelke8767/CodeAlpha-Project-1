const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const shortid = require('shortid');
const bodyParser = require('body-parser');
const Url = require('./models/Url');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// DB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Route: POST /shorten
app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;

  let existing = await Url.findOne({ originalUrl });
  if (existing) {
    return res.send(`Short URL: <a href="/${existing.shortCode}">${req.headers.host}/${existing.shortCode}</a>`);
  }

  const shortCode = shortid.generate();
  const url = new Url({ originalUrl, shortCode });
  await url.save();

  res.send(`Short URL: <a href="/${shortCode}">${req.headers.host}/${shortCode}</a>`);
});

// Route: GET /:shortCode
app.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  const url = await Url.findOne({ shortCode });

  if (url) {
    return res.redirect(url.originalUrl);
  } else {
    return res.status(404).send('URL not found');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
