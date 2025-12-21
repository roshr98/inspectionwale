#!/usr/bin/env python3
"""
Script to add location and sellerType fields to all existing car listings in DynamoDB
"""

import boto3
from botocore.exceptions import ClientError
import sys

# AWS Configuration
REGION = 'us-east-1'
TABLE_NAME = 'CarListings'

def update_all_listings_with_new_fields():
    """Add location and sellerType to all existing listings"""
    
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
            
            updates_needed = []
            update_expression_parts = []
            expression_values = {}
            
            # Check if sellerType exists
            if 'sellerType' not in item:
                updates_needed.append('sellerType')
                update_expression_parts.append('sellerType = :sellerType')
                expression_values[':sellerType'] = 'Individual'
                
                # Also update seller.type if seller object exists
                if 'seller' in item and isinstance(item['seller'], dict):
                    update_expression_parts.append('seller.#type = :sellerType')
            
            # Check if location exists at top level
            if 'location' not in item:
                # Try to get location from car.city or car.location
                car = item.get('car', {})
                location = car.get('city') or car.get('location') or ''
                
                if location:
                    updates_needed.append('location')
                    update_expression_parts.append('location = :location')
                    expression_values[':location'] = location
                    
                    # Also add to car object
                    if 'car' in item:
                        update_expression_parts.append('car.location = :location')
                        update_expression_parts.append('car.city = :location')
            
            # Check if car.fuelType exists
            car = item.get('car', {})
            if 'car' in item and 'fuelType' not in car:
                # Default to empty string if not available
                updates_needed.append('car.fuelType')
                update_expression_parts.append('car.fuelType = :fuelType')
                expression_values[':fuelType'] = ''
            
            if not updates_needed:
                print(f"Listing {listing_id} already has all required fields, skipping")
                skipped_count += 1
                continue
            
            try:
                # Build the update expression
                update_expression = 'SET ' + ', '.join(update_expression_parts)
                
                # Prepare the update parameters
                update_params = {
                    'Key': {'listingId': listing_id},
                    'UpdateExpression': update_expression,
                    'ExpressionAttributeValues': expression_values
                }
                
                # Add ExpressionAttributeNames if needed for reserved keywords
                if any('#type' in part for part in update_expression_parts):
                    update_params['ExpressionAttributeNames'] = {'#type': 'type'}
                
                table.update_item(**update_params)
                
                print(f"✓ Updated listing {listing_id} with: {', '.join(updates_needed)}")
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
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("="*60)
    print("Add Location and Seller Type Fields to Car Listings")
    print("="*60)
    print(f"Region: {REGION}")
    print(f"Table: {TABLE_NAME}")
    print()
    print("This will add the following fields:")
    print("  - sellerType (default: 'Individual')")
    print("  - location (from existing car.city if available)")
    print("  - car.fuelType (default: empty)")
    print()
    
    confirmation = input("Continue? (yes/no): ")
    
    if confirmation.lower() != 'yes':
        print("Operation cancelled.")
        sys.exit(0)
    
    print("\nStarting update process...\n")
    
    success = update_all_listings_with_new_fields()
    
    if success:
        print("\n✓ Update completed successfully!")
        sys.exit(0)
    else:
        print("\n✗ Update failed or no items were updated.")
        sys.exit(1)
