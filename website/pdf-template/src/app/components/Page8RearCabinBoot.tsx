import React from 'react';
import { InspectionPage } from './InspectionPage';
import { CheckCircle, XCircle } from 'lucide-react';
import { getInspectionData } from '../../utils/dataLoader';

export function Page8RearCabinBoot() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={8}>
      {/* Driver Cabin Section - Moved from Page 7 and Enlarged */}
      <h2 className="section-header-bilingual">Driver Cabin Inspection / ड्राइवर केबिन निरीक्षण</h2>

      <div className="image-card-extra-large">
        <img src={data.images.driver_cabin} alt="Driver Cabin" className="inspection-image-extra-large" />
        <div className="image-label">Driver Cabin Image / ड्राइवर केबिन छवि</div>
      </div>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Front Seat Condition / फ्रंट सीट स्थिति</span>
            <span className="detail-value">{data.seats.front_condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Seat Adjustment Type / सीट एडजस्टमेंट प्रकार</span>
            <span className="detail-value">{data.seats.adjustment_type}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Seat Belts / सीट बेल्ट</span>
            <span className="detail-value">{data.seats.seat_belts}</span>
          </div>
        </div>
      </div>

      <h2 className="section-header-bilingual">Rear Cabin Inspection / पिछली केबिन निरीक्षण</h2>

      {/* Rear Cabin Details */}
      <div className="detail-card">
        <h3 className="card-title">Rear Cabin / पिछली केबिन</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Rear Seat Condition / पिछली सीट स्थिति</span>
            <span className="detail-value">{data.rear_seats.condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Arm Rest / आर्म रेस्ट</span>
            <span className="detail-value">{data.rear_seats.arm_rest}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Rear AC Vent / पिछला एसी वेंट</span>
            <span className="detail-value">{data.rear_seats.ac_vent}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RHS Interior Panel / दाहिना आंतरिक पैनल</span>
            <span className="detail-value">{data.rear_seats.rhs_panel}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Interior Panel / बायां आंतरिक पैनल</span>
            <span className="detail-value">{data.rear_seats.lhs_panel}</span>
          </div>
        </div>
      </div>

      {/* Boot Section */}
      <h2 className="section-header-bilingual">Boot Inspection / बूट निरीक्षण</h2>

      <div className="image-card-large">
        <img src={data.images.boot_space} alt="Boot" className="inspection-image-large-boot" />
        <div className="image-label">Boot Image / बूट छवि</div>
      </div>

      <div className="detail-card">
        <div className="icon-detail-list">
          <div className="icon-detail-item">
            {data.boot.condition === 'Working' || data.boot.condition === 'Yes' ? (
              <CheckCircle className="check-icon-small" />
            ) : (
              <XCircle className="x-icon-small" />
            )}
            <span className="icon-detail-label">Boot Condition / बूट स्थिति</span>
            <span className="icon-detail-value">{data.boot.condition}</span>
          </div>
          <div className="icon-detail-item">
            {data.boot.jack_available === 'Working' || data.boot.jack_available === 'Yes' ? (
              <CheckCircle className="check-icon-small" />
            ) : (
              <XCircle className="x-icon-small" />
            )}
            <span className="icon-detail-label">Jack & Tool Kit / जैक और टूल किट</span>
            <span className="icon-detail-value">{data.boot.jack_available}</span>
          </div>
        </div>
      </div>

      {/* Interior Comments */}
      <div className="detail-card">
        <h3 className="card-title">Interior Comments / आंतरिक टिप्पणियाँ</h3>
        <div className="comment-box">
          <p>{data.comments.interior_additional}</p>
        </div>
      </div>
    </InspectionPage>
  );
}
