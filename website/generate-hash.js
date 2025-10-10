const crypto = require('crypto');

const password = 'Google@123455'; // Change this to your desired password
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log('Password Hash:', hash);
console.log('\nUse this hash in DynamoDB for the inspector account.');
