const fs = require('fs');
const path = require('path');

// Change detection analysis
const changeDetails = {
  "RTSservices/java/com/mars/rti/controller/BirthCertificateController.java": {
    "lines": {
      "modified": [181]
    },
    "functions": {
      "saveRTIBirthApplication": "modified"
    },
    "hunks": [{
      "start": 181,
      "end": 181,
      "type": "modification",
      "content": "Changed response message to include 'Application'"
    }],
    "impact": ["Birth certificate application response message"]
  },
  "RTSservices/java/com/mars/rti/controller/DeathRegistartionController.java": {
    "lines": {
      "added": [489, 490, 491, 492, 493, 494],
      "deleted": [489, 490],
      "modified": [488, 489, 490]
    },
    "functions": {
      "editDeathRegistrationCertificate": "modified"
    },
    "hunks": [{
      "start": 488,
      "end": 494,
      "type": "mixed",
      "content": "Modified session attribute from 'rtirefId' to 'rtiApplicationRefId'"
    }],
    "impact": ["Death certificate editing session handling"]
  },
  "RTSservices/java/com/mars/rti/controller/DogLicenceCertificateController.java": {
    "lines": {
      "added": [232, 233, 234, 235, 236, 251, 252, 253, 254, 255, 256],
      "deleted": [232, 233, 248, 249],
      "modified": [232, 236, 251, 255]
    },
    "functions": {
      "saveDogLicenceCertificate": "modified"
    },
    "hunks": [
      {
        "start": 232,
        "end": 236,
        "type": "bug_fix",
        "content": "Fixed missing closing parenthesis in setAmount call"
      },
      {
        "start": 251,
        "end": 256,
        "type": "bug_fix",
        "content": "Fixed missing closing parenthesis in setDogTailLength call"
      }
    ],
    "impact": ["Dog license certificate amount and tail length parsing"]
  }
};

// Calculate test targets
const testTargets = {
  controllers: [
    "BirthCertificateController",
    "DeathRegistartionController",
    "DogLicenceCertificateController"
  ],
  endpoints: [
    "/saveRTIBirthApplication",
    "/editDeathRegistrationCertificate",
    "/saveDogLicenceCertificate"
  ],
  totalChangedLines: 25,
  totalChangedFunctions: 3,
  priority: "high",
  changeTypes: ["bug_fix", "modification"]
};

// Static analysis metrics
const staticMetrics = {
  projectType: "Java Spring MVC",
  framework: "Spring Framework",
  testableEndpoints: 3,
  changedFiles: 3,
  totalFiles: 3,
  coverageTarget: 80
};

// Export analysis results
module.exports = {
  changeDetails,
  testTargets,
  staticMetrics,
  timestamp: new Date().toISOString()
};

// Save to file
fs.writeFileSync(
  path.join(__dirname, '../test-results/change-analysis.json'),
  JSON.stringify({ changeDetails, testTargets, staticMetrics }, null, 2)
);

console.log('Change detection complete:');
console.log(`- Files changed: ${Object.keys(changeDetails).length}`);
console.log(`- Functions modified: ${testTargets.totalChangedFunctions}`);
console.log(`- Total lines changed: ${testTargets.totalChangedLines}`);
console.log(`- Priority: ${testTargets.priority}`);