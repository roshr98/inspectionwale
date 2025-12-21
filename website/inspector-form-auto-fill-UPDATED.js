/**
 * InspectionWale - Complete Auto-Fill Inspector Form Script
 * Updated for 13-Page PDF with 175+ Fields + Hindi/English Bilingual Support
 * 
 * USAGE:
 * 1. Open inspector-form.html on STAGING: https://staging.daouxvnc3zwm.amplifyapp.com/inspector-form.html
 * 2. Login as inspector (if required)
 * 3. Open browser console (F12)
 * 4. Copy-paste this ENTIRE script
 * 5. Press Enter
 * 6. Wait 30-60 seconds for auto-fill + photo uploads
 * 7. Form auto-submits → PDF downloads
 * 
 * Last Updated: December 21, 2025 (Phase 9 Complete)
 * Total Fields: 178 (all 175 Lambda fields + 3 form-only)
 * Photo Uploads: 46 required photos
 */

(async function autoFillInspectorForm() {
    console.log('🚀 InspectionWale Auto-Fill Script v2.0 (Phase 9 Complete)');
    console.log('📊 Filling 178 fields + uploading 46 photos...\n');
    
    const startTime = Date.now();
    
    // ==================== HELPER FUNCTIONS ====================
    
    function createTestImage(label, width = 800, height = 600) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#4a90e2');
        gradient.addColorStop(1, '#67b26f');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, width / 2, height / 2 - 30);
        
        // Timestamp
        ctx.font = '20px Arial';
        ctx.fillText(new Date().toLocaleString(), width / 2, height / 2 + 30);
        
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(new File([blob], `${label.replace(/\s+/g, '_')}.jpg`, { type: 'image/jpeg' }));
            }, 'image/jpeg', 0.85);
        });
    }
    
    async function setFileInput(inputName, label) {
        const input = document.querySelector(`input[name="${inputName}"]`);
        if (!input) {
            console.warn(`⚠️ Photo input not found: ${inputName}`);
            return false;
        }
        
        const file = await createTestImage(label);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        
        // Trigger preview
        if (typeof previewImage === 'function') {
            const previewId = input.getAttribute('onchange')?.match(/preview_(\w+)/)?.[1];
            if (previewId) previewImage(input, `preview_${previewId}`);
        }
        
        return true;
    }
    
    function fillInput(name, value) {
        const input = document.querySelector(`input[name="${name}"], select[name="${name}"], textarea[name="${name}"]`);
        if (input) {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
        return false;
    }
    
    function checkRadio(name, value) {
        const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
        return false;
    }
    
    let fieldsFilled = 0;
    let photosUploaded = 0;
    
    // ==================== SECTION 1: VEHICLE REGISTRATION ====================
    console.log('📋 [1/20] Vehicle Registration Details...');
    fieldsFilled += fillInput('registrationNumber', 'MH04KD2255') ? 1 : 0;
    fieldsFilled += fillInput('make', 'Toyota') ? 1 : 0;
    fieldsFilled += fillInput('model', 'Fortuner') ? 1 : 0;
    fieldsFilled += fillInput('variant', 'VX 4x4 AT Diesel') ? 1 : 0;
    fieldsFilled += fillInput('vinNumber', 'MALPG232CS301234') ? 1 : 0;
    fieldsFilled += fillInput('engineNumber', '2GD1234567') ? 1 : 0;
    fieldsFilled += fillInput('manufactureYear', '2020') ? 1 : 0;
    fieldsFilled += fillInput('registrationDate', '2020-03-15') ? 1 : 0;
    fieldsFilled += fillInput('color', 'Pearl White') ? 1 : 0;
    fieldsFilled += fillInput('fuelType', 'Diesel') ? 1 : 0;
    fieldsFilled += fillInput('odometerReading', '45000') ? 1 : 0;
    fieldsFilled += fillInput('ownersCount', '1') ? 1 : 0;
    
    // ==================== SECTION 2: OWNER DETAILS ====================
    console.log('👤 [2/20] Owner Details...');
    fieldsFilled += fillInput('ownerName', 'Rajesh Kumar Sharma') ? 1 : 0;
    fieldsFilled += fillInput('ownerContact', '9876543210') ? 1 : 0;
    fieldsFilled += fillInput('ownerEmail', 'rajesh.sharma@gmail.com') ? 1 : 0;
    fieldsFilled += fillInput('location', 'Navi Mumbai, Maharashtra') ? 1 : 0;
    
    // ==================== SECTION 3: OVERALL RATINGS (6 FIELDS) ====================
    console.log('⭐ [3/20] Overall Ratings (1-5 stars)...');
    fieldsFilled += fillInput('rating_interior', '4') ? 1 : 0;
    fieldsFilled += fillInput('rating_exterior', '5') ? 1 : 0;
    fieldsFilled += fillInput('rating_engine', '5') ? 1 : 0;
    fieldsFilled += fillInput('rating_structure', '5') ? 1 : 0;
    fieldsFilled += fillInput('rating_test_drive', '4') ? 1 : 0;
    fieldsFilled += fillInput('rating_electrical', '5') ? 1 : 0;
    
    // ==================== SECTION 4: CNG FIELDS (3 CONDITIONAL) ====================
    console.log('⛽ [4/20] CNG Fields (conditional - N/A for Diesel)...');
    // CNG fields only shown if fuelType === 'CNG', skipping for Diesel
    
    // ==================== SECTION 5: HIGHLIGHTS (5 NEW FIELDS) ====================
    console.log('🔍 [5/20] Key Highlights...');
    fieldsFilled += checkRadio('isAccidental', 'No') ? 1 : 0;
    fieldsFilled += checkRadio('floodDamage', 'No') ? 1 : 0;
    fieldsFilled += checkRadio('fireDamage', 'No') ? 1 : 0;
    fieldsFilled += checkRadio('rcChassisMatch', 'Yes') ? 1 : 0;
    fieldsFilled += checkRadio('serviceLogAvailable', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('insuranceType', 'Comprehensive') ? 1 : 0;
    fieldsFilled += fillInput('insuranceValidity', '2026-03-15') ? 1 : 0;
    fieldsFilled += fillInput('highlights', 'Single owner, full service history, excellent condition, no accidents, all original parts, regularly maintained at authorized service center.') ? 1 : 0;
    
    // ==================== SECTION 6: DOCUMENT PHOTOS (3 PHOTOS) ====================
    console.log('📸 [6/20] Document Photos (3)...');
    photosUploaded += await setFileInput('photo_rcBook', 'RC Book') ? 1 : 0;
    photosUploaded += await setFileInput('photo_chassisPlate', 'Chassis Plate') ? 1 : 0;
    photosUploaded += await setFileInput('photo_odometer', 'Odometer Reading') ? 1 : 0;
    
    // ==================== SECTION 7: EXTERIOR PHOTOS (18 PHOTOS) ====================
    console.log('🚗 [7/20] Exterior Photos (18)...');
    // Front (6)
    photosUploaded += await setFileInput('photo_frontBumper', 'Front Bumper') ? 1 : 0;
    photosUploaded += await setFileInput('photo_bonnet', 'Bonnet/Hood') ? 1 : 0;
    photosUploaded += await setFileInput('photo_frontGrille', 'Front Grille') ? 1 : 0;
    photosUploaded += await setFileInput('photo_headlights', 'Headlights') ? 1 : 0;
    photosUploaded += await setFileInput('photo_windshield', 'Front Windshield') ? 1 : 0;
    photosUploaded += await setFileInput('photo_wipers', 'Wipers') ? 1 : 0;
    // Sides (6)
    photosUploaded += await setFileInput('photo_doorDriverFront', 'Driver Front Door') ? 1 : 0;
    photosUploaded += await setFileInput('photo_doorDriverRear', 'Driver Rear Door') ? 1 : 0;
    photosUploaded += await setFileInput('photo_doorPassengerFront', 'Passenger Front Door') ? 1 : 0;
    photosUploaded += await setFileInput('photo_doorPassengerRear', 'Passenger Rear Door') ? 1 : 0;
    photosUploaded += await setFileInput('photo_mirrorLeft', 'Left Mirror') ? 1 : 0;
    photosUploaded += await setFileInput('photo_mirrorRight', 'Right Mirror') ? 1 : 0;
    // Rear (6)
    photosUploaded += await setFileInput('photo_rearBumper', 'Rear Bumper') ? 1 : 0;
    photosUploaded += await setFileInput('photo_bootClosed', 'Boot Closed') ? 1 : 0;
    photosUploaded += await setFileInput('photo_bootOpen', 'Boot Open') ? 1 : 0;
    photosUploaded += await setFileInput('photo_taillights', 'Tail Lights') ? 1 : 0;
    photosUploaded += await setFileInput('photo_rearWindshield', 'Rear Windshield') ? 1 : 0;
    photosUploaded += await setFileInput('photo_roof', 'Roof') ? 1 : 0;
    
    // ==================== SECTION 8: EXTERIOR CONDITION (23 FIELDS) ====================
    console.log('🔧 [8/20] Exterior Condition Assessment (23)...');
    fieldsFilled += fillInput('front_bumper_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('hood_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('front_grill_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('front_windshield_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('is_front_windshield_original', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('headlight_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('rhs_fender_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('rhs_front_door_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('rhs_quarter_panel_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('rhs_rear_door_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('rhs_side_mirror_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('lhs_fender_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('lhs_front_door_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('lhs_quarter_panel_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('lhs_rear_door_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('lhs_side_mirror_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('rear_bumper_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('rear_windshield_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('is_rear_windshield_original', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('tail_gate_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('taillight_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('roof_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('roof_type', 'Sunroof') ? 1 : 0;
    
    // ==================== SECTION 9: PAINT DEPTHS (13 FIELDS) ====================
    console.log('📏 [9/20] Paint Depth Readings (13 microns)...');
    fieldsFilled += fillInput('paint_depth_front_bumper', '110') ? 1 : 0;
    fieldsFilled += fillInput('paint_depth_hood', '105') ? 1 : 0;
    fieldsFilled += fillInput('paint_depth_roof', '100') ? 1 : 0;
    fieldsFilled += fillInput('paint_depth_rhs_front_door', '108') ? 1 : 0;
    fieldsFilled += fillInput('paint_depth_rhs_rear_door', '110') ? 1 : 0;
    fieldsFilled += fillInput('paint_depth_rhs_fender', '112') ? 1 : 0;
    fieldsFilled += fillInput('paint_depth_rhs_quarter', '105') ? 1 : 0;
    fieldsFilled += fillInput('paint_depth_lhs_front_door', '107') ? 1 : 0;
    fieldsFilled += fillInput('paint_depth_lhs_rear_door', '109') ? 1 : 0;
    fieldsFilled += fillInput('paint_depth_lhs_fender', '111') ? 1 : 0;
    fieldsFilled += fillInput('paint_depth_lhs_quarter', '106') ? 1 : 0;
    fieldsFilled += fillInput('paint_depth_rear_bumper', '115') ? 1 : 0;
    fieldsFilled += fillInput('paint_depth_tail_gate', '104') ? 1 : 0;
    
    // ==================== SECTION 10: REPAINTED STATUS (13 FIELDS) ====================
    console.log('🎨 [10/20] Repainted Status (13)...');
    fieldsFilled += fillInput('is_front_bumper_repainted', 'No') ? 1 : 0;
    fieldsFilled += fillInput('is_hood_repainted', 'No') ? 1 : 0;
    fieldsFilled += fillInput('is_roof_repainted', 'No') ? 1 : 0;
    fieldsFilled += fillInput('is_rhs_front_door_repainted', 'No') ? 1 : 0;
    fieldsFilled += fillInput('is_rhs_rear_door_repainted', 'No') ? 1 : 0;
    fieldsFilled += fillInput('is_rhs_fender_repainted', 'No') ? 1 : 0;
    fieldsFilled += fillInput('is_rhs_quarter_repainted', 'No') ? 1 : 0;
    fieldsFilled += fillInput('is_lhs_front_door_repainted', 'No') ? 1 : 0;
    fieldsFilled += fillInput('is_lhs_rear_door_repainted', 'No') ? 1 : 0;
    fieldsFilled += fillInput('is_lhs_fender_repainted', 'No') ? 1 : 0;
    fieldsFilled += fillInput('is_lhs_quarter_repainted', 'No') ? 1 : 0;
    fieldsFilled += fillInput('is_rear_bumper_repainted', 'No') ? 1 : 0;
    fieldsFilled += fillInput('is_tail_gate_repainted', 'No') ? 1 : 0;
    
    // ==================== SECTION 11: COMPANY FITTED (10 FIELDS) ====================
    console.log('✅ [11/20] Company Fitted / Original Parts (10)...');
    fieldsFilled += fillInput('is_hood_company_fitted', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('is_front_windshield_company_fitted', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('is_rear_windshield_company_fitted', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('is_rhs_windows_company_fitted', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('is_lhs_windows_company_fitted', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('is_rhs_front_door_company_fitted', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('is_rhs_rear_door_company_fitted', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('is_lhs_front_door_company_fitted', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('is_lhs_rear_door_company_fitted', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('is_tail_gate_company_fitted', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('paintNotes', 'All panels original factory paint. Consistent paint depth across all surfaces (100-115 microns). No evidence of repainting or bodywork. Minor stone chips on front bumper and bonnet. Overall excellent paint condition with good gloss.') ? 1 : 0;
    
    // ==================== SECTION 12: INTERIOR PHOTOS (8 PHOTOS) ====================
    console.log('🪑 [12/20] Interior Photos (8)...');
    photosUploaded += await setFileInput('photo_dashboard', 'Dashboard') ? 1 : 0;
    photosUploaded += await setFileInput('photo_instrumentCluster', 'Instrument Cluster') ? 1 : 0;
    photosUploaded += await setFileInput('photo_steeringWheel', 'Steering Wheel') ? 1 : 0;
    photosUploaded += await setFileInput('photo_frontSeats', 'Front Seats') ? 1 : 0;
    photosUploaded += await setFileInput('photo_rearSeats', 'Rear Seats') ? 1 : 0;
    photosUploaded += await setFileInput('photo_acPanel', 'AC Control Panel') ? 1 : 0;
    photosUploaded += await setFileInput('photo_musicSystem', 'Music System') ? 1 : 0;
    photosUploaded += await setFileInput('photo_gearLever', 'Gear Lever') ? 1 : 0;
    photosUploaded += await setFileInput('photo_interiorRoof', 'Interior Roof') ? 1 : 0;
    
    // ==================== SECTION 13: INTERIOR ELECTRONICS (26 FIELDS) ====================
    console.log('💡 [13/20] Interior Electronics & Controls (26)...');
    fieldsFilled += fillInput('is_mil_light_on', 'No') ? 1 : 0;
    fieldsFilled += fillInput('music_system_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('ac_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('steering_mounted_controls', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('paddle_shifters_working', 'N/A') ? 1 : 0;
    fieldsFilled += fillInput('hand_brake_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('speakers_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('horn_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('hazard_lights_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('parking_brake_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('door_locks_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('navigation_system_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('glove_box_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('cabin_lights_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('headlights_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('wipers_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('trip_switch_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('boot_lever_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('indicators_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('central_lock_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('rear_wiper_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('rear_view_mirror_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('bonnet_lever_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('side_mirror_adjustments_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('fuel_lid_lever_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('power_windows_working', 'Yes') ? 1 : 0;
    
    // ==================== SECTION 14: INTERIOR/CABIN CONDITION (15 FIELDS) ====================
    console.log('🛋️ [14/20] Interior/Cabin Condition (15)...');
    fieldsFilled += fillInput('front_seat_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('seat_adjustment_type', 'Power') ? 1 : 0;
    fieldsFilled += fillInput('seat_adjustments_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('seat_belts_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('front_rhs_interior_panel', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('arm_rest_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('front_lhs_interior_panel', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('rear_seat_condition', 'Excellent') ? 1 : 0;
    fieldsFilled += fillInput('rear_seatbelts_working', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('rear_arm_rest_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('rear_rhs_interior_panel', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('rear_ac_vent', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('rear_lhs_interior_panel', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('boot_condition', 'Clean') ? 1 : 0;
    fieldsFilled += fillInput('boot_carpets', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('interiorNotes', 'Interior in excellent condition. Leather seats clean with minor wear on driver bolster. Dashboard crack-free. All electronics functional. AC cooling excellent. Infotainment responsive. No odors. Original floor mats. Headliner intact.') ? 1 : 0;
    
    // ==================== SECTION 15: ENGINE PHOTOS (6 PHOTOS) ====================
    console.log('⚙️ [15/20] Engine Bay Photos (6)...');
    photosUploaded += await setFileInput('photo_engineBay', 'Engine Bay Overall') ? 1 : 0;
    photosUploaded += await setFileInput('photo_battery', 'Battery') ? 1 : 0;
    photosUploaded += await setFileInput('photo_oilCap', 'Oil Cap') ? 1 : 0;
    photosUploaded += await setFileInput('photo_coolant', 'Coolant Reservoir') ? 1 : 0;
    photosUploaded += await setFileInput('photo_brakeFluid', 'Brake Fluid') ? 1 : 0;
    photosUploaded += await setFileInput('photo_beltsHoses', 'Belts & Hoses') ? 1 : 0;
    
    // ==================== SECTION 16: ENGINE CONDITION (11 FIELDS) ====================
    console.log('🔩 [16/20] Engine Condition Assessment (11)...');
    fieldsFilled += fillInput('engine_oil_leaks', 'No Leaks') ? 1 : 0;
    fieldsFilled += fillInput('battery_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('hose_pipes_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('engine_oil_condition', 'Clean') ? 1 : 0;
    fieldsFilled += fillInput('wiring_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('engine_mounting', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('brake_oil_level', 'Full') ? 1 : 0;
    fieldsFilled += fillInput('coolant_level', 'Full') ? 1 : 0;
    fieldsFilled += fillInput('belts_condition', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('firewall_rust_free', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('engine_repair_cost', '0') ? 1 : 0;
    fieldsFilled += fillInput('engineNotes', 'Engine starts instantly, idles smoothly at 750 RPM. No unusual noises or vibrations. Engine oil clean (changed at 44K). Coolant optimal. No leaks. Battery 12.6V (1 year old). All belts good. Turbo functioning properly. Smooth transmission.') ? 1 : 0;
    
    // ==================== SECTION 17: TIRE PHOTOS (5 PHOTOS) ====================
    console.log('🛞 [17/20] Tire & Wheel Photos (5)...');
    photosUploaded += await setFileInput('photo_tireFrontLeft', 'Front Left Tire') ? 1 : 0;
    photosUploaded += await setFileInput('photo_tireFrontRight', 'Front Right Tire') ? 1 : 0;
    photosUploaded += await setFileInput('photo_tireRearLeft', 'Rear Left Tire') ? 1 : 0;
    photosUploaded += await setFileInput('photo_tireRearRight', 'Rear Right Tire') ? 1 : 0;
    photosUploaded += await setFileInput('photo_tireSpare', 'Spare Tire') ? 1 : 0;
    
    // ==================== SECTION 18: TIRE DETAILS (20 FIELDS) ====================
    console.log('⚙️ [18/20] Tire Details (20 - 5 tires × 4 fields)...');
    // Front RHS
    fieldsFilled += fillInput('tire_brand_front_rhs', 'Bridgestone Dueler') ? 1 : 0;
    fieldsFilled += fillInput('wheel_type_front_rhs', 'Alloy') ? 1 : 0;
    fieldsFilled += fillInput('tire_life_front_rhs', '60') ? 1 : 0;
    fieldsFilled += fillInput('tire_cost_front_rhs', '8500') ? 1 : 0;
    // Front LHS
    fieldsFilled += fillInput('tire_brand_front_lhs', 'Bridgestone Dueler') ? 1 : 0;
    fieldsFilled += fillInput('wheel_type_front_lhs', 'Alloy') ? 1 : 0;
    fieldsFilled += fillInput('tire_life_front_lhs', '60') ? 1 : 0;
    fieldsFilled += fillInput('tire_cost_front_lhs', '8500') ? 1 : 0;
    // Rear RHS
    fieldsFilled += fillInput('tire_brand_rear_rhs', 'Bridgestone Dueler') ? 1 : 0;
    fieldsFilled += fillInput('wheel_type_rear_rhs', 'Alloy') ? 1 : 0;
    fieldsFilled += fillInput('tire_life_rear_rhs', '65') ? 1 : 0;
    fieldsFilled += fillInput('tire_cost_rear_rhs', '8500') ? 1 : 0;
    // Rear LHS
    fieldsFilled += fillInput('tire_brand_rear_lhs', 'Bridgestone Dueler') ? 1 : 0;
    fieldsFilled += fillInput('wheel_type_rear_lhs', 'Alloy') ? 1 : 0;
    fieldsFilled += fillInput('tire_life_rear_lhs', '65') ? 1 : 0;
    fieldsFilled += fillInput('tire_cost_rear_lhs', '8500') ? 1 : 0;
    // Spare
    fieldsFilled += fillInput('tire_brand_spare', 'Bridgestone Dueler') ? 1 : 0;
    fieldsFilled += fillInput('wheel_type_spare', 'Alloy') ? 1 : 0;
    fieldsFilled += fillInput('tire_life_spare', '100') ? 1 : 0;
    fieldsFilled += fillInput('tire_cost_spare', '8500') ? 1 : 0;
    // Legacy fields
    fieldsFilled += fillInput('tireBrand', 'Bridgestone Dueler H/T 265/60 R18') ? 1 : 0;
    fieldsFilled += fillInput('treadDepth', '5-6mm (60-65%)') ? 1 : 0;
    fieldsFilled += fillInput('tiresNotes', 'All four tires Bridgestone Dueler H/T. Manufactured 2020. Tread: FL-5mm, FR-5mm, RL-6mm, RR-6mm. No cracks/bulges. Spare unused. Alloy wheels perfect. Alignment good.') ? 1 : 0;
    
    // ==================== SECTION 19: STRUCTURE PHOTOS (6 PHOTOS) ====================
    console.log('🏗️ [19/20] Structure & Undercarriage Photos (6)...');
    photosUploaded += await setFileInput('photo_undercarriageFront', 'Undercarriage Front') ? 1 : 0;
    photosUploaded += await setFileInput('photo_undercarriageRear', 'Undercarriage Rear') ? 1 : 0;
    photosUploaded += await setFileInput('photo_exhaust', 'Exhaust System') ? 1 : 0;
    photosUploaded += await setFileInput('photo_suspensionFront', 'Front Suspension') ? 1 : 0;
    photosUploaded += await setFileInput('photo_suspensionRear', 'Rear Suspension') ? 1 : 0;
    photosUploaded += await setFileInput('photo_chassis', 'Chassis Frame') ? 1 : 0;
    
    // ==================== SECTION 20: STRUCTURE COMMENTS (16 FIELDS) ====================
    console.log('📝 [20/20] Structure Comment Fields (16)...');
    fieldsFilled += fillInput('comment_fender_wall_rhs', 'Good condition, no damage') ? 1 : 0;
    fieldsFilled += fillInput('comment_fender_wall_lhs', 'Good condition, no damage') ? 1 : 0;
    fieldsFilled += fillInput('comment_upper_member_rhs', 'Straight, no bends') ? 1 : 0;
    fieldsFilled += fillInput('comment_upper_member_lhs', 'Straight, no bends') ? 1 : 0;
    fieldsFilled += fillInput('comment_lower_member_rhs', 'Rust-free, intact') ? 1 : 0;
    fieldsFilled += fillInput('comment_lower_member_lhs', 'Rust-free, intact') ? 1 : 0;
    fieldsFilled += fillInput('comment_apron_rhs', 'Original, no repair marks') ? 1 : 0;
    fieldsFilled += fillInput('comment_apron_lhs', 'Original, no repair marks') ? 1 : 0;
    fieldsFilled += fillInput('comment_a_pillar_rhs', 'Straight, paint intact') ? 1 : 0;
    fieldsFilled += fillInput('comment_a_pillar_lhs', 'Straight, paint intact') ? 1 : 0;
    fieldsFilled += fillInput('comment_b_pillar_rhs', 'No damage, original') ? 1 : 0;
    fieldsFilled += fillInput('comment_b_pillar_lhs', 'No damage, original') ? 1 : 0;
    fieldsFilled += fillInput('comment_c_pillar_rhs', 'Good condition') ? 1 : 0;
    fieldsFilled += fillInput('comment_c_pillar_lhs', 'Good condition') ? 1 : 0;
    fieldsFilled += fillInput('comment_tail_gate_frame', 'Straight, rust-free') ? 1 : 0;
    fieldsFilled += fillInput('comment_dicky_tub', 'Clean, no leaks') ? 1 : 0;
    fieldsFilled += fillInput('structureNotes', 'Chassis and frame excellent. No accident damage or structural repair. Undercoating intact. No rust. Suspension original, no wear. CV boots intact. No leaks. Exhaust solid. Body mounts secure.') ? 1 : 0;
    
    // ==================== SECTION 21: TEST DRIVE (12 ASSESSMENT FIELDS) ====================
    console.log('🚦 Test Drive Assessments (12)...');
    fieldsFilled += checkRadio('testDrive', 'Yes') ? 1 : 0;
    fieldsFilled += fillInput('test_steering', 'Perfect') ? 1 : 0;
    fieldsFilled += fillInput('test_brake', 'Perfect') ? 1 : 0;
    fieldsFilled += fillInput('test_clutch', 'N/A') ? 1 : 0;
    fieldsFilled += fillInput('test_gear', 'Perfect') ? 1 : 0;
    fieldsFilled += fillInput('test_suspension', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('test_shock_absorber', 'Good') ? 1 : 0;
    fieldsFilled += fillInput('test_noise', 'Normal') ? 1 : 0;
    fieldsFilled += fillInput('test_vibration', 'Minimal') ? 1 : 0;
    fieldsFilled += fillInput('test_pickup', 'Excellent') ? 1 : 0;
    fieldsFilled += fillInput('test_alignment', 'Perfect') ? 1 : 0;
    fieldsFilled += fillInput('test_ac', 'Excellent') ? 1 : 0;
    fieldsFilled += fillInput('test_repair_cost', '15000') ? 1 : 0;
    fieldsFilled += fillInput('testDriveNotes', 'Engine pulls strongly, turbo smooth. Transmission precise. Steering responsive. Brakes strong. Suspension absorbs well. No rattles. All features working: cruise, sensors, climate, audio. 4WD engages smoothly.') ? 1 : 0;
    
    // ==================== SECTION 22: SECTION COMMENTS (5 FIELDS) ====================
    console.log('💬 Section-Specific Comments (5)...');
    fieldsFilled += fillInput('engineComment', 'Engine in excellent mechanical condition. Regular maintenance evident. No issues detected.') ? 1 : 0;
    fieldsFilled += fillInput('structureComment', 'Body structure completely original. No accident history. All panels factory fitted.') ? 1 : 0;
    fieldsFilled += fillInput('testDriveComment', 'Drives like new. All systems performing optimally. Very smooth ride quality.') ? 1 : 0;
    fieldsFilled += fillInput('exteriorComment', 'Exterior maintained well. Minor cosmetic wear only. Paint in very good condition.') ? 1 : 0;
    fieldsFilled += fillInput('interiorComment', 'Interior clean and fresh. Electronics all functional. Comfortable and well-kept.') ? 1 : 0;
    
    // ==================== SECTION 23: FINAL ASSESSMENT ====================
    console.log('✅ Final Assessment...');
    fieldsFilled += checkRadio('overallRating', 'Excellent') ? 1 : 0;
    fieldsFilled += fillInput('issuesFound', 'Minor Issues:\n1. Small scratch on driver door handle\n2. Minor wear on driver seat\n3. Front brake pads 40% (replace in 10K km)\n4. Wiper blades slight wear') ? 1 : 0;
    fieldsFilled += fillInput('recommendations', 'Recommendations:\n1. Replace brake pads in 10K km\n2. Replace wipers before monsoon\n3. Touch-up door scratch\n4. Continue regular service\n5. HIGHLY RECOMMENDED for purchase\n6. Estimated value: ₹28-30 lakhs') ? 1 : 0;
    fieldsFilled += fillInput('marketValue', '₹29,00,000') ? 1 : 0;
    
    // ==================== SUMMARY & SUBMIT ====================
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✨ AUTO-FILL COMPLETE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`⏱️  Time Elapsed: ${elapsed} seconds`);
    console.log(`📝 Fields Filled: ${fieldsFilled}/178`);
    console.log(`📸 Photos Uploaded: ${photosUploaded}/46`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (fieldsFilled < 170) {
        console.warn(`⚠️ WARNING: Only ${fieldsFilled}/178 fields filled!`);
        console.warn('Some fields may be missing or have changed names.');
    }
    
    if (photosUploaded < 40) {
        console.warn(`⚠️ WARNING: Only ${photosUploaded}/46 photos uploaded!`);
        console.warn('Some photo inputs may be missing or have changed names.');
    }
    
    console.log('⏳ Waiting 3 seconds before submission...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📤 SUBMITTING FORM...');
    console.log('');
    console.log('👀 Watch for:');
    console.log('   1. Button: "Uploading Photos & Generating Report..."');
    console.log('   2. Spinner animation');
    console.log('   3. PDF auto-download (10-30 seconds)');
    console.log('   4. Success message');
    console.log('');
    console.log('📋 Open Network tab (F12) to monitor:');
    console.log('   - Photo uploads to S3');
    console.log('   - Lambda function invocation');
    console.log('   - PDF generation response');
    console.log('');
    
    const form = document.getElementById('inspectionForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if (form && submitBtn) {
        submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🚀 FORM SUBMITTED!');
        console.log('⏱️ PDF generation typically takes 10-30 seconds...');
        console.log('📥 PDF will download automatically when ready!');
        console.log('');
        console.log('Expected PDF:');
        console.log('  - 13 pages total');
        console.log('  - Hindi/English bilingual');
        console.log('  - All 175+ fields included');
        console.log('  - 46 embedded photos');
        console.log('');
        
        submitBtn.click();
    } else {
        console.error('❌ ERROR: Form or submit button not found!');
        console.error('Make sure you are on inspector-form.html');
    }
    
    console.log('✨ Script execution complete! Monitor console for results.');
    
})();
