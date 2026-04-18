// Test Data Helper for Development
// This file exposes functions globally for easy testing in the console

const testData = {
  "report": {
    "title": "Vehicle Inspection Report",
    "tagline": "The Hassle-Free Car Buying Experience.",
    "subtagline": "Repair Estimate | Price Advice Neutral | Uncomplicated | Comprehensive"
  },
  "inspection": {
    "id": "IW-2025-001234",
    "date": "2025-12-22",
    "location": "Mumbai, Maharashtra",
    "inspector_name": "Rajesh Kumar"
  },
  "vehicle": {
    "registration_number": "MH 02 AB 1234",
    "manufacturing_date": "March 2019",
    "chassis_number": "MA3EWD81S00123456",
    "engine_number": "K12M1234567",
    "registration_date": "2019-04-15",
    "insurance_validity": "2026-03-10",
    "owner_name": "Amit Sharma",
    "make_model": "Maruti Suzuki Swift",
    "variant": "VXI (O) AT",
    "fuel_type": "Petrol",
    "owner_count": "2nd Owner",
    "rc_type": "Private",
    "hypothecation": "No",
    "cng": {
      "present": "Yes",
      "type": "Company Fitted",
      "validity": "2027-06-30",
      "endorsed": "Yes"
    }
  },
  "ratings": {
    "interior": "4",
    "exterior": "4",
    "engine": "5",
    "test_drive": "4",
    "structure": "5",
    "electrical": "4"
  },
  "flags": {
    "accidental": "No",
    "flood_damage": "No",
    "fire_damage": "No",
    "rc_chassis_match": "Yes",
    "service_logs_available": "Yes",
    "has_cng": "Yes",
    "has_hypothecation": "No"
  },
  "comments": {
    "engine": "Engine runs smoothly with no oil leaks detected. All components are in excellent condition.",
    "structure": "All structural members are intact with no signs of accident or damage.",
    "test_drive": "Excellent performance during test drive. No vibrations or unusual noises.",
    "exterior": "Minor scratches on front bumper. Overall paint condition is good with no major dents.",
    "interior": "Well-maintained interior. Seats and dashboard are in excellent condition.",
    "interior_additional": "The interior of the vehicle is in excellent condition throughout. Seats are free from tears, stains, or excessive wear. Dashboard and all controls are functioning perfectly. Air conditioning system works efficiently. All electronic features including power windows, central locking, and music system are operational. Boot space is clean and well-maintained with all tools and accessories intact."
  },
  "front": {
    "bumper_condition": "Minor Scratches",
    "bumper_repainted": "No",
    "bumper_paint_depth": "120 µm",
    "bonnet_condition": "Excellent",
    "bonnet_repainted": "No",
    "bonnet_paint_depth": "115 µm",
    "bonnet_company_fitted": "Yes",
    "grill_condition": "Good - Minor chips on edges",
    "windshield_original": "Yes",
    "windshield_condition": "No cracks or chips",
    "headlight_condition": "Excellent - No fogging"
  },
  "rhs": {
    "fender_condition": "Excellent",
    "fender_repainted": "No",
    "fender_paint_depth": "118 µm",
    "front_door_condition": "Good",
    "front_door_repainted": "No",
    "front_door_paint_depth": "122 µm",
    "front_door_company_fitted": "Yes",
    "rear_door_condition": "Excellent",
    "rear_door_repainted": "No",
    "rear_door_paint_depth": "117 µm",
    "rear_door_company_fitted": "Yes",
    "quarter_panel_condition": "Excellent",
    "quarter_panel_repainted": "No",
    "quarter_panel_paint_depth": "119 µm",
    "window_glass_original": "Yes",
    "side_mirror_condition": "Excellent"
  },
  "lhs": {
    "fender_condition": "Excellent",
    "fender_repainted": "No",
    "fender_paint_depth": "116 µm",
    "front_door_condition": "Good",
    "front_door_repainted": "No",
    "front_door_paint_depth": "120 µm",
    "front_door_company_fitted": "Yes",
    "rear_door_condition": "Excellent",
    "rear_door_repainted": "No",
    "rear_door_paint_depth": "118 µm",
    "rear_door_company_fitted": "Yes",
    "quarter_panel_condition": "Excellent",
    "quarter_panel_repainted": "No",
    "quarter_panel_paint_depth": "117 µm",
    "window_glass_original": "Yes",
    "side_mirror_condition": "Excellent"
  },
  "rear": {
    "bumper_condition": "Minor Scratches",
    "bumper_repainted": "No",
    "bumper_paint_depth": "119 µm",
    "windshield_condition": "Excellent",
    "windshield_original": "Yes",
    "tailgate_condition": "Excellent",
    "tailgate_repainted": "No",
    "tailgate_paint_depth": "117 µm",
    "tailgate_original": "Yes",
    "tail_lights_condition": "Excellent - No cracks"
  },
  "roof": {
    "condition": "Excellent",
    "type": "Standard Metal Roof",
    "paint_depth": "115 µm",
    "repainted": "No"
  },
  "interior": {
    "mil_light": "Not Illuminated",
    "dashboard_condition": "Excellent",
    "music_system": "Working",
    "steering_controls": "Working",
    "paddle_shifters": "Not Available",
    "hand_brake": "Working",
    "speakers": "Working",
    "ac_vents": "All Working",
    "ac_working": "Excellent",
    "steering_type": "Power Steering",
    "cruise_control": "Working",
    "navigation": "Not Available",
    "glove_box": "Working",
    "cabin_lights": "All Working",
    "headlights": "All Working",
    "wipers": "Working",
    "trip_switch": "Working",
    "boot_lever": "Working",
    "central_lock": "Working",
    "rear_wiper": "Working",
    "rear_view_mirror": "Excellent",
    "bonnet_lever": "Working",
    "side_mirror_adjustment": "Working",
    "fuel_lid_lever": "Working",
    "power_windows": "All Working"
  },
  "seats": {
    "front_condition": "Excellent - No tears or stains",
    "adjustment_type": "Manual",
    "adjustment_working": "Yes",
    "seat_belts": "All Working"
  },
  "rear_seats": {
    "condition": "Excellent - Clean and well-maintained",
    "arm_rest": "Available & Working",
    "ac_vent": "Working",
    "rhs_panel": "Excellent",
    "lhs_panel": "Excellent"
  },
  "boot": {
    "condition": "Clean and spacious",
    "jack_available": "Complete set available"
  },
  "engine": {
    "oil_leak": "No leaks detected",
    "battery_condition": "Excellent - Good voltage",
    "hose_pipes": "Good condition",
    "oil_condition": "Clean - At proper level",
    "wiring": "Neat and intact",
    "mounting": "Good condition",
    "brake_oil_level": "At proper level",
    "coolant_level": "At proper level",
    "belts": "Good condition",
    "firewall_rust": "No rust detected",
    "estimated_repair_cost": "₹0 - No repairs needed"
  },
  "tyres": {
    "rhs_front": {
      "brand": "MRF ZVTS",
      "wheel_type": "Alloy",
      "remaining_life": "70%",
      "estimated_cost": "₹0"
    },
    "rhs_rear": {
      "brand": "MRF ZVTS",
      "wheel_type": "Alloy",
      "remaining_life": "65%",
      "estimated_cost": "₹0"
    },
    "lhs_front": {
      "brand": "MRF ZVTS",
      "wheel_type": "Alloy",
      "remaining_life": "68%",
      "estimated_cost": "₹0"
    },
    "lhs_rear": {
      "brand": "MRF ZVTS",
      "wheel_type": "Alloy",
      "remaining_life": "66%",
      "estimated_cost": "₹0"
    },
    "spare": {
      "brand": "MRF",
      "wheel_type": "Steel",
      "remaining_life": "95%",
      "estimated_cost": "₹0"
    }
  },
  "structure": {
    "upper_member": "Excellent - No damage",
    "lhs_apron": "Original - No repairs",
    "rhs_apron": "Original - No repairs",
    "a_pillar_lhs": "Original - Intact",
    "a_pillar_rhs": "Original - Intact",
    "b_pillar_lhs": "Original - Intact",
    "b_pillar_rhs": "Original - Intact",
    "c_pillar_lhs": "Original - Intact",
    "c_pillar_rhs": "Original - Intact",
    "fender_wall_lhs": "Original - Good",
    "fender_wall_rhs": "Original - Good",
    "cross_member": "Excellent - No damage",
    "lower_member": "Excellent - No damage",
    "dicky_tub": "Original - Good",
    "tailgate_frame": "Original - Good"
  },
  "performance": {
    "steering": "Smooth and responsive",
    "alignment": "Perfect - No pulling",
    "ignition": "Instant start",
    "clutch": "Smooth engagement",
    "brakes": "Excellent - No noise",
    "gear_shift": "Smooth - No grinding",
    "acceleration": "Excellent response",
    "cng_mode": "Switches smoothly",
    "suspension": "Comfortable - No issues",
    "engine_noise": "Minimal - Normal operation",
    "wheel_alignment": "Perfect",
    "estimated_repair_cost": "₹0 - No repairs needed"
  },
  "images": {
    "rhs_apron": "https://images.unsplash.com/photo-1752774581629-464238ee6996?w=800",
    "lhs_apron": "https://images.unsplash.com/photo-1752774581629-464238ee6996?w=800",
    "chassis_plate": "https://images.unsplash.com/photo-1723599615344-a7a26c0df543?w=800",
    "cng_plate": "https://images.unsplash.com/photo-1714561345036-2aa006cd8a60?w=800",
    "vehicle_front": "https://images.unsplash.com/photo-1559930449-9211652bac34?w=1200",
    "vehicle_rhs": "https://images.unsplash.com/photo-1613922487761-e6717de65c46?w=1200",
    "vehicle_lhs": "https://images.unsplash.com/photo-1613922487761-e6717de65c46?w=1200",
    "vehicle_rear": "https://images.unsplash.com/photo-1715598147171-12a86aad5b63?w=1200",
    "dashboard": "https://images.unsplash.com/photo-1710083521061-c1b1701c5d95?w=1200",
    "cluster_meter": "https://images.unsplash.com/photo-1710083521061-c1b1701c5d95?w=800",
    "driver_cabin": "https://images.unsplash.com/photo-1710083521061-c1b1701c5d95?w=1200",
    "rear_cabin": "https://images.unsplash.com/photo-1710083521061-c1b1701c5d95?w=1200",
    "boot_space": "https://images.unsplash.com/photo-1710083521061-c1b1701c5d95?w=1200",
    "engine_compartment": "https://images.unsplash.com/photo-1752774581629-464238ee6996?w=1200",
    "firewall": "https://images.unsplash.com/photo-1752774581629-464238ee6996?w=800",
    "battery": "https://images.unsplash.com/photo-1752774581629-464238ee6996?w=800",
    "tyre_rhs_front": "https://images.unsplash.com/photo-1591004835292-2516a9074f85?w=800",
    "tyre_rhs_rear": "https://images.unsplash.com/photo-1591004835292-2516a9074f85?w=800",
    "tyre_lhs_front": "https://images.unsplash.com/photo-1591004835292-2516a9074f85?w=800",
    "tyre_lhs_rear": "https://images.unsplash.com/photo-1591004835292-2516a9074f85?w=800",
    "spare_tyre": "https://images.unsplash.com/photo-1591004835292-2516a9074f85?w=800"
  }
};

