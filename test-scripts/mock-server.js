// Mock server for test execution simulation
const express = require('express');
const app = express();

app.use(express.json());

// Birth Certificate endpoint
app.post('/saveRTIBirthApplication', (req, res) => {
  res.json({
    responseStatus: 'Application requested data saved successfully',
    response: Math.random().toString(36).substring(7),
    result: 'RTI-' + Date.now()
  });
});

// Death Registration endpoint
app.post('/editDeathRegistrationCertificate', (req, res) => {
  if (req.session && req.session.rtiApplicationRefId) {
    res.json({ success: true, sessionValid: true });
  } else {
    res.status(400).json({ error: 'Session attribute missing' });
  }
});

// Dog Licence endpoint
app.post('/saveDogLicenceCertificate', (req, res) => {
  const { amount, dogTailLength } = req.body;
  
  // Validate parsing
  if (amount && !isNaN(parseFloat(amount[0])) && 
      dogTailLength && !isNaN(parseInt(dogTailLength[0]))) {
    res.status(201).json({ success: true, licenceId: 'DOG-' + Date.now() });
  } else {
    res.status(400).json({ error: 'Parsing error' });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Mock server running on port ${port}`);
  });
}

module.exports = app;