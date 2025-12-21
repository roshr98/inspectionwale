#!/bin/bash
# Deploy updated customer-listings Lambda function

echo "================================================"
echo "Deploying Customer Listings Lambda Function"
echo "================================================"

# Navigate to Lambda source directory
cd amplify/functions/customer-listings/src

# Create deployment package
echo "Creating deployment package..."
if [ -f "../customer-listings.zip" ]; then
    rm ../customer-listings.zip
fi

zip -r ../customer-listings.zip . -x "*.git*" -x "*.DS_Store"

echo "✓ Package created: amplify/functions/customer-listings/customer-listings.zip"
echo ""

# Get Lambda function name
FUNCTION_NAME="customerListings"
REGION="us-east-1"

echo "Lambda Function: $FUNCTION_NAME"
echo "Region: $REGION"
echo ""

# Check if AWS CLI is available and authenticated
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    exit 1
fi

# Test AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured or expired."
    echo "Please run: aws configure"
    echo "Or: aws sso login"
    exit 1
fi

echo "AWS credentials verified ✓"
echo ""

# Update Lambda function
echo "Updating Lambda function code..."
aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://../customer-listings.zip \
    --region "$REGION" \
    --no-cli-pager

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Lambda function updated successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Test the function with AWS Lambda console"
    echo "2. Run update-listing-schema.py to update existing records"
    echo "3. Test the form submission on the website"
else
    echo ""
    echo "❌ Failed to update Lambda function"
    echo "Please check AWS permissions and try again"
    exit 1
fi
