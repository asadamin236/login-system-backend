// Simple deployment trigger script
// This file helps trigger Vercel redeployment

const packageInfo = require('./package.json');

console.log('🚀 Deployment trigger for:', packageInfo.name);
console.log('📅 Timestamp:', new Date().toISOString());
console.log('✅ Backend is ready for deployment');

// Update package.json version to trigger deployment
const fs = require('fs');
const package = require('./package.json');
const versionParts = package.version.split('.');
versionParts[2] = parseInt(versionParts[2]) + 1;
package.version = versionParts.join('.');

fs.writeFileSync('./package.json', JSON.stringify(package, null, 2));
console.log('📦 Updated version to:', package.version);