// Function to prefill the inspection form with test data
export function prefillInspectionForm() {
  try {
    localStorage.setItem('inspectionData', JSON.stringify(testData));
    console.log('✅ Test data has been loaded into cache!');
    console.log('🔄 Reloading page to show prefilled form...');
    console.log('\n🔍 Preview of loaded data:');
    console.table({
      'Inspection ID': testData.inspection.id,
      'Vehicle': testData.vehicle.make_model,
      'Registration': testData.vehicle.registration_number,
      'Owner': testData.vehicle.owner_name,
      'Location': testData.inspection.location
    });
    
    // Auto-reload after 1 second
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return testData;
  } catch (error) {
    console.error('❌ Error loading test data:', error);
    return null;
  }
}

// Function to clear the form data
export function clearInspectionForm() {
  try {
    localStorage.removeItem('inspectionData');
    console.log('🗑️ Form data has been cleared from cache!');
    console.log('🔄 Reloading page to show empty form...');
    
    // Auto-reload after 1 second
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing form data:', error);
    return false;
  }
}

// Function to view current form data
export function viewInspectionData() {
  try {
    const data = localStorage.getItem('inspectionData');
    if (data) {
      const parsed = JSON.parse(data);
      console.log('📊 Current inspection data in cache:');
      console.log(parsed);
      return parsed;
    } else {
      console.log('ℹ️ No inspection data found in cache.');
      return null;
    }
  } catch (error) {
    console.error('❌ Error viewing inspection data:', error);
    return null;
  }
}

