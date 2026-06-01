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
          <span className="info-key">Inspection ID / निरीक्षण आईडी:</span>
          <span className="info-val">{data.inspection.id}</span>
        </div>
        <div className="info-row">
          <span className="info-key">Inspection Date / निरीक्षण तिथि:</span>
          <span className="info-val">{data.inspection.date}</span>
        </div>
        <div className="info-row">
          <span className="info-key">Inspection Location / निरीक्षण स्थान:</span>
          <span className="info-val">{data.inspection.location}</span>
        </div>
        <div className="info-row">
          <span className="info-key">Inspector Name / निरीक्षक का नाम:</span>
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
            <span className="detail-label">Vehicle Number / वाहन संख्या</span>
            <span className="detail-value">{data.vehicle.registration_number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Manufacturing Date / निर्माण तिथि</span>
            <span className="detail-value">{data.vehicle.manufacturing_date}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Chassis Number / चेसिस नंबर</span>
            <span className="detail-value">{data.vehicle.chassis_number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Engine Number / इंजन नंबर</span>
            <span className="detail-value">{data.vehicle.engine_number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Registration Date / पंजीकरण तिथि</span>
            <span className="detail-value">{data.vehicle.registration_date}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Insurance Validity / बीमा वैधता</span>
            <span className="detail-value">{data.vehicle.insurance_validity}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Owner Name (RC) / मालिक का नाम (आरसी)</span>
            <span className="detail-value">{data.vehicle.owner_name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Make / Model / ब्रांड / मॉडल</span>
            <span className="detail-value">{data.vehicle.make_model}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Variant / वेरिएंट</span>
            <span className="detail-value">{data.vehicle.variant}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fuel Type / ईंधन प्रकार</span>
            <span className="detail-value">{data.vehicle.fuel_type}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Number of Owners / मालिकों की संख्या</span>
            <span className="detail-value">{data.vehicle.owner_count}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RC Type / आरसी प्रकार</span>
            <span className="detail-value">{data.vehicle.rc_type}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Hypothecation / हाइपोथिकेशन</span>
            <span className="detail-value">{data.vehicle.hypothecation}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CNG Fitment / सीएनजी फिटमेंट</span>
            <span className="detail-value">{data.vehicle.cng.present}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CNG Type / सीएनजी प्रकार</span>
            <span className="detail-value">{data.vehicle.cng.type}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CNG Validity Date / सीएनजी वैधता तिथि</span>
            <span className="detail-value">{data.vehicle.cng.validity}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CNG Endorsed on RC / आरसी पर सीएनजी समर्थन</span>
            <span className="detail-value">{data.vehicle.cng.endorsed}</span>
          </div>
        </div>
      </div>

      {/* Ratings Section */}
      <h2 className="section-header-bilingual">Ratings / रेटिंग</h2>
      <div className="ratings-card">
        <div className="rating-item">
          <span className="rating-label">Interior / आंतरिक</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={star <= Number(data.ratings.interior) ? 'star-filled' : 'star-empty'} />
            ))}
          </div>
        </div>
        <div className="rating-item">
          <span className="rating-label">Exterior / बाहरी</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={star <= Number(data.ratings.exterior) ? 'star-filled' : 'star-empty'} />
            ))}
          </div>
        </div>
        <div className="rating-item">
          <span className="rating-label">Engine / इंजन</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={star <= Number(data.ratings.engine) ? 'star-filled' : 'star-empty'} />
            ))}
          </div>
        </div>
        <div className="rating-item">
          <span className="rating-label">Test Drive / परीक्षण ड्राइव</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={star <= Number(data.ratings.test_drive) ? 'star-filled' : 'star-empty'} />
            ))}
          </div>
        </div>
        <div className="rating-item">
          <span className="rating-label">Structure / संरचना</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={star <= Number(data.ratings.structure) ? 'star-filled' : 'star-empty'} />
            ))}
          </div>
        </div>
        <div className="rating-item">
          <span className="rating-label">Electrical / विद्युत</span>
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