import React from 'react';
import { InspectionPage } from './InspectionPage';
import { Star } from 'lucide-react';
import { getInspectionData } from '../../utils/dataLoader';

export function Page1Header() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={1}>
      {/* Report Title */}
      <div className="report-header-section">
        <h1 className="report-main-title">{data.report.title}</h1>
        <p className="report-tagline">{data.report.tagline}</p>
        <p className="report-features">{data.report.subtagline}</p>
      </div>

      {/* Inspection Info */}
      <div className="inspection-info-box">
        <div className="info-row">
          <span className="info-key">Inspection ID:</span>
          <span className="info-val">{data.inspection.id}</span>
        </div>
        <div className="info-row">
          <span className="info-key">Inspection Date:</span>
          <span className="info-val">{data.inspection.date}</span>
        </div>
        <div className="info-row">
          <span className="info-key">Inspection Location:</span>
          <span className="info-val">{data.inspection.location}</span>
        </div>
        <div className="info-row">
          <span className="info-key">Inspector Name:</span>
          <span className="info-val">{data.inspection.inspector_name}</span>
        </div>
      </div>

      {/* Section Header */}
      <h2 className="section-header-bilingual">
        Vehicle Registration Details / वाहन पंजीकरण विवरण
      </h2>

      {/* Vehicle Details Card */}
      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Vehicle Number</span>
            <span className="detail-value">{data.vehicle.registration_number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Manufacturing Date</span>
            <span className="detail-value">{data.vehicle.manufacturing_date}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Chassis Number</span>
            <span className="detail-value">{data.vehicle.chassis_number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Engine Number</span>
            <span className="detail-value">{data.vehicle.engine_number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Registration Date</span>
            <span className="detail-value">{data.vehicle.registration_date}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Insurance Validity</span>
            <span className="detail-value">{data.vehicle.insurance_validity}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Owner Name (RC)</span>
            <span className="detail-value">{data.vehicle.owner_name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Make / Model</span>
            <span className="detail-value">{data.vehicle.make_model}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Variant</span>
            <span className="detail-value">{data.vehicle.variant}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fuel Type</span>
            <span className="detail-value">{data.vehicle.fuel_type}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Number of Owners</span>
            <span className="detail-value">{data.vehicle.owner_count}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RC Type</span>
            <span className="detail-value">{data.vehicle.rc_type}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Hypothecation</span>
            <span className="detail-value">{data.vehicle.hypothecation}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CNG Fitment</span>
            <span className="detail-value">{data.vehicle.cng.present}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CNG Type</span>
            <span className="detail-value">{data.vehicle.cng.type}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CNG Validity Date</span>
            <span className="detail-value">{data.vehicle.cng.validity}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CNG Endorsed on RC</span>
            <span className="detail-value">{data.vehicle.cng.endorsed}</span>
          </div>
        </div>
      </div>

      {/* Ratings Section */}
      <h2 className="section-header">Ratings</h2>
      <div className="ratings-card">
        <div className="rating-item">
          <span className="rating-label">Interior</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={star <= Number(data.ratings.interior) ? 'star-filled' : 'star-empty'} />
            ))}
          </div>
        </div>
        <div className="rating-item">
          <span className="rating-label">Exterior</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={star <= Number(data.ratings.exterior) ? 'star-filled' : 'star-empty'} />
            ))}
          </div>
        </div>
        <div className="rating-item">
          <span className="rating-label">Engine</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={star <= Number(data.ratings.engine) ? 'star-filled' : 'star-empty'} />
            ))}
          </div>
        </div>
        <div className="rating-item">
          <span className="rating-label">Test Drive</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={star <= Number(data.ratings.test_drive) ? 'star-filled' : 'star-empty'} />
            ))}
          </div>
        </div>
        <div className="rating-item">
          <span className="rating-label">Structure</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={star <= Number(data.ratings.structure) ? 'star-filled' : 'star-empty'} />
            ))}
          </div>
        </div>
        <div className="rating-item">
          <span className="rating-label">Electrical</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={star <= Number(data.ratings.electrical) ? 'star-filled' : 'star-empty'} />
            ))}
          </div>
        </div>
      </div>
    </InspectionPage>
  );
}