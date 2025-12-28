import React, { useState, useEffect } from 'react';
import { Save, FileText, Trash2, Database } from 'lucide-react';
import { getInspectionData, saveInspectionData, clearInspectionData } from '../../utils/dataLoader';
import { prefillInspectionForm, clearInspectionForm } from '../../utils/testDataHelper';
import { ImageUploadField } from './ImageUploadField';

interface SinglePageFormProps {
  onSave: (formData: any) => void;
  onViewReport: () => void;
}

export function SinglePageForm({ onSave, onViewReport }: SinglePageFormProps) {
  const [formData, setFormData] = useState(getInspectionData());
  const [errors, setErrors] = useState<any>({});

  // Auto-save form data to cache whenever it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveInspectionData(formData);
      console.log('✅ Form data auto-saved to cache');
    }, 500); // Debounce for 500ms to avoid excessive saves

    return () => clearTimeout(timer);
  }, [formData]);

  const handleInputChange = (section: string, field: string, value: any, subField?: string) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      if (subField) {
        newData[section] = {
          ...newData[section],
          [field]: {
            ...newData[section][field],
            [subField]: value
          }
        };
      } else {
        newData[section] = {
          ...newData[section],
          [field]: value
        };
      }
      return newData;
    });
  };

  const handleSaveData = () => {
    saveInspectionData(formData);
    onSave(formData);
    alert('✅ Data saved successfully!');
  };

  const handleLoadTestData = () => {
    if (confirm('Load test data? This will replace all current form values.')) {
      prefillInspectionForm();
      setFormData(getInspectionData());
      alert('✅ Test data loaded successfully!');
    }
  };

  const handleClearAll = () => {
    if (confirm('⚠️ Clear all data? This action cannot be undone.')) {
      clearInspectionForm();
      setFormData(getInspectionData());
      alert('🗑️ All data cleared!');
    }
  };

  return (
    <div className="single-page-form">
      {/* Sticky Header */}
      <div className="form-sticky-header">
        <h1 className="form-main-title">Vehicle Inspection Form</h1>
        <div className="form-header-actions">
          <button onClick={handleLoadTestData} className="btn-load-test">
            <Database size={18} />
            Load Test Data
          </button>
          <button onClick={handleClearAll} className="btn-clear-all">
            <Trash2 size={18} />
            Clear All
          </button>
          <button onClick={handleSaveData} className="btn-save">
            <Save size={18} />
            Save Data
          </button>
          <button onClick={onViewReport} className="btn-view-report">
            <FileText size={18} />
            View Report
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="form-content-wrapper">
        
        {/* SECTION 1: Inspection Information */}
        <div className="form-section">
          <h2 className="section-title">Inspection Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Inspection ID *</label>
              <input
                type="text"
                placeholder="e.g., IW-2025-001234"
                value={formData.inspection.id}
                onChange={(e) => handleInputChange('inspection', 'id', e.target.value)}
                className={errors.inspection_id ? 'error' : ''}
              />
              {errors.inspection_id && <span className="error-text">{errors.inspection_id}</span>}
            </div>
            <div className="form-group">
              <label>Inspection Date *</label>
              <input
                type="date"
                value={formData.inspection.date}
                onChange={(e) => handleInputChange('inspection', 'date', e.target.value)}
                className={errors.inspection_date ? 'error' : ''}
              />
              {errors.inspection_date && <span className="error-text">{errors.inspection_date}</span>}
            </div>
            <div className="form-group">
              <label>Inspection Location</label>
              <input
                type="text"
                placeholder="e.g., Mumbai, Maharashtra"
                value={formData.inspection.location}
                onChange={(e) => handleInputChange('inspection', 'location', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Inspector Name</label>
              <input
                type="text"
                placeholder="Enter inspector name"
                value={formData.inspection.inspector_name}
                onChange={(e) => handleInputChange('inspection', 'inspector_name', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Vehicle Details */}
        <div className="form-section">
          <h2 className="section-title">Vehicle Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Registration Number *</label>
              <input
                type="text"
                placeholder="e.g., MH 02 AB 1234"
                value={formData.vehicle.registration_number}
                onChange={(e) => handleInputChange('vehicle', 'registration_number', e.target.value)}
                className={errors.vehicle_registration ? 'error' : ''}
              />
            </div>
            <div className="form-group">
              <label>Manufacturing Date</label>
              <input
                type="text"
                placeholder="e.g., March 2019"
                value={formData.vehicle.manufacturing_date}
                onChange={(e) => handleInputChange('vehicle', 'manufacturing_date', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Chassis Number</label>
              <input
                type="text"
                placeholder="e.g., MA3EWD81S00123456"
                value={formData.vehicle.chassis_number}
                onChange={(e) => handleInputChange('vehicle', 'chassis_number', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Engine Number</label>
              <input
                type="text"
                placeholder="e.g., K12M1234567"
                value={formData.vehicle.engine_number}
                onChange={(e) => handleInputChange('vehicle', 'engine_number', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Registration Date</label>
              <input
                type="date"
                value={formData.vehicle.registration_date}
                onChange={(e) => handleInputChange('vehicle', 'registration_date', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Insurance Validity</label>
              <input
                type="date"
                value={formData.vehicle.insurance_validity}
                onChange={(e) => handleInputChange('vehicle', 'insurance_validity', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Owner Name</label>
              <input
                type="text"
                placeholder="Enter owner name"
                value={formData.vehicle.owner_name}
                onChange={(e) => handleInputChange('vehicle', 'owner_name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Make & Model</label>
              <input
                type="text"
                placeholder="e.g., Maruti Suzuki Swift"
                value={formData.vehicle.make_model}
                onChange={(e) => handleInputChange('vehicle', 'make_model', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Variant</label>
              <input
                type="text"
                placeholder="e.g., VXI (O) AT"
                value={formData.vehicle.variant}
                onChange={(e) => handleInputChange('vehicle', 'variant', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Fuel Type</label>
              <select
                value={formData.vehicle.fuel_type}
                onChange={(e) => handleInputChange('vehicle', 'fuel_type', e.target.value)}
              >
                <option value="">Select fuel type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
            <div className="form-group">
              <label>Owner Count</label>
              <select
                value={formData.vehicle.owner_count}
                onChange={(e) => handleInputChange('vehicle', 'owner_count', e.target.value)}
              >
                <option value="">Select owner count</option>
                <option value="1st Owner">1st Owner</option>
                <option value="2nd Owner">2nd Owner</option>
                <option value="3rd Owner">3rd Owner</option>
                <option value="4th Owner+">4th Owner+</option>
              </select>
            </div>
            <div className="form-group">
              <label>RC Type</label>
              <select
                value={formData.vehicle.rc_type}
                onChange={(e) => handleInputChange('vehicle', 'rc_type', e.target.value)}
              >
                <option value="">Select RC type</option>
                <option value="Private">Private</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div className="form-group">
              <label>Hypothecation</label>
              <select
                value={formData.vehicle.hypothecation}
                onChange={(e) => handleInputChange('vehicle', 'hypothecation', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* CNG Details Sub-section */}
          <h3 className="subsection-title">CNG Details (if applicable)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>CNG Present</label>
              <select
                value={formData.vehicle.cng.present}
                onChange={(e) => handleInputChange('vehicle', 'cng', e.target.value, 'present')}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>CNG Type</label>
              <select
                value={formData.vehicle.cng.type}
                onChange={(e) => handleInputChange('vehicle', 'cng', e.target.value, 'type')}
              >
                <option value="">Select type</option>
                <option value="Company Fitted">Company Fitted</option>
                <option value="Aftermarket">Aftermarket</option>
              </select>
            </div>
            <div className="form-group">
              <label>CNG Validity</label>
              <input
                type="date"
                value={formData.vehicle.cng.validity}
                onChange={(e) => handleInputChange('vehicle', 'cng', e.target.value, 'validity')}
              />
            </div>
            <div className="form-group">
              <label>CNG Endorsed in RC</label>
              <select
                value={formData.vehicle.cng.endorsed}
                onChange={(e) => handleInputChange('vehicle', 'cng', e.target.value, 'endorsed')}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: Ratings */}
        <div className="form-section">
          <h2 className="section-title">Overall Ratings (1-5 Stars)</h2>
          <div className="form-grid">
            {['interior', 'exterior', 'engine', 'test_drive', 'structure', 'electrical'].map((rating) => (
              <div className="form-group" key={rating}>
                <label>{rating.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                <select
                  value={formData.ratings[rating]}
                  onChange={(e) => handleInputChange('ratings', rating, e.target.value)}
                >
                  <option value="">Select rating</option>
                  <option value="1">⭐ 1 Star - Poor</option>
                  <option value="2">⭐⭐ 2 Stars - Fair</option>
                  <option value="3">⭐⭐⭐ 3 Stars - Good</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars - Very Good</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Excellent</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: Flags & Comments */}
        <div className="form-section">
          <h2 className="section-title">Key Inspection Flags</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Accidental Vehicle?</label>
              <select
                value={formData.flags.accidental}
                onChange={(e) => handleInputChange('flags', 'accidental', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Flood Damage?</label>
              <select
                value={formData.flags.flood_damage}
                onChange={(e) => handleInputChange('flags', 'flood_damage', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fire Damage?</label>
              <select
                value={formData.flags.fire_damage}
                onChange={(e) => handleInputChange('flags', 'fire_damage', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>RC & Chassis Match?</label>
              <select
                value={formData.flags.rc_chassis_match}
                onChange={(e) => handleInputChange('flags', 'rc_chassis_match', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Service Logs Available?</label>
              <select
                value={formData.flags.service_logs_available}
                onChange={(e) => handleInputChange('flags', 'service_logs_available', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Has CNG?</label>
              <select
                value={formData.flags.has_cng}
                onChange={(e) => handleInputChange('flags', 'has_cng', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Has Hypothecation?</label>
              <select
                value={formData.flags.has_hypothecation}
                onChange={(e) => handleInputChange('flags', 'has_hypothecation', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 5: Front View Inspection */}
        <div className="form-section">
          <h2 className="section-title">🚗 Vehicle Front View</h2>
          
          {/* Front Image */}
          <div className="image-upload-grid">
            <ImageUploadField
              label="Vehicle Front Image"
              value={formData.images.vehicle_front}
              onChange={(value) => handleInputChange('images', 'vehicle_front', value)}
              fieldName="vehicle_front"
              imageType="large"
            />
          </div>

          <h3 className="subsection-title">Front Inspection Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Bumper Condition</label>
              <input
                type="text"
                placeholder="e.g., Minor Scratches"
                value={formData.front.bumper_condition}
                onChange={(e) => handleInputChange('front', 'bumper_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Bumper Repainted?</label>
              <select
                value={formData.front.bumper_repainted}
                onChange={(e) => handleInputChange('front', 'bumper_repainted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bumper Paint Depth</label>
              <input
                type="text"
                placeholder="e.g., 120 µm"
                value={formData.front.bumper_paint_depth}
                onChange={(e) => handleInputChange('front', 'bumper_paint_depth', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Bonnet Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent"
                value={formData.front.bonnet_condition}
                onChange={(e) => handleInputChange('front', 'bonnet_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Bonnet Repainted?</label>
              <select
                value={formData.front.bonnet_repainted}
                onChange={(e) => handleInputChange('front', 'bonnet_repainted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bonnet Paint Depth</label>
              <input
                type="text"
                placeholder="e.g., 115 µm"
                value={formData.front.bonnet_paint_depth}
                onChange={(e) => handleInputChange('front', 'bonnet_paint_depth', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Bonnet Company Fitted?</label>
              <select
                value={formData.front.bonnet_company_fitted}
                onChange={(e) => handleInputChange('front', 'bonnet_company_fitted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Grill Condition</label>
              <input
                type="text"
                placeholder="e.g., Good - Minor chips on edges"
                value={formData.front.grill_condition}
                onChange={(e) => handleInputChange('front', 'grill_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Windshield Original?</label>
              <select
                value={formData.front.windshield_original}
                onChange={(e) => handleInputChange('front', 'windshield_original', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Windshield Condition</label>
              <input
                type="text"
                placeholder="e.g., No cracks or chips"
                value={formData.front.windshield_condition}
                onChange={(e) => handleInputChange('front', 'windshield_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Headlight Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent - No fogging"
                value={formData.front.headlight_condition}
                onChange={(e) => handleInputChange('front', 'headlight_condition', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 6: RHS View Inspection */}
        <div className="form-section">
          <h2 className="section-title">🚗 Vehicle RHS (Right Side) View</h2>
          
          {/* RHS Image */}
          <div className="image-upload-grid">
            <ImageUploadField
              label="Vehicle RHS Image"
              value={formData.images.vehicle_rhs}
              onChange={(value) => handleInputChange('images', 'vehicle_rhs', value)}
              fieldName="vehicle_rhs"
              imageType="large"
            />
          </div>

          <h3 className="subsection-title">RHS Inspection Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>RHS Fender Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent"
                value={formData.rhs.fender_condition}
                onChange={(e) => handleInputChange('rhs', 'fender_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>RHS Fender Repainted?</label>
              <select
                value={formData.rhs.fender_repainted}
                onChange={(e) => handleInputChange('rhs', 'fender_repainted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>RHS Fender Paint Depth</label>
              <input
                type="text"
                placeholder="e.g., 118 µm"
                value={formData.rhs.fender_paint_depth}
                onChange={(e) => handleInputChange('rhs', 'fender_paint_depth', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>RHS Front Door Condition</label>
              <input
                type="text"
                placeholder="e.g., Good"
                value={formData.rhs.front_door_condition}
                onChange={(e) => handleInputChange('rhs', 'front_door_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>RHS Front Door Repainted?</label>
              <select
                value={formData.rhs.front_door_repainted}
                onChange={(e) => handleInputChange('rhs', 'front_door_repainted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>RHS Front Door Paint Depth</label>
              <input
                type="text"
                placeholder="e.g., 122 µm"
                value={formData.rhs.front_door_paint_depth}
                onChange={(e) => handleInputChange('rhs', 'front_door_paint_depth', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>RHS Front Door Company Fitted?</label>
              <select
                value={formData.rhs.front_door_company_fitted}
                onChange={(e) => handleInputChange('rhs', 'front_door_company_fitted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>RHS Rear Door Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent"
                value={formData.rhs.rear_door_condition}
                onChange={(e) => handleInputChange('rhs', 'rear_door_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>RHS Rear Door Repainted?</label>
              <select
                value={formData.rhs.rear_door_repainted}
                onChange={(e) => handleInputChange('rhs', 'rear_door_repainted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>RHS Rear Door Paint Depth</label>
              <input
                type="text"
                placeholder="e.g., 117 µm"
                value={formData.rhs.rear_door_paint_depth}
                onChange={(e) => handleInputChange('rhs', 'rear_door_paint_depth', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>RHS Rear Door Company Fitted?</label>
              <select
                value={formData.rhs.rear_door_company_fitted}
                onChange={(e) => handleInputChange('rhs', 'rear_door_company_fitted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>RHS Quarter Panel Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent"
                value={formData.rhs.quarter_panel_condition}
                onChange={(e) => handleInputChange('rhs', 'quarter_panel_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>RHS Quarter Panel Repainted?</label>
              <select
                value={formData.rhs.quarter_panel_repainted}
                onChange={(e) => handleInputChange('rhs', 'quarter_panel_repainted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>RHS Quarter Panel Paint Depth</label>
              <input
                type="text"
                placeholder="e.g., 119 µm"
                value={formData.rhs.quarter_panel_paint_depth}
                onChange={(e) => handleInputChange('rhs', 'quarter_panel_paint_depth', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>RHS Door Glass Original?</label>
              <select
                value={formData.rhs.window_glass_original}
                onChange={(e) => handleInputChange('rhs', 'window_glass_original', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>RHS Side Mirror Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent"
                value={formData.rhs.side_mirror_condition}
                onChange={(e) => handleInputChange('rhs', 'side_mirror_condition', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 7: LHS View Inspection */}
        <div className="form-section">
          <h2 className="section-title">🚗 Vehicle LHS (Left Side) View</h2>
          
          {/* LHS Image */}
          <div className="image-upload-grid">
            <ImageUploadField
              label="Vehicle LHS Image"
              value={formData.images.vehicle_lhs}
              onChange={(value) => handleInputChange('images', 'vehicle_lhs', value)}
              fieldName="vehicle_lhs"
              imageType="large"
            />
          </div>

          <h3 className="subsection-title">LHS Inspection Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>LHS Fender Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent"
                value={formData.lhs.fender_condition}
                onChange={(e) => handleInputChange('lhs', 'fender_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>LHS Fender Repainted?</label>
              <select
                value={formData.lhs.fender_repainted}
                onChange={(e) => handleInputChange('lhs', 'fender_repainted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>LHS Fender Paint Depth</label>
              <input
                type="text"
                placeholder="e.g., 118 µm"
                value={formData.lhs.fender_paint_depth}
                onChange={(e) => handleInputChange('lhs', 'fender_paint_depth', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>LHS Front Door Condition</label>
              <input
                type="text"
                placeholder="e.g., Good"
                value={formData.lhs.front_door_condition}
                onChange={(e) => handleInputChange('lhs', 'front_door_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>LHS Front Door Repainted?</label>
              <select
                value={formData.lhs.front_door_repainted}
                onChange={(e) => handleInputChange('lhs', 'front_door_repainted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>LHS Front Door Paint Depth</label>
              <input
                type="text"
                placeholder="e.g., 122 µm"
                value={formData.lhs.front_door_paint_depth}
                onChange={(e) => handleInputChange('lhs', 'front_door_paint_depth', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>LHS Front Door Company Fitted?</label>
              <select
                value={formData.lhs.front_door_company_fitted}
                onChange={(e) => handleInputChange('lhs', 'front_door_company_fitted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>LHS Rear Door Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent"
                value={formData.lhs.rear_door_condition}
                onChange={(e) => handleInputChange('lhs', 'rear_door_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>LHS Rear Door Repainted?</label>
              <select
                value={formData.lhs.rear_door_repainted}
                onChange={(e) => handleInputChange('lhs', 'rear_door_repainted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>LHS Rear Door Paint Depth</label>
              <input
                type="text"
                placeholder="e.g., 117 µm"
                value={formData.lhs.rear_door_paint_depth}
                onChange={(e) => handleInputChange('lhs', 'rear_door_paint_depth', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>LHS Rear Door Company Fitted?</label>
              <select
                value={formData.lhs.rear_door_company_fitted}
                onChange={(e) => handleInputChange('lhs', 'rear_door_company_fitted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>LHS Quarter Panel Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent"
                value={formData.lhs.quarter_panel_condition}
                onChange={(e) => handleInputChange('lhs', 'quarter_panel_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>LHS Quarter Panel Repainted?</label>
              <select
                value={formData.lhs.quarter_panel_repainted}
                onChange={(e) => handleInputChange('lhs', 'quarter_panel_repainted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>LHS Quarter Panel Paint Depth</label>
              <input
                type="text"
                placeholder="e.g., 119 µm"
                value={formData.lhs.quarter_panel_paint_depth}
                onChange={(e) => handleInputChange('lhs', 'quarter_panel_paint_depth', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>LHS Door Glass Original?</label>
              <select
                value={formData.lhs.window_glass_original}
                onChange={(e) => handleInputChange('lhs', 'window_glass_original', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>LHS Side Mirror Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent"
                value={formData.lhs.side_mirror_condition}
                onChange={(e) => handleInputChange('lhs', 'side_mirror_condition', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 8: Rear & Roof Inspection */}
        <div className="form-section">
          <h2 className="section-title">🚗 Vehicle Rear & Roof View</h2>
          
          {/* Rear Image */}
          <div className="image-upload-grid">
            <ImageUploadField
              label="Vehicle Rear Image"
              value={formData.images.vehicle_rear}
              onChange={(value) => handleInputChange('images', 'vehicle_rear', value)}
              fieldName="vehicle_rear"
              imageType="large"
            />
          </div>

          <h3 className="subsection-title">Rear Inspection Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Rear Bumper Condition</label>
              <input
                type="text"
                placeholder="e.g., Minor Scratches"
                value={formData.rear.bumper_condition}
                onChange={(e) => handleInputChange('rear', 'bumper_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Rear Bumper Repainted?</label>
              <select
                value={formData.rear.bumper_repainted}
                onChange={(e) => handleInputChange('rear', 'bumper_repainted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Rear Bumper Paint Depth</label>
              <input
                type="text"
                placeholder="e.g., 119 µm"
                value={formData.rear.bumper_paint_depth}
                onChange={(e) => handleInputChange('rear', 'bumper_paint_depth', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Rear Windshield Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent"
                value={formData.rear.windshield_condition}
                onChange={(e) => handleInputChange('rear', 'windshield_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Rear Windshield Original?</label>
              <select
                value={formData.rear.windshield_original}
                onChange={(e) => handleInputChange('rear', 'windshield_original', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tailgate Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent"
                value={formData.rear.tailgate_condition}
                onChange={(e) => handleInputChange('rear', 'tailgate_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Tailgate Repainted?</label>
              <select
                value={formData.rear.tailgate_repainted}
                onChange={(e) => handleInputChange('rear', 'tailgate_repainted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tailgate Paint Depth</label>
              <input
                type="text"
                placeholder="e.g., 117 µm"
                value={formData.rear.tailgate_paint_depth}
                onChange={(e) => handleInputChange('rear', 'tailgate_paint_depth', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Tailgate Original?</label>
              <select
                value={formData.rear.tailgate_original}
                onChange={(e) => handleInputChange('rear', 'tailgate_original', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tail Lights Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent - No cracks"
                value={formData.rear.tail_lights_condition}
                onChange={(e) => handleInputChange('rear', 'tail_lights_condition', e.target.value)}
              />
            </div>
          </div>

          <h3 className="subsection-title">Roof Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Roof Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent"
                value={formData.roof.condition}
                onChange={(e) => handleInputChange('roof', 'condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Roof Type</label>
              <input
                type="text"
                placeholder="e.g., Standard Metal Roof"
                value={formData.roof.type}
                onChange={(e) => handleInputChange('roof', 'type', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Roof Paint Depth</label>
              <input
                type="text"
                placeholder="e.g., 115 µm"
                value={formData.roof.paint_depth}
                onChange={(e) => handleInputChange('roof', 'paint_depth', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Roof Repainted?</label>
              <select
                value={formData.roof.repainted}
                onChange={(e) => handleInputChange('roof', 'repainted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Exterior Comment */}
          <h3 className="subsection-title">Exterior Inspection Comments</h3>
          <div className="form-group full-width">
            <label>Exterior Comment</label>
            <textarea
              placeholder="Enter exterior inspection comments..."
              value={formData.comments.exterior}
              onChange={(e) => handleInputChange('comments', 'exterior', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* SECTION 9: Interior Inspection */}
        <div className="form-section">
          <h2 className="section-title">🏠 Interior Inspection</h2>
          
          {/* Dashboard and Cluster Meter Images */}
          <div className="image-upload-grid">
            <ImageUploadField
              label="Dashboard Image"
              value={formData.images.dashboard}
              onChange={(value) => handleInputChange('images', 'dashboard', value)}
              fieldName="dashboard"
              imageType="half"
            />
            <ImageUploadField
              label="Cluster Meter Image"
              value={formData.images.cluster_meter}
              onChange={(value) => handleInputChange('images', 'cluster_meter', value)}
              fieldName="cluster_meter"
              imageType="half"
            />
          </div>

          <h3 className="subsection-title">Dashboard Controls</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>MIL Light</label>
              <select
                value={formData.interior.mil_light}
                onChange={(e) => handleInputChange('interior', 'mil_light', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Dashboard Condition</label>
              <select
                value={formData.interior.dashboard_condition}
                onChange={(e) => handleInputChange('interior', 'dashboard_condition', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Music System</label>
              <select
                value={formData.interior.music_system}
                onChange={(e) => handleInputChange('interior', 'music_system', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Steering Controls</label>
              <select
                value={formData.interior.steering_controls}
                onChange={(e) => handleInputChange('interior', 'steering_controls', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Paddle Shifters</label>
              <select
                value={formData.interior.paddle_shifters}
                onChange={(e) => handleInputChange('interior', 'paddle_shifters', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
            <div className="form-group">
              <label>Hand Brake</label>
              <select
                value={formData.interior.hand_brake}
                onChange={(e) => handleInputChange('interior', 'hand_brake', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Speakers</label>
              <select
                value={formData.interior.speakers}
                onChange={(e) => handleInputChange('interior', 'speakers', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>AC Vents</label>
              <select
                value={formData.interior.ac_vents}
                onChange={(e) => handleInputChange('interior', 'ac_vents', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>AC Performance</label>
              <select
                value={formData.interior.ac_working}
                onChange={(e) => handleInputChange('interior', 'ac_working', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
          </div>

          <h3 className="subsection-title">Cluster Controls</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Steering Type</label>
              <input
                type="text"
                placeholder="e.g., Power Steering"
                value={formData.interior.steering_type}
                onChange={(e) => handleInputChange('interior', 'steering_type', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Cruise Control</label>
              <select
                value={formData.interior.cruise_control}
                onChange={(e) => handleInputChange('interior', 'cruise_control', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
            <div className="form-group">
              <label>Navigation</label>
              <select
                value={formData.interior.navigation}
                onChange={(e) => handleInputChange('interior', 'navigation', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
            <div className="form-group">
              <label>Glove Box</label>
              <select
                value={formData.interior.glove_box}
                onChange={(e) => handleInputChange('interior', 'glove_box', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cabin Lights</label>
              <select
                value={formData.interior.cabin_lights}
                onChange={(e) => handleInputChange('interior', 'cabin_lights', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Headlights</label>
              <select
                value={formData.interior.headlights}
                onChange={(e) => handleInputChange('interior', 'headlights', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Wipers</label>
              <select
                value={formData.interior.wipers}
                onChange={(e) => handleInputChange('interior', 'wipers', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Trip Switch</label>
              <select
                value={formData.interior.trip_switch}
                onChange={(e) => handleInputChange('interior', 'trip_switch', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Boot Lever</label>
              <select
                value={formData.interior.boot_lever}
                onChange={(e) => handleInputChange('interior', 'boot_lever', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
          </div>

          <h3 className="subsection-title">Additional Controls & Features</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Central Lock</label>
              <select
                value={formData.interior.central_lock}
                onChange={(e) => handleInputChange('interior', 'central_lock', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Rear Wiper</label>
              <select
                value={formData.interior.rear_wiper}
                onChange={(e) => handleInputChange('interior', 'rear_wiper', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
            <div className="form-group">
              <label>Rear View Mirror</label>
              <select
                value={formData.interior.rear_view_mirror}
                onChange={(e) => handleInputChange('interior', 'rear_view_mirror', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bonnet Lever</label>
              <select
                value={formData.interior.bonnet_lever}
                onChange={(e) => handleInputChange('interior', 'bonnet_lever', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Side Mirror Adjustment</label>
              <select
                value={formData.interior.side_mirror_adjustment}
                onChange={(e) => handleInputChange('interior', 'side_mirror_adjustment', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fuel Lid Lever</label>
              <select
                value={formData.interior.fuel_lid_lever}
                onChange={(e) => handleInputChange('interior', 'fuel_lid_lever', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Power Windows</label>
              <select
                value={formData.interior.power_windows}
                onChange={(e) => handleInputChange('interior', 'power_windows', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
          </div>

          {/* Driver Cabin Image */}
          <h3 className="subsection-title">Driver Cabin</h3>
          <div className="image-upload-grid">
            <ImageUploadField
              label="Driver Cabin Image"
              value={formData.images.driver_cabin}
              onChange={(value) => handleInputChange('images', 'driver_cabin', value)}
              fieldName="driver_cabin"
              imageType="large"
            />
          </div>

          <h3 className="subsection-title">Front Seats</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Front Seat Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent"
                value={formData.seats.front_condition}
                onChange={(e) => handleInputChange('seats', 'front_condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Seat Adjustment Type</label>
              <input
                type="text"
                placeholder="e.g., Manual"
                value={formData.seats.adjustment_type}
                onChange={(e) => handleInputChange('seats', 'adjustment_type', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Seat Belts</label>
              <select
                value={formData.seats.seat_belts}
                onChange={(e) => handleInputChange('seats', 'seat_belts', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
          </div>

          {/* Interior Comment */}
          <h3 className="subsection-title">Interior Inspection Comments</h3>
          <div className="form-group full-width">
            <label>Interior Comment</label>
            <textarea
              placeholder="Enter interior inspection comments..."
              value={formData.comments.interior}
              onChange={(e) => handleInputChange('comments', 'interior', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* SECTION 10: Rear Cabin & Boot Inspection */}
        <div className="form-section">
          <h2 className="section-title">🪑 Rear Cabin & Boot Inspection</h2>
          
          <h3 className="subsection-title">Rear Cabin</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Rear Seat Condition</label>
              <input
                type="text"
                placeholder="e.g., Excellent"
                value={formData.rear_seats.condition}
                onChange={(e) => handleInputChange('rear_seats', 'condition', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Arm Rest</label>
              <select
                value={formData.rear_seats.arm_rest}
                onChange={(e) => handleInputChange('rear_seats', 'arm_rest', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
            <div className="form-group">
              <label>Rear AC Vent</label>
              <select
                value={formData.rear_seats.ac_vent}
                onChange={(e) => handleInputChange('rear_seats', 'ac_vent', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
            <div className="form-group">
              <label>RHS Interior Panel</label>
              <input
                type="text"
                placeholder="e.g., Good condition"
                value={formData.rear_seats.rhs_panel}
                onChange={(e) => handleInputChange('rear_seats', 'rhs_panel', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>LHS Interior Panel</label>
              <input
                type="text"
                placeholder="e.g., Good condition"
                value={formData.rear_seats.lhs_panel}
                onChange={(e) => handleInputChange('rear_seats', 'lhs_panel', e.target.value)}
              />
            </div>
          </div>

          <h3 className="subsection-title">Boot Inspection</h3>
          <div className="image-upload-grid">
            <ImageUploadField
              label="Boot Space Image"
              value={formData.images.boot_space}
              onChange={(value) => handleInputChange('images', 'boot_space', value)}
              fieldName="boot_space"
              imageType="large"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Boot Condition</label>
              <select
                value={formData.boot.condition}
                onChange={(e) => handleInputChange('boot', 'condition', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </div>
            <div className="form-group">
              <label>Jack & Tool Kit Available?</label>
              <select
                value={formData.boot.jack_available}
                onChange={(e) => handleInputChange('boot', 'jack_available', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Additional Interior Comment */}
          <h3 className="subsection-title">Additional Interior Comments</h3>
          <div className="form-group full-width">
            <label>Additional Interior Comment</label>
            <textarea
              placeholder="Enter additional interior details..."
              value={formData.comments.interior_additional}
              onChange={(e) => handleInputChange('comments', 'interior_additional', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* SECTION 11: Engine Inspection */}
        <div className="form-section">
          <h2 className="section-title">🔧 Engine Inspection</h2>
          
          {/* Engine Images */}
          <div className="image-upload-grid">
            <ImageUploadField
              label="Engine Compartment Image"
              value={formData.images.engine_compartment}
              onChange={(value) => handleInputChange('images', 'engine_compartment', value)}
              fieldName="engine_compartment"
              imageType="third"
            />
            <ImageUploadField
              label="Firewall Image"
              value={formData.images.firewall}
              onChange={(value) => handleInputChange('images', 'firewall', value)}
              fieldName="firewall"
              imageType="third"
            />
            <ImageUploadField
              label="Battery Image"
              value={formData.images.battery}
              onChange={(value) => handleInputChange('images', 'battery', value)}
              fieldName="battery"
              imageType="third"
            />
          </div>

          <h3 className="subsection-title">Engine Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Oil Leaks</label>
              <select
                value={formData.engine.oil_leak}
                onChange={(e) => handleInputChange('engine', 'oil_leak', e.target.value)}
              >
                <option value="">Select</option>
                <option value="No Leaks">No Leaks</option>
                <option value="Minor Leaks">Minor Leaks</option>
                <option value="Major Leaks">Major Leaks</option>
              </select>
            </div>
            <div className="form-group">
              <label>Battery Condition</label>
              <select
                value={formData.engine.battery_condition}
                onChange={(e) => handleInputChange('engine', 'battery_condition', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Replacement">Needs Replacement</option>
              </select>
            </div>
            <div className="form-group">
              <label>Hose Pipes</label>
              <select
                value={formData.engine.hose_pipes}
                onChange={(e) => handleInputChange('engine', 'hose_pipes', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Replacement">Needs Replacement</option>
              </select>
            </div>
            <div className="form-group">
              <label>Engine Oil Condition</label>
              <select
                value={formData.engine.oil_condition}
                onChange={(e) => handleInputChange('engine', 'oil_condition', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Change">Needs Change</option>
              </select>
            </div>
            <div className="form-group">
              <label>Wiring</label>
              <select
                value={formData.engine.wiring}
                onChange={(e) => handleInputChange('engine', 'wiring', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Attention">Needs Attention</option>
              </select>
            </div>
            <div className="form-group">
              <label>Engine Mounts</label>
              <select
                value={formData.engine.mounting}
                onChange={(e) => handleInputChange('engine', 'mounting', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Replacement">Needs Replacement</option>
              </select>
            </div>
            <div className="form-group">
              <label>Brake Oil Level</label>
              <select
                value={formData.engine.brake_oil_level}
                onChange={(e) => handleInputChange('engine', 'brake_oil_level', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Optimal">Optimal</option>
                <option value="Low">Low</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label>Coolant Level</label>
              <select
                value={formData.engine.coolant_level}
                onChange={(e) => handleInputChange('engine', 'coolant_level', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Optimal">Optimal</option>
                <option value="Low">Low</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label>Belts Condition</label>
              <select
                value={formData.engine.belts}
                onChange={(e) => handleInputChange('engine', 'belts', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Replacement">Needs Replacement</option>
              </select>
            </div>
            <div className="form-group">
              <label>Firewall Rust</label>
              <select
                value={formData.engine.firewall_rust}
                onChange={(e) => handleInputChange('engine', 'firewall_rust', e.target.value)}
              >
                <option value="">Select</option>
                <option value="No Rust">No Rust</option>
                <option value="Minor Rust">Minor Rust</option>
                <option value="Major Rust">Major Rust</option>
              </select>
            </div>
            <div className="form-group">
              <label>Estimated Repair Cost</label>
              <input
                type="text"
                placeholder="e.g., ₹5,000"
                value={formData.engine.estimated_repair_cost}
                onChange={(e) => handleInputChange('engine', 'estimated_repair_cost', e.target.value)}
              />
            </div>
          </div>

          {/* Engine Comment */}
          <h3 className="subsection-title">Engine Inspection Comments</h3>
          <div className="form-group full-width">
            <label>Engine Comment</label>
            <textarea
              placeholder="Enter engine inspection comments..."
              value={formData.comments.engine}
              onChange={(e) => handleInputChange('comments', 'engine', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* SECTION 12: Tyres & Wheels - Part 1 */}
        <div className="form-section">
          <h2 className="section-title">🛞 Tyres & Wheels Inspection</h2>
          
          {/* Front RHS Tyre */}
          <h3 className="subsection-title">Front RHS Tyre</h3>
          <div className="image-upload-grid">
            <ImageUploadField
              label="Front RHS Tyre Image"
              value={formData.images.tyre_rhs_front}
              onChange={(value) => handleInputChange('images', 'tyre_rhs_front', value)}
              fieldName="tyre_rhs_front"
              imageType="half"
            />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Tyre Brand</label>
              <input
                type="text"
                placeholder="e.g., MRF"
                value={formData.tyres.rhs_front.brand}
                onChange={(e) => handleInputChange('tyres', 'rhs_front', {...formData.tyres.rhs_front, brand: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Wheel Type</label>
              <input
                type="text"
                placeholder="e.g., Alloy"
                value={formData.tyres.rhs_front.wheel_type}
                onChange={(e) => handleInputChange('tyres', 'rhs_front', {...formData.tyres.rhs_front, wheel_type: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Remaining Life</label>
              <input
                type="text"
                placeholder="e.g., 70%"
                value={formData.tyres.rhs_front.remaining_life}
                onChange={(e) => handleInputChange('tyres', 'rhs_front', {...formData.tyres.rhs_front, remaining_life: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Est. Replacement Cost</label>
              <input
                type="text"
                placeholder="e.g., ₹3,500"
                value={formData.tyres.rhs_front.estimated_cost}
                onChange={(e) => handleInputChange('tyres', 'rhs_front', {...formData.tyres.rhs_front, estimated_cost: e.target.value})}
              />
            </div>
          </div>

          {/* Rear RHS Tyre */}
          <h3 className="subsection-title">Rear RHS Tyre</h3>
          <div className="image-upload-grid">
            <ImageUploadField
              label="Rear RHS Tyre Image"
              value={formData.images.tyre_rhs_rear}
              onChange={(value) => handleInputChange('images', 'tyre_rhs_rear', value)}
              fieldName="tyre_rhs_rear"
              imageType="half"
            />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Tyre Brand</label>
              <input
                type="text"
                placeholder="e.g., MRF"
                value={formData.tyres.rhs_rear.brand}
                onChange={(e) => handleInputChange('tyres', 'rhs_rear', {...formData.tyres.rhs_rear, brand: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Wheel Type</label>
              <input
                type="text"
                placeholder="e.g., Alloy"
                value={formData.tyres.rhs_rear.wheel_type}
                onChange={(e) => handleInputChange('tyres', 'rhs_rear', {...formData.tyres.rhs_rear, wheel_type: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Remaining Life</label>
              <input
                type="text"
                placeholder="e.g., 60%"
                value={formData.tyres.rhs_rear.remaining_life}
                onChange={(e) => handleInputChange('tyres', 'rhs_rear', {...formData.tyres.rhs_rear, remaining_life: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Est. Replacement Cost</label>
              <input
                type="text"
                placeholder="e.g., ₹3,500"
                value={formData.tyres.rhs_rear.estimated_cost}
                onChange={(e) => handleInputChange('tyres', 'rhs_rear', {...formData.tyres.rhs_rear, estimated_cost: e.target.value})}
              />
            </div>
          </div>

          {/* Front LHS Tyre */}
          <h3 className="subsection-title">Front LHS Tyre</h3>
          <div className="image-upload-grid">
            <ImageUploadField
              label="Front LHS Tyre Image"
              value={formData.images.tyre_lhs_front}
              onChange={(value) => handleInputChange('images', 'tyre_lhs_front', value)}
              fieldName="tyre_lhs_front"
              imageType="half"
            />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Tyre Brand</label>
              <input
                type="text"
                placeholder="e.g., CEAT"
                value={formData.tyres.lhs_front.brand}
                onChange={(e) => handleInputChange('tyres', 'lhs_front', {...formData.tyres.lhs_front, brand: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Wheel Type</label>
              <input
                type="text"
                placeholder="e.g., Steel"
                value={formData.tyres.lhs_front.wheel_type}
                onChange={(e) => handleInputChange('tyres', 'lhs_front', {...formData.tyres.lhs_front, wheel_type: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Remaining Life</label>
              <input
                type="text"
                placeholder="e.g., 65%"
                value={formData.tyres.lhs_front.remaining_life}
                onChange={(e) => handleInputChange('tyres', 'lhs_front', {...formData.tyres.lhs_front, remaining_life: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Est. Replacement Cost</label>
              <input
                type="text"
                placeholder="e.g., ₹3,500"
                value={formData.tyres.lhs_front.estimated_cost}
                onChange={(e) => handleInputChange('tyres', 'lhs_front', {...formData.tyres.lhs_front, estimated_cost: e.target.value})}
              />
            </div>
          </div>

          {/* Rear LHS Tyre */}
          <h3 className="subsection-title">Rear LHS Tyre</h3>
          <div className="image-upload-grid">
            <ImageUploadField
              label="Rear LHS Tyre Image"
              value={formData.images.tyre_lhs_rear}
              onChange={(value) => handleInputChange('images', 'tyre_lhs_rear', value)}
              fieldName="tyre_lhs_rear"
              imageType="half"
            />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Tyre Brand</label>
              <input
                type="text"
                placeholder="e.g., CEAT"
                value={formData.tyres.lhs_rear.brand}
                onChange={(e) => handleInputChange('tyres', 'lhs_rear', {...formData.tyres.lhs_rear, brand: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Wheel Type</label>
              <input
                type="text"
                placeholder="e.g., Steel"
                value={formData.tyres.lhs_rear.wheel_type}
                onChange={(e) => handleInputChange('tyres', 'lhs_rear', {...formData.tyres.lhs_rear, wheel_type: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Remaining Life</label>
              <input
                type="text"
                placeholder="e.g., 55%"
                value={formData.tyres.lhs_rear.remaining_life}
                onChange={(e) => handleInputChange('tyres', 'lhs_rear', {...formData.tyres.lhs_rear, remaining_life: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Est. Replacement Cost</label>
              <input
                type="text"
                placeholder="e.g., ₹3,500"
                value={formData.tyres.lhs_rear.estimated_cost}
                onChange={(e) => handleInputChange('tyres', 'lhs_rear', {...formData.tyres.lhs_rear, estimated_cost: e.target.value})}
              />
            </div>
          </div>

          {/* Spare Tyre */}
          <h3 className="subsection-title">Spare Tyre</h3>
          <div className="image-upload-grid">
            <ImageUploadField
              label="Spare Tyre Image"
              value={formData.images.spare_tyre}
              onChange={(value) => handleInputChange('images', 'spare_tyre', value)}
              fieldName="spare_tyre"
              imageType="half"
            />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Tyre Brand</label>
              <input
                type="text"
                placeholder="e.g., Apollo"
                value={formData.tyres.spare.brand}
                onChange={(e) => handleInputChange('tyres', 'spare', {...formData.tyres.spare, brand: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Wheel Type</label>
              <input
                type="text"
                placeholder="e.g., Steel"
                value={formData.tyres.spare.wheel_type}
                onChange={(e) => handleInputChange('tyres', 'spare', {...formData.tyres.spare, wheel_type: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Remaining Life</label>
              <input
                type="text"
                placeholder="e.g., 90%"
                value={formData.tyres.spare.remaining_life}
                onChange={(e) => handleInputChange('tyres', 'spare', {...formData.tyres.spare, remaining_life: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Est. Replacement Cost</label>
              <input
                type="text"
                placeholder="e.g., ₹3,500"
                value={formData.tyres.spare.estimated_cost}
                onChange={(e) => handleInputChange('tyres', 'spare', {...formData.tyres.spare, estimated_cost: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* SECTION 13: Structure Inspection */}
        <div className="form-section">
          <h2 className="section-title">🏗️ Structure Inspection</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Upper Member</label>
              <select
                value={formData.structure.upper_member}
                onChange={(e) => handleInputChange('structure', 'upper_member', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>Lower Member</label>
              <select
                value={formData.structure.lower_member}
                onChange={(e) => handleInputChange('structure', 'lower_member', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cross Member</label>
              <select
                value={formData.structure.cross_member}
                onChange={(e) => handleInputChange('structure', 'cross_member', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>RHS Apron</label>
              <select
                value={formData.structure.rhs_apron}
                onChange={(e) => handleInputChange('structure', 'rhs_apron', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>LHS Apron</label>
              <select
                value={formData.structure.lhs_apron}
                onChange={(e) => handleInputChange('structure', 'lhs_apron', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>A Pillar RHS</label>
              <select
                value={formData.structure.a_pillar_rhs}
                onChange={(e) => handleInputChange('structure', 'a_pillar_rhs', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>A Pillar LHS</label>
              <select
                value={formData.structure.a_pillar_lhs}
                onChange={(e) => handleInputChange('structure', 'a_pillar_lhs', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>B Pillar RHS</label>
              <select
                value={formData.structure.b_pillar_rhs}
                onChange={(e) => handleInputChange('structure', 'b_pillar_rhs', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>B Pillar LHS</label>
              <select
                value={formData.structure.b_pillar_lhs}
                onChange={(e) => handleInputChange('structure', 'b_pillar_lhs', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>C Pillar RHS</label>
              <select
                value={formData.structure.c_pillar_rhs}
                onChange={(e) => handleInputChange('structure', 'c_pillar_rhs', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>C Pillar LHS</label>
              <select
                value={formData.structure.c_pillar_lhs}
                onChange={(e) => handleInputChange('structure', 'c_pillar_lhs', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>RHS Fender Wall</label>
              <select
                value={formData.structure.fender_wall_rhs}
                onChange={(e) => handleInputChange('structure', 'fender_wall_rhs', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>LHS Fender Wall</label>
              <select
                value={formData.structure.fender_wall_lhs}
                onChange={(e) => handleInputChange('structure', 'fender_wall_lhs', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tailgate Frame</label>
              <select
                value={formData.structure.tailgate_frame}
                onChange={(e) => handleInputChange('structure', 'tailgate_frame', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>Dicky Tub</label>
              <select
                value={formData.structure.dicky_tub}
                onChange={(e) => handleInputChange('structure', 'dicky_tub', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Repaired">Repaired</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
          </div>

          {/* Structure Comment */}
          <h3 className="subsection-title">Structure Inspection Comments</h3>
          <div className="form-group full-width">
            <label>Structure Comment</label>
            <textarea
              placeholder="Enter structure inspection comments..."
              value={formData.comments.structure}
              onChange={(e) => handleInputChange('comments', 'structure', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* SECTION 14: Performance & Test Drive */}
        <div className="form-section">
          <h2 className="section-title">🚘 Performance & Test Drive</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Steering</label>
              <select
                value={formData.performance.steering}
                onChange={(e) => handleInputChange('performance', 'steering', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Smooth">Smooth</option>
                <option value="Fair">Fair</option>
                <option value="Needs Attention">Needs Attention</option>
              </select>
            </div>
            <div className="form-group">
              <label>Alignment</label>
              <select
                value={formData.performance.alignment}
                onChange={(e) => handleInputChange('performance', 'alignment', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Needs Adjustment">Needs Adjustment</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ignition</label>
              <select
                value={formData.performance.ignition}
                onChange={(e) => handleInputChange('performance', 'ignition', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Smooth Start">Smooth Start</option>
                <option value="Delayed Start">Delayed Start</option>
                <option value="Issues">Issues</option>
              </select>
            </div>
            <div className="form-group">
              <label>Clutch</label>
              <select
                value={formData.performance.clutch}
                onChange={(e) => handleInputChange('performance', 'clutch', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Smooth">Smooth</option>
                <option value="Fair">Fair</option>
                <option value="Slipping">Slipping</option>
                <option value="N/A (Automatic)">N/A (Automatic)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Brakes</label>
              <select
                value={formData.performance.brakes}
                onChange={(e) => handleInputChange('performance', 'brakes', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Responsive">Responsive</option>
                <option value="Fair">Fair</option>
                <option value="Needs Service">Needs Service</option>
              </select>
            </div>
            <div className="form-group">
              <label>Gear Shifting</label>
              <select
                value={formData.performance.gear_shift}
                onChange={(e) => handleInputChange('performance', 'gear_shift', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Smooth">Smooth</option>
                <option value="Fair">Fair</option>
                <option value="Hard Shifting">Hard Shifting</option>
              </select>
            </div>
            <div className="form-group">
              <label>Acceleration</label>
              <select
                value={formData.performance.acceleration}
                onChange={(e) => handleInputChange('performance', 'acceleration', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Sluggish">Sluggish</option>
              </select>
            </div>
            <div className="form-group">
              <label>Suspension</label>
              <select
                value={formData.performance.suspension}
                onChange={(e) => handleInputChange('performance', 'suspension', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Noisy">Noisy</option>
              </select>
            </div>
            <div className="form-group">
              <label>Engine Noise</label>
              <select
                value={formData.performance.engine_noise}
                onChange={(e) => handleInputChange('performance', 'engine_noise', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Normal">Normal</option>
                <option value="Slightly Noisy">Slightly Noisy</option>
                <option value="Excessive">Excessive</option>
              </select>
            </div>
            <div className="form-group">
              <label>CNG Performance</label>
              <select
                value={formData.performance.cng_mode}
                onChange={(e) => handleInputChange('performance', 'cng_mode', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Issues">Issues</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div className="form-group">
              <label>Wheel Alignment</label>
              <select
                value={formData.performance.wheel_alignment}
                onChange={(e) => handleInputChange('performance', 'wheel_alignment', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Needs Adjustment">Needs Adjustment</option>
              </select>
            </div>
            <div className="form-group">
              <label>Estimated Repair Cost</label>
              <input
                type="text"
                placeholder="e.g., ₹10,000"
                value={formData.performance.estimated_repair_cost}
                onChange={(e) => handleInputChange('performance', 'estimated_repair_cost', e.target.value)}
              />
            </div>
          </div>

          {/* Test Drive Comment */}
          <h3 className="subsection-title">Test Drive Comments</h3>
          <div className="form-group full-width">
            <label>Test Drive Comment</label>
            <textarea
              placeholder="Enter test drive comments..."
              value={formData.comments.test_drive}
              onChange={(e) => handleInputChange('comments', 'test_drive', e.target.value)}
              rows={3}
            />
          </div>
        </div>

      </div>
    </div>
  );
}