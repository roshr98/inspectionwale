/**
 * InspectionWale - Auto-Fill Inspector Form Script
 * 
 * USAGE:
 * 1. Login as inspector1 at: http://localhost:5500/inspector-form.html (or your local server)
 * 2. Open browser console (F12)
 * 3. Copy-paste this entire script
 * 4. Press Enter
 * 5. Wait for form to auto-fill and submit
 * 6. PDF will auto-download
 * 
 * Last Updated: Dec 21, 2025
 */

(async function autoFillInspectorForm() {
    console.log('🚀 Starting InspectionWale Auto-Fill Script...');
    
    // Helper: Create a realistic test image blob
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
        
        // Text
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
    
    // Helper: Set file input
    async function setFileInput(inputName, label) {
        const input = document.querySelector(`input[name="${inputName}"]`);
        if (!input) {
            console.warn(`⚠️ Input not found: ${inputName}`);
            return;
        }
        
        const file = await createTestImage(label);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        
        // Trigger preview if function exists
        if (typeof previewImage === 'function') {
            const previewId = input.getAttribute('onchange')?.match(/preview_(\w+)/)?.[1];
            if (previewId) {
                previewImage(input, `preview_${previewId}`);
            }
        }
        
        console.log(`✅ Uploaded: ${label}`);
    }
    
    // Helper: Fill text input
    function fillInput(name, value) {
        const input = document.querySelector(`input[name="${name}"], select[name="${name}"], textarea[name="${name}"]`);
        if (input) {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    
    // Helper: Check radio button
    function checkRadio(name, value) {
        const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    
    console.log('📝 Step 1: Filling Vehicle Registration Details...');
    fillInput('registrationNumber', 'MH04KD2255');
    fillInput('make', 'Toyota');
    fillInput('model', 'Fortuner');
    fillInput('variant', 'VX 4x4 AT Diesel');
    fillInput('vinNumber', 'MALPG232CS301234');
    fillInput('engineNumber', '2GD1234567');
    fillInput('manufactureYear', '2020');
    fillInput('registrationDate', '2020-03-15');
    fillInput('color', 'Pearl White');
    fillInput('fuelType', 'Diesel');
    fillInput('odometerReading', '45000');
    fillInput('ownersCount', '1');
    
    console.log('👤 Step 2: Filling Owner Details...');
    fillInput('ownerName', 'Rajesh Kumar Sharma');
    fillInput('ownerContact', '9876543210');
    fillInput('ownerEmail', 'rajesh.sharma@gmail.com');
    fillInput('location', 'Navi Mumbai, Maharashtra');
    
    console.log('⭐ Step 3: Setting Key Highlights...');
    checkRadio('accidental', 'No');
    checkRadio('floodDamage', 'No');
    checkRadio('fireDamage', 'No');
    fillInput('highlights', 'Single owner vehicle, well maintained with full service history. No major scratches or dents. Engine and transmission in excellent condition. All electronics working perfectly. Minor wear on driver seat. Tires have 60% tread remaining. Recent service completed at 44,000 km.');
    
    console.log('📸 Step 4: Uploading Document Photos (3 photos)...');
    await setFileInput('photo_rcBook', 'RC Book');
    await setFileInput('photo_chassisPlate', 'Chassis Plate');
    await setFileInput('photo_odometer', 'Odometer');
    
    console.log('🚗 Step 5: Uploading Front Exterior Photos (6 photos)...');
    await setFileInput('photo_frontBumper', 'Front Bumper');
    await setFileInput('photo_bonnet', 'Bonnet');
    await setFileInput('photo_frontGrille', 'Front Grille');
    await setFileInput('photo_headlights', 'Headlights');
    await setFileInput('photo_windshield', 'Windshield');
    await setFileInput('photo_wipers', 'Wipers');
    
    console.log('🚪 Step 6: Uploading Side Exterior Photos (6 photos)...');
    await setFileInput('photo_doorDriverFront', 'Driver Front Door');
    await setFileInput('photo_doorDriverRear', 'Driver Rear Door');
    await setFileInput('photo_doorPassengerFront', 'Passenger Front Door');
    await setFileInput('photo_doorPassengerRear', 'Passenger Rear Door');
    await setFileInput('photo_mirrorLeft', 'Left Mirror');
    await setFileInput('photo_mirrorRight', 'Right Mirror');
    
    console.log('🔙 Step 7: Uploading Rear Exterior Photos (6 photos)...');
    await setFileInput('photo_rearBumper', 'Rear Bumper');
    await setFileInput('photo_bootClosed', 'Boot Closed');
    await setFileInput('photo_bootOpen', 'Boot Open');
    await setFileInput('photo_taillights', 'Tail Lights');
    await setFileInput('photo_rearWindshield', 'Rear Windshield');
    await setFileInput('photo_roof', 'Roof');
    
    console.log('📝 Step 8: Adding Exterior Notes...');
    fillInput('paintNotes', 'Exterior: Overall excellent condition. Paint depth measurements consistent across all panels (100-120 microns). No evidence of repainting. Minor stone chips on bonnet front. Small scratches on driver door handle. All panel gaps uniform. No rust detected. Chrome trim in good condition.');
    
    console.log('🪑 Step 9: Uploading Interior Photos (9 photos)...');
    await setFileInput('photo_dashboard', 'Dashboard');
    await setFileInput('photo_instrumentCluster', 'Instrument Cluster');
    await setFileInput('photo_steeringWheel', 'Steering Wheel');
    await setFileInput('photo_frontSeats', 'Front Seats');
    await setFileInput('photo_rearSeats', 'Rear Seats');
    await setFileInput('photo_acPanel', 'AC Control Panel');
    await setFileInput('photo_musicSystem', 'Music System');
    await setFileInput('photo_gearLever', 'Gear Lever');
    await setFileInput('photo_interiorRoof', 'Interior Roof');
    
    console.log('📝 Step 10: Adding Interior Notes...');
    fillInput('interiorNotes', 'Interior: Very clean and well-maintained. Leather seats show minor wear on driver side. Dashboard crack-free. All buttons and switches functional. AC cooling excellent (measured 8°C at vents). Infotainment system working, touchscreen responsive. No odors or stains. Floor mats original. Headliner intact. Power windows smooth.');
    
    console.log('⚙️ Step 11: Uploading Engine Photos (6 photos)...');
    await setFileInput('photo_engineBay', 'Engine Bay Overview');
    await setFileInput('photo_battery', 'Battery');
    await setFileInput('photo_oilCap', 'Oil Cap');
    await setFileInput('photo_coolant', 'Coolant Reservoir');
    await setFileInput('photo_brakeFluid', 'Brake Fluid');
    await setFileInput('photo_airFilter', 'Air Filter');
    
    console.log('📝 Step 12: Adding Engine Notes...');
    fillInput('engineNotes', 'Engine: Starts instantly, idles smoothly at 750 RPM. No unusual noises, vibrations, or smoke. Engine oil clean (changed at 44K km). Coolant level optimal, color good. No oil leaks detected. Battery 12.6V (good condition, 1 year old). Belts in good condition. Air filter clean. Turbo functioning properly. Transmission shifts smoothly.');
    
    console.log('🛞 Step 13: Uploading Tire Photos (5 photos)...');
    await setFileInput('photo_tireFrontLeft', 'Front Left Tire');
    await setFileInput('photo_tireFrontRight', 'Front Right Tire');
    await setFileInput('photo_tireRearLeft', 'Rear Left Tire');
    await setFileInput('photo_tireRearRight', 'Rear Right Tire');
    await setFileInput('photo_tireSpare', 'Spare Tire');
    
    console.log('📝 Step 14: Adding Tire Notes...');
    fillInput('tiresNotes', 'Tires: All four tires Bridgestone Dueler H/T 265/60 R18. Tread depth: FL-5mm, FR-5mm, RL-6mm, RR-6mm (60% remaining). Manufactured in 2020. No cracks or bulges. Proper inflation. Spare tire unused, full tread. Alloy wheels no damage. Wheel alignment good. No uneven wear patterns.');
    
    console.log('🔧 Step 15: Uploading Structure Photos (3 photos)...');
    await setFileInput('photo_underbodyFront', 'Underbody Front');
    await setFileInput('photo_underbodyRear', 'Underbody Rear');
    await setFileInput('photo_suspension', 'Suspension Components');
    
    console.log('📝 Step 16: Adding Structure Notes...');
    fillInput('structureNotes', 'Structure: Chassis and frame in excellent condition. No signs of accident damage or structural repair. Undercoating intact. No rust on underbody. Suspension components original, no wear. Shock absorbers functioning well. CV boots intact. No fluid leaks. Exhaust system solid, no holes. Body mounts secure.');
    
    console.log('🚦 Step 17: Adding Test Drive Notes...');
    fillInput('testDriveNotes', 'Test Drive: Engine pulls strongly with no hesitation. Turbo spools smoothly. Transmission shifts precisely in all gears. Steering responsive, no play. Brakes strong and progressive, no noise. Suspension absorbs bumps well. No rattles or squeaks. All features tested: cruise control, parking sensors, climate control, audio system - all working perfectly. 4WD engages smoothly.');
    
    console.log('⚠️ Step 18: Adding Issues & Recommendations...');
    fillInput('issuesFound', 'Minor Issues Found:\n1. Small scratch on driver door handle (cosmetic)\n2. Minor wear on driver seat bolster\n3. Front brake pads at 40% (will need replacement in 10,000 km)\n4. Windshield wiper blades showing slight wear');
    fillInput('recommendations', 'Recommendations:\n1. Replace front brake pads within next 10,000 km\n2. Replace wiper blades before monsoon\n3. Consider paint touch-up on door handle scratch\n4. Continue regular service intervals (every 10,000 km)\n5. Vehicle is in excellent condition, highly recommended for purchase\n6. Estimated current market value: ₹28-30 lakhs');
    
    console.log('✅ All fields filled and photos uploaded!');
    console.log('📊 Summary:');
    console.log('   - Text fields: 25+ filled');
    console.log('   - Photos uploaded: 46');
    console.log('   - Total data captured: Complete');
    
    console.log('\n⏳ Step 19: Waiting 2 seconds before submission...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📤 Step 20: Submitting form...');
    const form = document.getElementById('inspectionForm');
    if (form) {
        // Scroll to submit button
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('🚀 SUBMITTING FORM NOW...');
        console.log('⏱️ PDF generation will take 10-30 seconds...');
        console.log('📥 PDF will auto-download when ready!');
        console.log('');
        console.log('👀 Watch for:');
        console.log('   1. Submit button changes to "Uploading Photos & Generating Report..."');
        console.log('   2. Spinner appears');
        console.log('   3. PDF downloads automatically');
        console.log('   4. Success message appears');
        
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        
        // Alternative: Trigger submit button click
        if (submitBtn) {
            submitBtn.click();
        }
    } else {
        console.error('❌ Form not found! Make sure you are on inspector-form.html');
    }
    
    console.log('\n✨ Script execution complete!');
    console.log('📋 Open Network tab (F12) to see Lambda request/response');
    console.log('🔍 Check Console for any errors');
    
})();
