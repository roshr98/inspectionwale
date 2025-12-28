import React from 'react';
import { InspectionPage } from './InspectionPage';
import { CheckCircle, XCircle } from 'lucide-react';
import { getInspectionData } from '../../utils/dataLoader';

export function Page8RearCabinBoot() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={8}>
      <h2 className="section-header">Rear Cabin Inspection</h2>

      {/* Rear Cabin Details */}
      <div className="detail-card">
        <h3 className="card-title">Rear Cabin</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Rear Seat Condition</span>
            <span className="detail-value">{data.rear_seats.condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Arm Rest</span>
            <span className="detail-value">{data.rear_seats.arm_rest}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Rear AC Vent</span>
            <span className="detail-value">{data.rear_seats.ac_vent}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RHS Interior Panel</span>
            <span className="detail-value">{data.rear_seats.rhs_panel}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Interior Panel</span>
            <span className="detail-value">{data.rear_seats.lhs_panel}</span>
          </div>
        </div>
      </div>

      {/* Boot Section */}
      <h2 className="section-header">Boot Inspection</h2>

      <div className="image-card-full">
        <img src={data.images.boot_space} alt="Boot" className="inspection-image" />
        <div className="image-label">Boot Image</div>
      </div>

      <div className="detail-card">
        <div className="icon-detail-list">
          <div className="icon-detail-item">
            {data.boot.condition === 'Working' || data.boot.condition === 'Yes' ? (
              <CheckCircle className="check-icon-small" />
            ) : (
              <XCircle className="x-icon-small" />
            )}
            <span className="icon-detail-label">Boot Condition</span>
            <span className="icon-detail-value">{data.boot.condition}</span>
          </div>
          <div className="icon-detail-item">
            {data.boot.jack_available === 'Working' || data.boot.jack_available === 'Yes' ? (
              <CheckCircle className="check-icon-small" />
            ) : (
              <XCircle className="x-icon-small" />
            )}
            <span className="icon-detail-label">Jack & Tool Kit</span>
            <span className="icon-detail-value">{data.boot.jack_available}</span>
          </div>
        </div>
      </div>

      {/* Interior Comments */}
      <div className="detail-card">
        <h3 className="card-title">Interior Comments</h3>
        <div className="comment-box">
          <p>{data.comments.interior_additional}</p>
        </div>
      </div>
    </InspectionPage>
  );
}
