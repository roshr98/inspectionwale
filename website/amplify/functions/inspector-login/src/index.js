const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Simple token generation (in production, use JWT)
function generateToken(username) {
  return crypto.createHash('sha256')
    .update(username + Date.now() + Math.random())
    .digest('hex');
}

// Hash password for comparison
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { username, password } = body;

    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          ok: false,
          message: 'Username and password are required'
        })
      };
    }

    // Get inspector from DynamoDB
    const tableName = process.env.INSPECTORS_TABLE || 'inspectionwale-inspectors';

    // Since table uses 'id' as partition key, we need to scan for username
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
    
    const scanCommand = new ScanCommand({
      TableName: tableName,
      FilterExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    });

    const response = await docClient.send(scanCommand);

    if (!response.Items || response.Items.length === 0) {
      console.log('Inspector not found:', username);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          ok: false,
          message: 'Invalid username or password'
        })
      };
    }

    const inspector = response.Items[0];
    
    // Check if account is active
    if (inspector.status !== 'active') {
      console.log('Inspector account inactive:', username);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          ok: false,
          message: 'Account is inactive. Please contact administrator.'
        })
      };
    }

    // Verify password
    const hashedPassword = hashPassword(password);
    if (inspector.passwordHash !== hashedPassword) {
      console.log('Invalid password for inspector:', username);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          ok: false,
          message: 'Invalid username or password'
        })
      };
    }

    // Generate token
    const token = generateToken(username);
    
    console.log('Login successful for inspector:', username);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        token,
        name: inspector.name,
        username: inspector.username,
        message: 'Login successful'
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        message: 'Internal server error'
      })
    };
  }
};
