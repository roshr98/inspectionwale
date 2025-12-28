import React, { useState, useEffect } from 'react';
import { Save, FileText, ChevronRight, ChevronLeft, Trash2, Database } from 'lucide-react';
import { getInspectionData, saveInspectionData, clearInspectionData } from '../../utils/dataLoader';
import { prefillInspectionForm, clearInspectionForm } from '../../utils/testDataHelper';
import { ImageUploadField } from './ImageUploadField';

interface InspectorFormProps {
  onSave: (formData: any) => void;
  onViewReport: () => void;
}

export function InspectorForm({ onSave, onViewReport }: InspectorFormProps) {
  const [currentSection, setCurrentSection] = useState(0);
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

  const sections = [
    'Inspection Info',
    'Vehicle Details',
    'Ratings',
    'Flags & Comments',
    'Front Exterior',
    'RHS Exterior',
    'LHS Exterior',
    'Rear & Roof',
    'Interior Dashboard',
    'Seats & Boot',
    'Engine',
    'Tyres',
    'Structure',
    'Performance',
    'Images'
  ];

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

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: any = {};
    let isValid = true;

    // Add validation for required fields based on section
    if (sectionIndex === 0) {
      if (!formData.inspection.id) {
        newErrors.inspection_id = 'Inspection ID is required';
        isValid = false;
      }
      if (!formData.inspection.date) {
        newErrors.inspection_date = 'Inspection Date is required';
        isValid = false;
      }
    }

    if (sectionIndex === 1) {
      if (!formData.vehicle.registration_number) {
        newErrors.vehicle_registration = 'Vehicle Registration is required';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSave = () => {
    saveInspectionData(formData);
    onSave(formData);
    alert('Inspection data saved successfully!');
  };

  const handleLoadTestData = () => {
    if (confirm('Load test data? This will replace all current form data.')) {
      prefillInspectionForm();
    }
  };

  const handleClearData = () => {
    if (confirm('Clear all form data? This action cannot be undone.')) {
      clearInspectionForm();
    }
  };

  const renderStarRating = (value: string, onChange: (val: string) => void) => {
    return (
      <div className="star-rating-input">
        {[1, 2, 3, 4, 5].map((num) => (
          <label key={num} className="star-option">
            <input
              type="radio"
              name={`rating-${Math.random()}`}
              value={num}
              checked={value === String(num)}
              onChange={(e) => onChange(e.target.value)}
            />
            <span className="star-number">{num}</span>
          </label>
        ))}
      </div>
    );
  };

  const renderYesNoSelect = (value: string, onChange: (val: string) => void) => {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className="form-select">
        <option value="">Select...</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    );
  };

  return (
    <div className="inspector-form-container">
      <div className="form-header">
        <h1 className="form-title">Vehicle Inspection Form</h1>
        <div className="form-actions">
          <button onClick={handleLoadTestData} className="btn-test-data" title="Load sample test data">
            <Database size={20} />
            Load Test Data
          </button>
          <button onClick={handleClearData} className="btn-clear-data" title="Clear all form data">
            <Trash2 size={20} />
            Clear All
          </button>
          <button onClick={handleSave} className="btn-save">
            <Save size={20} />
            Save Data
          </button>
          <button onClick={onViewReport} className="btn-view-report">
            <FileText size={20} />
            View Report
          </button>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="section-tabs">
        {sections.map((section, index) => (
          <button
            key={index}
            className={`section-tab ${currentSection === index ? 'active' : ''}`}
            onClick={() => setCurrentSection(index)}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="form-content">
        {/* Section 0: Inspection Info */}
        {currentSection === 0 && (
          <div className="form-section">
            <h2 className="section-title">Inspection Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Inspection ID *</label>
                <input
                  type="text"
                  value={formData.inspection.id}
                  onChange={(e) => handleInputChange('inspection', 'id', e.target.value)}
                  className={`form-input ${errors.inspection_id ? 'error' : ''}`}
                  placeholder="e.g., IW-2025-001234"
                />
                {errors.inspection_id && <span className="error-text">{errors.inspection_id}</span>}
              </div>
              <div className="form-group">
                <label>Inspection Date *</label>
                <input
                  type="date"
                  value={formData.inspection.date}
                  onChange={(e) => handleInputChange('inspection', 'date', e.target.value)}
                  className={`form-input ${errors.inspection_date ? 'error' : ''}`}
                />
                {errors.inspection_date && <span className="error-text">{errors.inspection_date}</span>}
              </div>
              <div className="form-group">
                <label>Inspection Location</label>
                <input
                  type="text"
                  value={formData.inspection.location}
                  onChange={(e) => handleInputChange('inspection', 'location', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Mumbai, Maharashtra"
                />
              </div>
              <div className="form-group">
                <label>Inspector Name</label>
                <input
                  type="text"
                  value={formData.inspection.inspector_name}
                  onChange={(e) => handleInputChange('inspection', 'inspector_name', e.target.value)}
                  className="form-input"
                  placeholder="Enter inspector name"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Vehicle Details */}
        {currentSection === 1 && (
          <div className="form-section">
            <h2 className="section-title">Vehicle Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Vehicle Registration Number *</label>
                <input
                  type="text"
                  value={formData.vehicle.registration_number}
                  onChange={(e) => handleInputChange('vehicle', 'registration_number', e.target.value)}
                  className={`form-input ${errors.vehicle_registration ? 'error' : ''}`}
                  placeholder="e.g., MH 02 AB 1234"
                />
              </div>
              <div className="form-group">
                <label>Manufacturing Date</label>
                <input
                  type="text"
                  value={formData.vehicle.manufacturing_date}
                  onChange={(e) => handleInputChange('vehicle', 'manufacturing_date', e.target.value)}
                  className="form-input"
                  placeholder="e.g., March 2019"
                />
              </div>
              <div className="form-group">
                <label>Chassis Number</label>
                <input
                  type="text"
                  value={formData.vehicle.chassis_number}
                  onChange={(e) => handleInputChange('vehicle', 'chassis_number', e.target.value)}
                  className="form-input"
                  placeholder="Enter chassis number"
                />
              </div>
              <div className="form-group">
                <label>Engine Number</label>
                <input
                  type="text"
                  value={formData.vehicle.engine_number}
                  onChange={(e) => handleInputChange('vehicle', 'engine_number', e.target.value)}
                  className="form-input"
                  placeholder="Enter engine number"
                />
              </div>
              <div className="form-group">
                <label>Registration Date</label>
                <input
                  type="date"
                  value={formData.vehicle.registration_date}
                  onChange={(e) => handleInputChange('vehicle', 'registration_date', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Insurance Validity</label>
                <input
                  type="date"
                  value={formData.vehicle.insurance_validity}
                  onChange={(e) => handleInputChange('vehicle', 'insurance_validity', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Owner Name (RC)</label>
                <input
                  type="text"
                  value={formData.vehicle.owner_name}
                  onChange={(e) => handleInputChange('vehicle', 'owner_name', e.target.value)}
                  className="form-input"
                  placeholder="Enter owner name"
                />
              </div>
              <div className="form-group">
                <label>Make / Model</label>
                <input
                  type="text"
                  value={formData.vehicle.make_model}
                  onChange={(e) => handleInputChange('vehicle', 'make_model', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Maruti Suzuki Swift"
                />
              </div>
              <div className="form-group">
                <label>Variant</label>
                <input
                  type="text"
                  value={formData.vehicle.variant}
                  onChange={(e) => handleInputChange('vehicle', 'variant', e.target.value)}
                  className="form-input"
                  placeholder="e.g., VXI (O) AT"
                />
              </div>
              <div className="form-group">
                <label>Fuel Type</label>
                <select
                  value={formData.vehicle.fuel_type}
                  onChange={(e) => handleInputChange('vehicle', 'fuel_type', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select...</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div className="form-group">
                <label>Number of Owners</label>
                <select
                  value={formData.vehicle.owner_count}
                  onChange={(e) => handleInputChange('vehicle', 'owner_count', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select...</option>
                  <option value="1st Owner">1st Owner</option>
                  <option value="2nd Owner">2nd Owner</option>
                  <option value="3rd Owner">3rd Owner</option>
                  <option value="4th Owner">4th Owner</option>
                  <option value="5+ Owners">5+ Owners</option>
                </select>
              </div>
              <div className="form-group">
                <label>RC Type</label>
                <select
                  value={formData.vehicle.rc_type}
                  onChange={(e) => handleInputChange('vehicle', 'rc_type', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select...</option>
                  <option value="Private">Private</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div className="form-group">
                <label>Hypothecation</label>
                {renderYesNoSelect(formData.vehicle.hypothecation, (val) => handleInputChange('vehicle', 'hypothecation', val))}
              </div>
            </div>

            <h3 className="subsection-title">CNG Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>CNG Present</label>
                {renderYesNoSelect(formData.vehicle.cng.present, (val) => handleInputChange('vehicle', 'cng', val, 'present'))}
              </div>
              <div className="form-group">
                <label>CNG Type</label>
                <select
                  value={formData.vehicle.cng.type}
                  onChange={(e) => handleInputChange('vehicle', 'cng', e.target.value, 'type')}
                  className="form-select"
                >
                  <option value="">Select...</option>
                  <option value="Company Fitted">Company Fitted</option>
                  <option value="Aftermarket">Aftermarket</option>
                </select>
              </div>
              <div className="form-group">
                <label>CNG Validity Date</label>
                <input
                  type="date"
                  value={formData.vehicle.cng.validity}
                  onChange={(e) => handleInputChange('vehicle', 'cng', e.target.value, 'validity')}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>CNG Endorsed on RC</label>
                {renderYesNoSelect(formData.vehicle.cng.endorsed, (val) => handleInputChange('vehicle', 'cng', val, 'endorsed'))}
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Ratings */}
        {currentSection === 2 && (
          <div className="form-section">
            <h2 className="section-title">Ratings (1-5 Stars)</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Interior Rating</label>
                {renderStarRating(formData.ratings.interior, (val) => handleInputChange('ratings', 'interior', val))}
              </div>
              <div className="form-group">
                <label>Exterior Rating</label>
                {renderStarRating(formData.ratings.exterior, (val) => handleInputChange('ratings', 'exterior', val))}
              </div>
              <div className="form-group">
                <label>Engine Rating</label>
                {renderStarRating(formData.ratings.engine, (val) => handleInputChange('ratings', 'engine', val))}
              </div>
              <div className="form-group">
                <label>Test Drive Rating</label>
                {renderStarRating(formData.ratings.test_drive, (val) => handleInputChange('ratings', 'test_drive', val))}
              </div>
              <div className="form-group">
                <label>Structure Rating</label>
                {renderStarRating(formData.ratings.structure, (val) => handleInputChange('ratings', 'structure', val))}
              </div>
              <div className="form-group">
                <label>Electrical Rating</label>
                {renderStarRating(formData.ratings.electrical, (val) => handleInputChange('ratings', 'electrical', val))}
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Flags & Comments */}
        {currentSection === 3 && (
          <div className="form-section">
            <h2 className="section-title">Inspection Flags</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Is Car Accidental?</label>
                {renderYesNoSelect(formData.flags.accidental, (val) => handleInputChange('flags', 'accidental', val))}
              </div>
              <div className="form-group">
                <label>Flood Damage</label>
                {renderYesNoSelect(formData.flags.flood_damage, (val) => handleInputChange('flags', 'flood_damage', val))}
              </div>
              <div className="form-group">
                <label>Fire Damage</label>
                {renderYesNoSelect(formData.flags.fire_damage, (val) => handleInputChange('flags', 'fire_damage', val))}
              </div>
              <div className="form-group">
                <label>RC & Chassis Match</label>
                {renderYesNoSelect(formData.flags.rc_chassis_match, (val) => handleInputChange('flags', 'rc_chassis_match', val))}
              </div>
              <div className="form-group">
                <label>Service Logs Available</label>
                {renderYesNoSelect(formData.flags.service_logs_available, (val) => handleInputChange('flags', 'service_logs_available', val))}
              </div>
            </div>

            <h3 className="subsection-title">Comments</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Engine Comment</label>
                <textarea
                  value={formData.comments.engine}
                  onChange={(e) => handleInputChange('comments', 'engine', e.target.value)}
                  className="form-textarea"
                  rows={2}
                  placeholder="Enter engine inspection comments"
                />
              </div>
              <div className="form-group full-width">
                <label>Structure Comment</label>
                <textarea
                  value={formData.comments.structure}
                  onChange={(e) => handleInputChange('comments', 'structure', e.target.value)}
                  className="form-textarea"
                  rows={2}
                  placeholder="Enter structure inspection comments"
                />
              </div>
              <div className="form-group full-width">
                <label>Test Drive Comment</label>
                <textarea
                  value={formData.comments.test_drive}
                  onChange={(e) => handleInputChange('comments', 'test_drive', e.target.value)}
                  className="form-textarea"
                  rows={2}
                  placeholder="Enter test drive comments"
                />
              </div>
              <div className="form-group full-width">
                <label>Exterior Comment</label>
                <textarea
                  value={formData.comments.exterior}
                  onChange={(e) => handleInputChange('comments', 'exterior', e.target.value)}
                  className="form-textarea"
                  rows={2}
                  placeholder="Enter exterior inspection comments"
                />
              </div>
              <div className="form-group full-width">
                <label>Interior Comment</label>
                <textarea
                  value={formData.comments.interior}
                  onChange={(e) => handleInputChange('comments', 'interior', e.target.value)}
                  className="form-textarea"
                  rows={2}
                  placeholder="Enter interior inspection comments"
                />
              </div>
              <div className="form-group full-width">
                <label>Additional Interior Comment</label>
                <textarea
                  value={formData.comments.interior_additional}
                  onChange={(e) => handleInputChange('comments', 'interior_additional', e.target.value)}
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter detailed interior comments for rear cabin and boot section"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Front Exterior */}
        {currentSection === 4 && (
          <div className="form-section">
            <h2 className="section-title">Front Exterior Inspection</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Front Bumper Condition</label>
                <input
                  type="text"
                  value={formData.front.bumper_condition}
                  onChange={(e) => handleInputChange('front', 'bumper_condition', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Minor Scratches"
                />
              </div>
              <div className="form-group">
                <label>Front Bumper Repainted?</label>
                {renderYesNoSelect(formData.front.bumper_repainted, (val) => handleInputChange('front', 'bumper_repainted', val))}
              </div>
              <div className="form-group">
                <label>Front Bumper Paint Depth</label>
                <input
                  type="text"
                  value={formData.front.bumper_paint_depth}
                  onChange={(e) => handleInputChange('front', 'bumper_paint_depth', e.target.value)}
                  className="form-input"
                  placeholder="e.g., 120 µm"
                />
              </div>
              <div className="form-group">
                <label>Bonnet Condition</label>
                <input
                  type="text"
                  value={formData.front.bonnet_condition}
                  onChange={(e) => handleInputChange('front', 'bonnet_condition', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Excellent"
                />
              </div>
              <div className="form-group">
                <label>Bonnet Repainted?</label>
                {renderYesNoSelect(formData.front.bonnet_repainted, (val) => handleInputChange('front', 'bonnet_repainted', val))}
              </div>
              <div className="form-group">
                <label>Bonnet Paint Depth</label>
                <input
                  type="text"
                  value={formData.front.bonnet_paint_depth}
                  onChange={(e) => handleInputChange('front', 'bonnet_paint_depth', e.target.value)}
                  className="form-input"
                  placeholder="e.g., 115 µm"
                />
              </div>
              <div className="form-group">
                <label>Bonnet Company Fitted?</label>
                {renderYesNoSelect(formData.front.bonnet_company_fitted, (val) => handleInputChange('front', 'bonnet_company_fitted', val))}
              </div>
              <div className="form-group">
                <label>Grill Condition</label>
                <input
                  type="text"
                  value={formData.front.grill_condition}
                  onChange={(e) => handleInputChange('front', 'grill_condition', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Good - Minor chips"
                />
              </div>
              <div className="form-group">
                <label>Windshield Original?</label>
                {renderYesNoSelect(formData.front.windshield_original, (val) => handleInputChange('front', 'windshield_original', val))}
              </div>
              <div className="form-group">
                <label>Windshield Condition</label>
                <input
                  type="text"
                  value={formData.front.windshield_condition}
                  onChange={(e) => handleInputChange('front', 'windshield_condition', e.target.value)}
                  className="form-input"
                  placeholder="e.g., No cracks or chips"
                />
              </div>
              <div className="form-group">
                <label>Headlight Condition</label>
                <input
                  type="text"
                  value={formData.front.headlight_condition}
                  onChange={(e) => handleInputChange('front', 'headlight_condition', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Excellent - No fogging"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 5: RHS Exterior */}
        {currentSection === 5 && (
          <div className="form-section">
            <h2 className="section-title">RHS Exterior Inspection</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>RHS Fender Condition</label>
                <input
                  type="text"
                  value={formData.rhs.fender_condition}
                  onChange={(e) => handleInputChange('rhs', 'fender_condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>RHS Fender Repainted?</label>
                {renderYesNoSelect(formData.rhs.fender_repainted, (val) => handleInputChange('rhs', 'fender_repainted', val))}
              </div>
              <div className="form-group">
                <label>RHS Fender Paint Depth</label>
                <input
                  type="text"
                  value={formData.rhs.fender_paint_depth}
                  onChange={(e) => handleInputChange('rhs', 'fender_paint_depth', e.target.value)}
                  className="form-input"
                  placeholder="e.g., 118 µm"
                />
              </div>
              <div className="form-group">
                <label>RHS Front Door Condition</label>
                <input
                  type="text"
                  value={formData.rhs.front_door_condition}
                  onChange={(e) => handleInputChange('rhs', 'front_door_condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>RHS Front Door Repainted?</label>
                {renderYesNoSelect(formData.rhs.front_door_repainted, (val) => handleInputChange('rhs', 'front_door_repainted', val))}
              </div>
              <div className="form-group">
                <label>RHS Front Door Paint Depth</label>
                <input
                  type="text"
                  value={formData.rhs.front_door_paint_depth}
                  onChange={(e) => handleInputChange('rhs', 'front_door_paint_depth', e.target.value)}
                  className="form-input"
                  placeholder="e.g., 122 µm"
                />
              </div>
              <div className="form-group">
                <label>RHS Front Door Company Fitted?</label>
                {renderYesNoSelect(formData.rhs.front_door_company_fitted, (val) => handleInputChange('rhs', 'front_door_company_fitted', val))}
              </div>
              <div className="form-group">
                <label>RHS Rear Door Condition</label>
                <input
                  type="text"
                  value={formData.rhs.rear_door_condition}
                  onChange={(e) => handleInputChange('rhs', 'rear_door_condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>RHS Rear Door Repainted?</label>
                {renderYesNoSelect(formData.rhs.rear_door_repainted, (val) => handleInputChange('rhs', 'rear_door_repainted', val))}
              </div>
              <div className="form-group">
                <label>RHS Rear Door Paint Depth</label>
                <input
                  type="text"
                  value={formData.rhs.rear_door_paint_depth}
                  onChange={(e) => handleInputChange('rhs', 'rear_door_paint_depth', e.target.value)}
                  className="form-input"
                  placeholder="e.g., 117 µm"
                />
              </div>
              <div className="form-group">
                <label>RHS Rear Door Company Fitted?</label>
                {renderYesNoSelect(formData.rhs.rear_door_company_fitted, (val) => handleInputChange('rhs', 'rear_door_company_fitted', val))}
              </div>
              <div className="form-group">
                <label>RHS Quarter Panel Condition</label>
                <input
                  type="text"
                  value={formData.rhs.quarter_panel_condition}
                  onChange={(e) => handleInputChange('rhs', 'quarter_panel_condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>RHS Quarter Panel Repainted?</label>
                {renderYesNoSelect(formData.rhs.quarter_panel_repainted, (val) => handleInputChange('rhs', 'quarter_panel_repainted', val))}
              </div>
              <div className="form-group">
                <label>RHS Quarter Panel Paint Depth</label>
                <input
                  type="text"
                  value={formData.rhs.quarter_panel_paint_depth}
                  onChange={(e) => handleInputChange('rhs', 'quarter_panel_paint_depth', e.target.value)}
                  className="form-input"
                  placeholder="e.g., 119 µm"
                />
              </div>
              <div className="form-group">
                <label>RHS Window Glass Original?</label>
                {renderYesNoSelect(formData.rhs.window_glass_original, (val) => handleInputChange('rhs', 'window_glass_original', val))}
              </div>
              <div className="form-group">
                <label>RHS Side Mirror Condition</label>
                <input
                  type="text"
                  value={formData.rhs.side_mirror_condition}
                  onChange={(e) => handleInputChange('rhs', 'side_mirror_condition', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 6: LHS Exterior */}
        {currentSection === 6 && (
          <div className="form-section">
            <h2 className="section-title">LHS Exterior Inspection</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>LHS Fender Condition</label>
                <input
                  type="text"
                  value={formData.lhs.fender_condition}
                  onChange={(e) => handleInputChange('lhs', 'fender_condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>LHS Front Door Condition</label>
                <input
                  type="text"
                  value={formData.lhs.front_door_condition}
                  onChange={(e) => handleInputChange('lhs', 'front_door_condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>LHS Rear Door Condition</label>
                <input
                  type="text"
                  value={formData.lhs.rear_door_condition}
                  onChange={(e) => handleInputChange('lhs', 'rear_door_condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>LHS Quarter Panel Condition</label>
                <input
                  type="text"
                  value={formData.lhs.quarter_panel_condition}
                  onChange={(e) => handleInputChange('lhs', 'quarter_panel_condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>LHS Window Glass Original?</label>
                {renderYesNoSelect(formData.lhs.window_glass_original, (val) => handleInputChange('lhs', 'window_glass_original', val))}
              </div>
              <div className="form-group">
                <label>LHS Side Mirror Condition</label>
                <input
                  type="text"
                  value={formData.lhs.side_mirror_condition}
                  onChange={(e) => handleInputChange('lhs', 'side_mirror_condition', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 7: Rear & Roof */}
        {currentSection === 7 && (
          <div className="form-section">
            <h2 className="section-title">Rear & Roof Inspection</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Rear Bumper Condition</label>
                <input
                  type="text"
                  value={formData.rear.bumper_condition}
                  onChange={(e) => handleInputChange('rear', 'bumper_condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Rear Bumper Repainted?</label>
                {renderYesNoSelect(formData.rear.bumper_repainted, (val) => handleInputChange('rear', 'bumper_repainted', val))}
              </div>
              <div className="form-group">
                <label>Rear Bumper Paint Depth</label>
                <input
                  type="text"
                  value={formData.rear.bumper_paint_depth}
                  onChange={(e) => handleInputChange('rear', 'bumper_paint_depth', e.target.value)}
                  className="form-input"
                  placeholder="e.g., 119 µm"
                />
              </div>
              <div className="form-group">
                <label>Rear Windshield Condition</label>
                <input
                  type="text"
                  value={formData.rear.windshield_condition}
                  onChange={(e) => handleInputChange('rear', 'windshield_condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Rear Windshield Original?</label>
                {renderYesNoSelect(formData.rear.windshield_original, (val) => handleInputChange('rear', 'windshield_original', val))}
              </div>
              <div className="form-group">
                <label>Tailgate Condition</label>
                <input
                  type="text"
                  value={formData.rear.tailgate_condition}
                  onChange={(e) => handleInputChange('rear', 'tailgate_condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Tailgate Repainted?</label>
                {renderYesNoSelect(formData.rear.tailgate_repainted, (val) => handleInputChange('rear', 'tailgate_repainted', val))}
              </div>
              <div className="form-group">
                <label>Tailgate Paint Depth</label>
                <input
                  type="text"
                  value={formData.rear.tailgate_paint_depth}
                  onChange={(e) => handleInputChange('rear', 'tailgate_paint_depth', e.target.value)}
                  className="form-input"
                  placeholder="e.g., 117 µm"
                />
              </div>
              <div className="form-group">
                <label>Tailgate Original?</label>
                {renderYesNoSelect(formData.rear.tailgate_original, (val) => handleInputChange('rear', 'tailgate_original', val))}
              </div>
              <div className="form-group">
                <label>Tail Lights Condition</label>
                <input
                  type="text"
                  value={formData.rear.tail_lights_condition}
                  onChange={(e) => handleInputChange('rear', 'tail_lights_condition', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <h3 className="subsection-title">Roof</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Roof Condition</label>
                <input
                  type="text"
                  value={formData.roof.condition}
                  onChange={(e) => handleInputChange('roof', 'condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Roof Type</label>
                <input
                  type="text"
                  value={formData.roof.type}
                  onChange={(e) => handleInputChange('roof', 'type', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Standard Metal Roof"
                />
              </div>
              <div className="form-group">
                <label>Roof Paint Depth</label>
                <input
                  type="text"
                  value={formData.roof.paint_depth}
                  onChange={(e) => handleInputChange('roof', 'paint_depth', e.target.value)}
                  className="form-input"
                  placeholder="e.g., 115 µm"
                />
              </div>
              <div className="form-group">
                <label>Roof Repainted?</label>
                {renderYesNoSelect(formData.roof.repainted, (val) => handleInputChange('roof', 'repainted', val))}
              </div>
            </div>
          </div>
        )}

        {/* Section 8: Interior Dashboard */}
        {currentSection === 8 && (
          <div className="form-section">
            <h2 className="section-title">Interior Dashboard Inspection</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>MIL Light</label>
                <input
                  type="text"
                  value={formData.interior.mil_light}
                  onChange={(e) => handleInputChange('interior', 'mil_light', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Not Illuminated"
                />
              </div>
              <div className="form-group">
                <label>Dashboard Condition</label>
                <input
                  type="text"
                  value={formData.interior.dashboard_condition}
                  onChange={(e) => handleInputChange('interior', 'dashboard_condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Music System</label>
                <input
                  type="text"
                  value={formData.interior.music_system}
                  onChange={(e) => handleInputChange('interior', 'music_system', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Working"
                />
              </div>
              <div className="form-group">
                <label>Steering Controls</label>
                <input
                  type="text"
                  value={formData.interior.steering_controls}
                  onChange={(e) => handleInputChange('interior', 'steering_controls', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Paddle Shifters</label>
                <input
                  type="text"
                  value={formData.interior.paddle_shifters}
                  onChange={(e) => handleInputChange('interior', 'paddle_shifters', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Not Available"
                />
              </div>
              <div className="form-group">
                <label>Hand Brake</label>
                <input
                  type="text"
                  value={formData.interior.hand_brake}
                  onChange={(e) => handleInputChange('interior', 'hand_brake', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Speakers</label>
                <input
                  type="text"
                  value={formData.interior.speakers}
                  onChange={(e) => handleInputChange('interior', 'speakers', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>AC Vents</label>
                <input
                  type="text"
                  value={formData.interior.ac_vents}
                  onChange={(e) => handleInputChange('interior', 'ac_vents', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>AC Working</label>
                <input
                  type="text"
                  value={formData.interior.ac_working}
                  onChange={(e) => handleInputChange('interior', 'ac_working', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Steering Type</label>
                <input
                  type="text"
                  value={formData.interior.steering_type}
                  onChange={(e) => handleInputChange('interior', 'steering_type', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Power Steering"
                />
              </div>
              <div className="form-group">
                <label>Cruise Control</label>
                <input
                  type="text"
                  value={formData.interior.cruise_control}
                  onChange={(e) => handleInputChange('interior', 'cruise_control', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Navigation</label>
                <input
                  type="text"
                  value={formData.interior.navigation}
                  onChange={(e) => handleInputChange('interior', 'navigation', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Glove Box</label>
                <input
                  type="text"
                  value={formData.interior.glove_box}
                  onChange={(e) => handleInputChange('interior', 'glove_box', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Cabin Lights</label>
                <input
                  type="text"
                  value={formData.interior.cabin_lights}
                  onChange={(e) => handleInputChange('interior', 'cabin_lights', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Headlights</label>
                <input
                  type="text"
                  value={formData.interior.headlights}
                  onChange={(e) => handleInputChange('interior', 'headlights', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Wipers</label>
                <input
                  type="text"
                  value={formData.interior.wipers}
                  onChange={(e) => handleInputChange('interior', 'wipers', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Trip Switch</label>
                <input
                  type="text"
                  value={formData.interior.trip_switch}
                  onChange={(e) => handleInputChange('interior', 'trip_switch', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Boot Lever</label>
                <input
                  type="text"
                  value={formData.interior.boot_lever}
                  onChange={(e) => handleInputChange('interior', 'boot_lever', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Central Lock</label>
                <input
                  type="text"
                  value={formData.interior.central_lock}
                  onChange={(e) => handleInputChange('interior', 'central_lock', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Rear Wiper</label>
                <input
                  type="text"
                  value={formData.interior.rear_wiper}
                  onChange={(e) => handleInputChange('interior', 'rear_wiper', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Rear View Mirror</label>
                <input
                  type="text"
                  value={formData.interior.rear_view_mirror}
                  onChange={(e) => handleInputChange('interior', 'rear_view_mirror', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Bonnet Lever</label>
                <input
                  type="text"
                  value={formData.interior.bonnet_lever}
                  onChange={(e) => handleInputChange('interior', 'bonnet_lever', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Side Mirror Adjustment</label>
                <input
                  type="text"
                  value={formData.interior.side_mirror_adjustment}
                  onChange={(e) => handleInputChange('interior', 'side_mirror_adjustment', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Fuel Lid Lever</label>
                <input
                  type="text"
                  value={formData.interior.fuel_lid_lever}
                  onChange={(e) => handleInputChange('interior', 'fuel_lid_lever', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Power Windows</label>
                <input
                  type="text"
                  value={formData.interior.power_windows}
                  onChange={(e) => handleInputChange('interior', 'power_windows', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 9: Seats & Boot */}
        {currentSection === 9 && (
          <div className="form-section">
            <h2 className="section-title">Seats & Boot Inspection</h2>
            <h3 className="subsection-title">Front Seats</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Front Seat Condition</label>
                <input
                  type="text"
                  value={formData.seats.front_condition}
                  onChange={(e) => handleInputChange('seats', 'front_condition', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Excellent - No tears"
                />
              </div>
              <div className="form-group">
                <label>Seat Adjustment Type</label>
                <select
                  value={formData.seats.adjustment_type}
                  onChange={(e) => handleInputChange('seats', 'adjustment_type', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select...</option>
                  <option value="Manual">Manual</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
              <div className="form-group">
                <label>Seat Belts</label>
                <input
                  type="text"
                  value={formData.seats.seat_belts}
                  onChange={(e) => handleInputChange('seats', 'seat_belts', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <h3 className="subsection-title">Rear Seats</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Rear Seat Condition</label>
                <input
                  type="text"
                  value={formData.rear_seats.condition}
                  onChange={(e) => handleInputChange('rear_seats', 'condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Arm Rest</label>
                <input
                  type="text"
                  value={formData.rear_seats.arm_rest}
                  onChange={(e) => handleInputChange('rear_seats', 'arm_rest', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Rear AC Vent</label>
                <input
                  type="text"
                  value={formData.rear_seats.ac_vent}
                  onChange={(e) => handleInputChange('rear_seats', 'ac_vent', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>RHS Panel</label>
                <input
                  type="text"
                  value={formData.rear_seats.rhs_panel}
                  onChange={(e) => handleInputChange('rear_seats', 'rhs_panel', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>LHS Panel</label>
                <input
                  type="text"
                  value={formData.rear_seats.lhs_panel}
                  onChange={(e) => handleInputChange('rear_seats', 'lhs_panel', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <h3 className="subsection-title">Boot</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Boot Condition</label>
                <input
                  type="text"
                  value={formData.boot.condition}
                  onChange={(e) => handleInputChange('boot', 'condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Jack Available?</label>
                <input
                  type="text"
                  value={formData.boot.jack_available}
                  onChange={(e) => handleInputChange('boot', 'jack_available', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 10: Engine */}
        {currentSection === 10 && (
          <div className="form-section">
            <h2 className="section-title">Engine Inspection</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Oil Leak</label>
                <input
                  type="text"
                  value={formData.engine.oil_leak}
                  onChange={(e) => handleInputChange('engine', 'oil_leak', e.target.value)}
                  className="form-input"
                  placeholder="e.g., No leaks detected"
                />
              </div>
              <div className="form-group">
                <label>Battery Condition</label>
                <input
                  type="text"
                  value={formData.engine.battery_condition}
                  onChange={(e) => handleInputChange('engine', 'battery_condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Hose Pipes</label>
                <input
                  type="text"
                  value={formData.engine.hose_pipes}
                  onChange={(e) => handleInputChange('engine', 'hose_pipes', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Oil Condition</label>
                <input
                  type="text"
                  value={formData.engine.oil_condition}
                  onChange={(e) => handleInputChange('engine', 'oil_condition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Wiring</label>
                <input
                  type="text"
                  value={formData.engine.wiring}
                  onChange={(e) => handleInputChange('engine', 'wiring', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Mounting</label>
                <input
                  type="text"
                  value={formData.engine.mounting}
                  onChange={(e) => handleInputChange('engine', 'mounting', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Brake Oil Level</label>
                <input
                  type="text"
                  value={formData.engine.brake_oil_level}
                  onChange={(e) => handleInputChange('engine', 'brake_oil_level', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Coolant Level</label>
                <input
                  type="text"
                  value={formData.engine.coolant_level}
                  onChange={(e) => handleInputChange('engine', 'coolant_level', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Belts</label>
                <input
                  type="text"
                  value={formData.engine.belts}
                  onChange={(e) => handleInputChange('engine', 'belts', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Firewall Rust</label>
                <input
                  type="text"
                  value={formData.engine.firewall_rust}
                  onChange={(e) => handleInputChange('engine', 'firewall_rust', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Estimated Repair Cost</label>
                <input
                  type="text"
                  value={formData.engine.estimated_repair_cost}
                  onChange={(e) => handleInputChange('engine', 'estimated_repair_cost', e.target.value)}
                  className="form-input"
                  placeholder="e.g., ₹0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 11: Tyres */}
        {currentSection === 11 && (
          <div className="form-section">
            <h2 className="section-title">Tyres Inspection</h2>
            
            <h3 className="subsection-title">RHS Front Tyre</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={formData.tyres.rhs_front.brand}
                  onChange={(e) => handleInputChange('tyres', 'rhs_front', e.target.value, 'brand')}
                  className="form-input"
                  placeholder="e.g., MRF"
                />
              </div>
              <div className="form-group">
                <label>Wheel Type</label>
                <select
                  value={formData.tyres.rhs_front.wheel_type}
                  onChange={(e) => handleInputChange('tyres', 'rhs_front', e.target.value, 'wheel_type')}
                  className="form-select"
                >
                  <option value="">Select...</option>
                  <option value="Alloy">Alloy</option>
                  <option value="Steel">Steel</option>
                </select>
              </div>
              <div className="form-group">
                <label>Remaining Life</label>
                <input
                  type="text"
                  value={formData.tyres.rhs_front.remaining_life}
                  onChange={(e) => handleInputChange('tyres', 'rhs_front', e.target.value, 'remaining_life')}
                  className="form-input"
                  placeholder="e.g., 70%"
                />
              </div>
              <div className="form-group">
                <label>Estimated Cost</label>
                <input
                  type="text"
                  value={formData.tyres.rhs_front.estimated_cost}
                  onChange={(e) => handleInputChange('tyres', 'rhs_front', e.target.value, 'estimated_cost')}
                  className="form-input"
                  placeholder="e.g., ₹0"
                />
              </div>
            </div>

            <h3 className="subsection-title">RHS Rear Tyre</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={formData.tyres.rhs_rear.brand}
                  onChange={(e) => handleInputChange('tyres', 'rhs_rear', e.target.value, 'brand')}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Wheel Type</label>
                <select
                  value={formData.tyres.rhs_rear.wheel_type}
                  onChange={(e) => handleInputChange('tyres', 'rhs_rear', e.target.value, 'wheel_type')}
                  className="form-select"
                >
                  <option value="">Select...</option>
                  <option value="Alloy">Alloy</option>
                  <option value="Steel">Steel</option>
                </select>
              </div>
              <div className="form-group">
                <label>Remaining Life</label>
                <input
                  type="text"
                  value={formData.tyres.rhs_rear.remaining_life}
                  onChange={(e) => handleInputChange('tyres', 'rhs_rear', e.target.value, 'remaining_life')}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Estimated Cost</label>
                <input
                  type="text"
                  value={formData.tyres.rhs_rear.estimated_cost}
                  onChange={(e) => handleInputChange('tyres', 'rhs_rear', e.target.value, 'estimated_cost')}
                  className="form-input"
                />
              </div>
            </div>

            <h3 className="subsection-title">LHS Front Tyre</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={formData.tyres.lhs_front.brand}
                  onChange={(e) => handleInputChange('tyres', 'lhs_front', e.target.value, 'brand')}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Wheel Type</label>
                <select
                  value={formData.tyres.lhs_front.wheel_type}
                  onChange={(e) => handleInputChange('tyres', 'lhs_front', e.target.value, 'wheel_type')}
                  className="form-select"
                >
                  <option value="">Select...</option>
                  <option value="Alloy">Alloy</option>
                  <option value="Steel">Steel</option>
                </select>
              </div>
              <div className="form-group">
                <label>Remaining Life</label>
                <input
                  type="text"
                  value={formData.tyres.lhs_front.remaining_life}
                  onChange={(e) => handleInputChange('tyres', 'lhs_front', e.target.value, 'remaining_life')}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Estimated Cost</label>
                <input
                  type="text"
                  value={formData.tyres.lhs_front.estimated_cost}
                  onChange={(e) => handleInputChange('tyres', 'lhs_front', e.target.value, 'estimated_cost')}
                  className="form-input"
                />
              </div>
            </div>

            <h3 className="subsection-title">LHS Rear Tyre</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={formData.tyres.lhs_rear.brand}
                  onChange={(e) => handleInputChange('tyres', 'lhs_rear', e.target.value, 'brand')}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Wheel Type</label>
                <select
                  value={formData.tyres.lhs_rear.wheel_type}
                  onChange={(e) => handleInputChange('tyres', 'lhs_rear', e.target.value, 'wheel_type')}
                  className="form-select"
                >
                  <option value="">Select...</option>
                  <option value="Alloy">Alloy</option>
                  <option value="Steel">Steel</option>
                </select>
              </div>
              <div className="form-group">
                <label>Remaining Life</label>
                <input
                  type="text"
                  value={formData.tyres.lhs_rear.remaining_life}
                  onChange={(e) => handleInputChange('tyres', 'lhs_rear', e.target.value, 'remaining_life')}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Estimated Cost</label>
                <input
                  type="text"
                  value={formData.tyres.lhs_rear.estimated_cost}
                  onChange={(e) => handleInputChange('tyres', 'lhs_rear', e.target.value, 'estimated_cost')}
                  className="form-input"
                />
              </div>
            </div>

            <h3 className="subsection-title">Spare Tyre</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={formData.tyres.spare.brand}
                  onChange={(e) => handleInputChange('tyres', 'spare', e.target.value, 'brand')}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Wheel Type</label>
                <select
                  value={formData.tyres.spare.wheel_type}
                  onChange={(e) => handleInputChange('tyres', 'spare', e.target.value, 'wheel_type')}
                  className="form-select"
                >
                  <option value="">Select...</option>
                  <option value="Alloy">Alloy</option>
                  <option value="Steel">Steel</option>
                </select>
              </div>
              <div className="form-group">
                <label>Remaining Life</label>
                <input
                  type="text"
                  value={formData.tyres.spare.remaining_life}
                  onChange={(e) => handleInputChange('tyres', 'spare', e.target.value, 'remaining_life')}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Estimated Cost</label>
                <input
                  type="text"
                  value={formData.tyres.spare.estimated_cost}
                  onChange={(e) => handleInputChange('tyres', 'spare', e.target.value, 'estimated_cost')}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 12: Structure */}
        {currentSection === 12 && (
          <div className="form-section">
            <h2 className="section-title">Structure Inspection</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Upper Member</label>
                <input
                  type="text"
                  value={formData.structure.upper_member}
                  onChange={(e) => handleInputChange('structure', 'upper_member', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Excellent - No damage"
                />
              </div>
              <div className="form-group">
                <label>Lower Member</label>
                <input
                  type="text"
                  value={formData.structure.lower_member}
                  onChange={(e) => handleInputChange('structure', 'lower_member', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Cross Member</label>
                <input
                  type="text"
                  value={formData.structure.cross_member}
                  onChange={(e) => handleInputChange('structure', 'cross_member', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>RHS Apron</label>
                <input
                  type="text"
                  value={formData.structure.rhs_apron}
                  onChange={(e) => handleInputChange('structure', 'rhs_apron', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>LHS Apron</label>
                <input
                  type="text"
                  value={formData.structure.lhs_apron}
                  onChange={(e) => handleInputChange('structure', 'lhs_apron', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>A Pillar RHS</label>
                <input
                  type="text"
                  value={formData.structure.a_pillar_rhs}
                  onChange={(e) => handleInputChange('structure', 'a_pillar_rhs', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>A Pillar LHS</label>
                <input
                  type="text"
                  value={formData.structure.a_pillar_lhs}
                  onChange={(e) => handleInputChange('structure', 'a_pillar_lhs', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>B Pillar RHS</label>
                <input
                  type="text"
                  value={formData.structure.b_pillar_rhs}
                  onChange={(e) => handleInputChange('structure', 'b_pillar_rhs', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>B Pillar LHS</label>
                <input
                  type="text"
                  value={formData.structure.b_pillar_lhs}
                  onChange={(e) => handleInputChange('structure', 'b_pillar_lhs', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>C Pillar RHS</label>
                <input
                  type="text"
                  value={formData.structure.c_pillar_rhs}
                  onChange={(e) => handleInputChange('structure', 'c_pillar_rhs', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>C Pillar LHS</label>
                <input
                  type="text"
                  value={formData.structure.c_pillar_lhs}
                  onChange={(e) => handleInputChange('structure', 'c_pillar_lhs', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Fender Wall RHS</label>
                <input
                  type="text"
                  value={formData.structure.fender_wall_rhs}
                  onChange={(e) => handleInputChange('structure', 'fender_wall_rhs', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Fender Wall LHS</label>
                <input
                  type="text"
                  value={formData.structure.fender_wall_lhs}
                  onChange={(e) => handleInputChange('structure', 'fender_wall_lhs', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Tailgate Frame</label>
                <input
                  type="text"
                  value={formData.structure.tailgate_frame}
                  onChange={(e) => handleInputChange('structure', 'tailgate_frame', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Dicky Tub</label>
                <input
                  type="text"
                  value={formData.structure.dicky_tub}
                  onChange={(e) => handleInputChange('structure', 'dicky_tub', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 13: Performance */}
        {currentSection === 13 && (
          <div className="form-section">
            <h2 className="section-title">Performance Test Drive</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Steering</label>
                <input
                  type="text"
                  value={formData.performance.steering}
                  onChange={(e) => handleInputChange('performance', 'steering', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Smooth and responsive"
                />
              </div>
              <div className="form-group">
                <label>Alignment</label>
                <input
                  type="text"
                  value={formData.performance.alignment}
                  onChange={(e) => handleInputChange('performance', 'alignment', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Ignition</label>
                <input
                  type="text"
                  value={formData.performance.ignition}
                  onChange={(e) => handleInputChange('performance', 'ignition', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Clutch</label>
                <input
                  type="text"
                  value={formData.performance.clutch}
                  onChange={(e) => handleInputChange('performance', 'clutch', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Brakes</label>
                <input
                  type="text"
                  value={formData.performance.brakes}
                  onChange={(e) => handleInputChange('performance', 'brakes', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Gear Shift</label>
                <input
                  type="text"
                  value={formData.performance.gear_shift}
                  onChange={(e) => handleInputChange('performance', 'gear_shift', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Acceleration</label>
                <input
                  type="text"
                  value={formData.performance.acceleration}
                  onChange={(e) => handleInputChange('performance', 'acceleration', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>CNG Mode</label>
                <input
                  type="text"
                  value={formData.performance.cng_mode}
                  onChange={(e) => handleInputChange('performance', 'cng_mode', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Suspension</label>
                <input
                  type="text"
                  value={formData.performance.suspension}
                  onChange={(e) => handleInputChange('performance', 'suspension', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Engine Noise</label>
                <input
                  type="text"
                  value={formData.performance.engine_noise}
                  onChange={(e) => handleInputChange('performance', 'engine_noise', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Wheel Alignment</label>
                <input
                  type="text"
                  value={formData.performance.wheel_alignment}
                  onChange={(e) => handleInputChange('performance', 'wheel_alignment', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Estimated Repair Cost</label>
                <input
                  type="text"
                  value={formData.performance.estimated_repair_cost}
                  onChange={(e) => handleInputChange('performance', 'estimated_repair_cost', e.target.value)}
                  className="form-input"
                  placeholder="e.g., ₹0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 14: Images */}
        {currentSection === 14 && (
          <div className="form-section">
            <h2 className="section-title">Inspection Images</h2>
            <p className="section-note">📸 Capture images using your camera, choose from gallery, or enter image URLs. Images will be displayed in the final report.</p>
            <div className="image-upload-grid">
              <ImageUploadField
                label="RHS Apron Image"
                value={formData.images.rhs_apron}
                onChange={(value) => handleInputChange('images', 'rhs_apron', value)}
                fieldName="rhs_apron"
              />
              <ImageUploadField
                label="LHS Apron Image"
                value={formData.images.lhs_apron}
                onChange={(value) => handleInputChange('images', 'lhs_apron', value)}
                fieldName="lhs_apron"
              />
              <ImageUploadField
                label="Chassis Plate Image"
                value={formData.images.chassis_plate}
                onChange={(value) => handleInputChange('images', 'chassis_plate', value)}
                fieldName="chassis_plate"
              />
              <ImageUploadField
                label="CNG Plate Image"
                value={formData.images.cng_plate}
                onChange={(value) => handleInputChange('images', 'cng_plate', value)}
                fieldName="cng_plate"
              />
              <ImageUploadField
                label="Vehicle Front View"
                value={formData.images.vehicle_front}
                onChange={(value) => handleInputChange('images', 'vehicle_front', value)}
                fieldName="vehicle_front"
              />
              <ImageUploadField
                label="Vehicle RHS View"
                value={formData.images.vehicle_rhs}
                onChange={(value) => handleInputChange('images', 'vehicle_rhs', value)}
                fieldName="vehicle_rhs"
              />
              <ImageUploadField
                label="Vehicle LHS View"
                value={formData.images.vehicle_lhs}
                onChange={(value) => handleInputChange('images', 'vehicle_lhs', value)}
                fieldName="vehicle_lhs"
              />
              <ImageUploadField
                label="Vehicle Rear View"
                value={formData.images.vehicle_rear}
                onChange={(value) => handleInputChange('images', 'vehicle_rear', value)}
                fieldName="vehicle_rear"
              />
              <ImageUploadField
                label="Dashboard"
                value={formData.images.dashboard}
                onChange={(value) => handleInputChange('images', 'dashboard', value)}
                fieldName="dashboard"
              />
              <ImageUploadField
                label="Cluster Meter"
                value={formData.images.cluster_meter}
                onChange={(value) => handleInputChange('images', 'cluster_meter', value)}
                fieldName="cluster_meter"
              />
              <ImageUploadField
                label="Driver Cabin"
                value={formData.images.driver_cabin}
                onChange={(value) => handleInputChange('images', 'driver_cabin', value)}
                fieldName="driver_cabin"
              />
              <ImageUploadField
                label="Rear Cabin"
                value={formData.images.rear_cabin}
                onChange={(value) => handleInputChange('images', 'rear_cabin', value)}
                fieldName="rear_cabin"
              />
              <ImageUploadField
                label="Boot Space"
                value={formData.images.boot_space}
                onChange={(value) => handleInputChange('images', 'boot_space', value)}
                fieldName="boot_space"
              />
              <ImageUploadField
                label="Engine Compartment"
                value={formData.images.engine_compartment}
                onChange={(value) => handleInputChange('images', 'engine_compartment', value)}
                fieldName="engine_compartment"
              />
              <ImageUploadField
                label="Firewall"
                value={formData.images.firewall}
                onChange={(value) => handleInputChange('images', 'firewall', value)}
                fieldName="firewall"
              />
              <ImageUploadField
                label="Battery"
                value={formData.images.battery}
                onChange={(value) => handleInputChange('images', 'battery', value)}
                fieldName="battery"
              />
              <ImageUploadField
                label="RHS Front Tyre"
                value={formData.images.tyre_rhs_front}
                onChange={(value) => handleInputChange('images', 'tyre_rhs_front', value)}
                fieldName="tyre_rhs_front"
              />
              <ImageUploadField
                label="RHS Rear Tyre"
                value={formData.images.tyre_rhs_rear}
                onChange={(value) => handleInputChange('images', 'tyre_rhs_rear', value)}
                fieldName="tyre_rhs_rear"
              />
              <ImageUploadField
                label="LHS Front Tyre"
                value={formData.images.tyre_lhs_front}
                onChange={(value) => handleInputChange('images', 'tyre_lhs_front', value)}
                fieldName="tyre_lhs_front"
              />
              <ImageUploadField
                label="LHS Rear Tyre"
                value={formData.images.tyre_lhs_rear}
                onChange={(value) => handleInputChange('images', 'tyre_lhs_rear', value)}
                fieldName="tyre_lhs_rear"
              />
              <ImageUploadField
                label="Spare Tyre"
                value={formData.images.spare_tyre}
                onChange={(value) => handleInputChange('images', 'spare_tyre', value)}
                fieldName="spare_tyre"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="form-navigation">
        <button
          onClick={handlePrevious}
          disabled={currentSection === 0}
          className="btn-nav"
        >
          <ChevronLeft size={20} />
          Previous
        </button>
        <span className="section-indicator">
          {currentSection + 1} / {sections.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentSection === sections.length - 1}
          className="btn-nav"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
