#!/usr/bin/env python3
"""
Script to update all existing car listings in DynamoDB with sellerType = "Individual"
"""

import boto3
from botocore.exceptions import ClientError
import sys

# AWS Configuration
REGION = 'us-east-1'
TABLE_NAME = 'CarListings'

def update_all_listings():
    """Update all existing listings to have sellerType = 'Individual'"""
    
    try:
        # Initialize DynamoDB client
        dynamodb = boto3.resource('dynamodb', region_name=REGION)
        table = dynamodb.Table(TABLE_NAME)
        
        print(f"Scanning table: {TABLE_NAME}")
        
        # Scan all items
        response = table.scan()
        items = response.get('Items', [])
        
        # Handle pagination
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response.get('Items', []))
        
        print(f"Found {len(items)} listings to update")
        
        updated_count = 0
        skipped_count = 0
        
        for item in items:
            listing_id = item.get('listingId')
            
            if not listing_id:
                print(f"Warning: Item without listingId found, skipping")
                skipped_count += 1
                continue
            
            # Check if sellerType already exists
            if 'sellerType' in item:
                print(f"Listing {listing_id} already has sellerType: {item['sellerType']}, skipping")
                skipped_count += 1
                continue
            
            try:
                # Update the item with sellerType
                table.update_item(
                    Key={'listingId': listing_id},
                    UpdateExpression='SET sellerType = :sellerType',
                    ExpressionAttributeValues={
                        ':sellerType': 'Individual'
                    }
                )
                
                print(f"✓ Updated listing {listing_id} with sellerType = 'Individual'")
                updated_count += 1
                
            except ClientError as e:
                print(f"✗ Error updating listing {listing_id}: {e.response['Error']['Message']}")
        
        print("\n" + "="*60)
        print(f"Update complete!")
        print(f"Total listings: {len(items)}")
        print(f"Updated: {updated_count}")
        print(f"Skipped: {skipped_count}")
        print("="*60)
        
        return updated_count > 0
        
    except ClientError as e:
        print(f"Error accessing DynamoDB: {e.response['Error']['Message']}")
        return False
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("Update Seller Type for All Existing Car Listings")
    print("="*60)
    print(f"Region: {REGION}")
    print(f"Table: {TABLE_NAME}")
    print()
    
    confirmation = input("This will update ALL existing listings to have sellerType='Individual'. Continue? (yes/no): ")
    
    if confirmation.lower() != 'yes':
        print("Operation cancelled.")
        sys.exit(0)
    
    print("\nStarting update process...\n")
    
    success = update_all_listings()
    
    if success:
        print("\n✓ Update completed successfully!")
        sys.exit(0)
    else:
        print("\n✗ Update failed or no items were updated.")
        sys.exit(1)