// Initialize and expose functions globally for development
export function initTestDataHelper() {
  if (typeof window !== 'undefined') {
    // Expose functions only on the current window (iframe context)
    // @ts-ignore
    window.prefillInspectionForm = prefillInspectionForm;
    // @ts-ignore
    window.clearInspectionForm = clearInspectionForm;
    // @ts-ignore
    window.viewInspectionData = viewInspectionData;
    // @ts-ignore
    window.showTestHelp = () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║      🚗 VEHICLE INSPECTION FORM - TEST DATA HELPER 🚗         ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ✨ USE THE BUTTONS IN THE FORM HEADER:                        ║
║                                                                ║
║  🟣 "Load Test Data" - Fill form with sample data             ║
║  🔴 "Clear All" - Reset form to empty state                   ║
║  🟢 "Save Data" - Save current form data                      ║
║  🔵 "View Report" - Generate PDF report                       ║
║                                                                ║
║  ⚡ Auto-Save: Form data saves automatically every 500ms       ║
║     Your data persists across page refreshes!                  ║
║                                                                ║
║  📋 Console Commands (for advanced users):                    ║
║                                                                ║
║  prefillInspectionForm()  → Load test data                    ║
║  clearInspectionForm()    → Clear all data                    ║
║  viewInspectionData()     → View cached data                  ║
║  showTestHelp()           → Show this help                    ║
║                                                                ║
║  Note: Due to iframe security, console commands only work     ║
║  in this iframe's console. Use the UI buttons instead!        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);
    };
    
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║      🚗 VEHICLE INSPECTION FORM - TEST DATA HELPER 🚗         ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ✨ USE THE BUTTONS IN THE FORM HEADER:                        ║
║                                                                ║
║  🟣 "Load Test Data" - Fill form with sample data             ║
║  🔴 "Clear All" - Reset form to empty state                   ║
║  🟢 "Save Data" - Save current form data                      ║
║  🔵 "View Report" - Generate PDF report                       ║
║                                                                ║
║  ⚡ Auto-Save: Form data saves automatically every 500ms       ║
║     Your data persists across page refreshes!                  ║
║                                                                ║
║  📋 Console Commands (for advanced users):                    ║
║                                                                ║
║  prefillInspectionForm()  → Load test data                    ║
║  clearInspectionForm()    → Clear all data                    ║
║  viewInspectionData()     → View cached data                  ║
║  showTestHelp()           → Show this help                    ║
║                                                                ║
║  Note: Due to iframe security, console commands only work     ║
║  in this iframe's console. Use the UI buttons instead!        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `);
  }
}