#!/usr/bin/env python3
"""
Add 4 Placeholder Car Listings to DynamoDB
This script reads SEED_CAR_LISTINGS.json and adds each listing to the CarListings table
"""

import json
import subprocess
import sys

def run_command(cmd):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def add_listing_to_dynamodb(listing):
    """Add a single listing to DynamoDB using AWS CLI"""
    # Convert Python dict to JSON string for CLI
    item_json = json.dumps(listing)
    
    # Create a temporary file with the item
    temp_file = f"temp-{listing['listingId']}.json"
    with open(temp_file, 'w') as f:
        json.dump(listing, f)
    
    # Use AWS CLI to put the item
    cmd = f'aws dynamodb put-item --table-name CarListings --region us-east-1 --item file://{temp_file}'
    success, stdout, stderr = run_command(cmd)
    
    # Clean up temp file
    try:
        import os
        os.remove(temp_file)
    except:
        pass
    
    return success, stderr

def main():
    print("🚗 Adding 4 Placeholder Car Listings to DynamoDB...")
    print("=" * 60)
    
    # Read seed data
    try:
        with open('SEED_CAR_LISTINGS.json', 'r') as f:
            listings = json.load(f)
    except FileNotFoundError:
        print("❌ Error: SEED_CAR_LISTINGS.json not found!")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON: {e}")
        sys.exit(1)
    
    # Add each listing
    success_count = 0
    for i, listing in enumerate(listings, 1):
        car_name = f"{listing['car']['make']} {listing['car']['model']} ({listing['car']['registrationYear']})"
        print(f"\n[{i}/4] Adding: {car_name}...")
        
        # Convert to DynamoDB format
        dynamodb_item = convert_to_dynamodb_format(listing)
        
        success, error = add_listing_to_dynamodb(dynamodb_item)
        
        if success:
            print(f"✅ Successfully added: {car_name}")
            success_count += 1
        else:
            print(f"❌ Failed to add: {car_name}")
            if error:
                print(f"   Error: {error}")
    
    print("\n" + "=" * 60)
    print(f"✅ Added {success_count}/4 placeholder listings successfully!")
    print("=" * 60)
    
    # Verify
    print("\n🔍 Verifying listings in DynamoDB...")
    cmd = 'aws dynamodb scan --table-name CarListings --region us-east-1 --select COUNT'
    success, stdout, stderr = run_command(cmd)
    if success:
        try:
            result = json.loads(stdout)
            count = result.get('Count', 0)
            print(f"✅ Total listings in table: {count}")
        except:
            print("✅ Listings added (count verification failed)")
    
    print("\n🎉 Placeholder listings are ready!")
    print("📝 These 4 cars will be visible on your website after deployment.\n")

def convert_to_dynamodb_format(listing):
    """Convert JSON listing to DynamoDB item format"""
    return {
        "listingId": {"S": listing["listingId"]},
        "status": {"S": listing["status"]},
        "isPlaceholder": {"BOOL": listing["isPlaceholder"]},
        "createdAt": {"S": listing["createdAt"]},
        "updatedAt": {"S": listing["updatedAt"]},
        "seller": {
            "M": {
                "name": {"S": listing["seller"]["name"]},
                "mobile": {"S": listing["seller"]["mobile"]},
                "email": {"S": listing["seller"]["email"]}
            }
        },
        "car": {
            "M": {
                "make": {"S": listing["car"]["make"]},
                "model": {"S": listing["car"]["model"]},
                "edition": {"S": listing["car"]["edition"]},
                "registrationYear": {"S": listing["car"]["registrationYear"]},
                "kmsDriven": {"S": listing["car"]["kmsDriven"]},
                "expectedPrice": {"S": listing["car"]["expectedPrice"]}
            }
        },
        "photos": {
            "M": {
                "exteriorFront": {
                    "M": {
                        "key": {"S": listing["photos"]["exteriorFront"]["key"]},
                        "url": {"S": listing["photos"]["exteriorFront"]["url"]},
                        "contentType": {"S": listing["photos"]["exteriorFront"]["contentType"]}
                    }
                },
                "exteriorBack": {
                    "M": {
                        "key": {"S": listing["photos"]["exteriorBack"]["key"]},
                        "url": {"S": listing["photos"]["exteriorBack"]["url"]},
                        "contentType": {"S": listing["photos"]["exteriorBack"]["contentType"]}
                    }
                },
                "exteriorLeft": {
                    "M": {
                        "key": {"S": listing["photos"]["exteriorLeft"]["key"]},
                        "url": {"S": listing["photos"]["exteriorLeft"]["url"]},
                        "contentType": {"S": listing["photos"]["exteriorLeft"]["contentType"]}
                    }
                },
                "exteriorRight": {
                    "M": {
                        "key": {"S": listing["photos"]["exteriorRight"]["key"]},
                        "url": {"S": listing["photos"]["exteriorRight"]["url"]},
                        "contentType": {"S": listing["photos"]["exteriorRight"]["contentType"]}
                    }
                },
                "interiorSeat": {
                    "M": {
                        "key": {"S": listing["photos"]["interiorSeat"]["key"]},
                        "url": {"S": listing["photos"]["interiorSeat"]["url"]},
                        "contentType": {"S": listing["photos"]["interiorSeat"]["contentType"]}
                    }
                },
                "interiorCluster": {
                    "M": {
                        "key": {"S": listing["photos"]["interiorCluster"]["key"]},
                        "url": {"S": listing["photos"]["interiorCluster"]["url"]},
                        "contentType": {"S": listing["photos"]["interiorCluster"]["contentType"]}
                    }
                }
            }
        }
    }

if __name__ == "__main__":
    main()
