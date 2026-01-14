import React from 'react';
import { InspectionPage } from './InspectionPage';
import { getInspectionData } from '../../utils/dataLoader';

export function Page8RearCabinBoot() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={8}>
      {/* Driver Cabin Section */}
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

      {/* Rear Cabin Section with Image */}
      <h2 className="section-header-bilingual">Rear Cabin Inspection / पिछली केबिन निरीक्षण</h2>

      <div className="image-card-extra-large">
        <img src={data.images.rear_cabin} alt="Rear Cabin" className="inspection-image-extra-large" />
        <div className="image-label">Rear Cabin Image / पिछली केबिन छवि</div>
      </div>

      <div className="detail-card">
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
    </InspectionPage>
  );
}
