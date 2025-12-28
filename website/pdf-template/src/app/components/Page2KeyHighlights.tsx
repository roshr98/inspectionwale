import React from 'react';
import { InspectionPage } from './InspectionPage';
import { CheckCircle, XCircle } from 'lucide-react';
import { getInspectionData } from '../../utils/dataLoader';

export function Page2KeyHighlights() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={2}>
      <h2 className="section-header">Key Highlights</h2>

      <div className="two-column-cards">
        {/* Inspection Flags Card */}
        <div className="detail-card">
          <h3 className="card-title">Inspection Flags</h3>
          <div className="flag-list">
            <div className="flag-item">
              {data.flags.accidental === 'Yes' ? (
                <CheckCircle className="flag-icon flag-yes" />
              ) : (
                <XCircle className="flag-icon flag-no" />
              )}
              <span className="flag-label">Is Car Accidental?</span>
              <span className="flag-value">{data.flags.accidental}</span>
            </div>
            <div className="flag-item">
              {data.flags.flood_damage === 'Yes' ? (
                <CheckCircle className="flag-icon flag-yes" />
              ) : (
                <XCircle className="flag-icon flag-no" />
              )}
              <span className="flag-label">Flood Damage</span>
              <span className="flag-value">{data.flags.flood_damage}</span>
            </div>
            <div className="flag-item">
              {data.flags.fire_damage === 'Yes' ? (
                <CheckCircle className="flag-icon flag-yes" />
              ) : (
                <XCircle className="flag-icon flag-no" />
              )}
              <span className="flag-label">Fire Damage</span>
              <span className="flag-value">{data.flags.fire_damage}</span>
            </div>
            <div className="flag-item">
              {data.flags.rc_chassis_match === 'Yes' ? (
                <CheckCircle className="flag-icon flag-yes" />
              ) : (
                <XCircle className="flag-icon flag-no" />
              )}
              <span className="flag-label">RC & Chassis Match</span>
              <span className="flag-value">{data.flags.rc_chassis_match}</span>
            </div>
            <div className="flag-item">
              {data.flags.service_logs_available === 'Yes' ? (
                <CheckCircle className="flag-icon flag-yes" />
              ) : (
                <XCircle className="flag-icon flag-no" />
              )}
              <span className="flag-label">Service Logs Available</span>
              <span className="flag-value">{data.flags.service_logs_available}</span>
            </div>
          </div>
        </div>

        {/* Additional Comments Card */}
        <div className="detail-card">
          <h3 className="card-title">Additional Comments</h3>
          <div className="comment-list">
            <div className="comment-item">
              <span className="comment-label">Engine</span>
              <span className="comment-text">{data.comments.engine}</span>
            </div>
            <div className="comment-item">
              <span className="comment-label">Structure</span>
              <span className="comment-text">{data.comments.structure}</span>
            </div>
            <div className="comment-item">
              <span className="comment-label">Test Drive</span>
              <span className="comment-text">{data.comments.test_drive}</span>
            </div>
            <div className="comment-item">
              <span className="comment-label">Exterior</span>
              <span className="comment-text">{data.comments.exterior}</span>
            </div>
            <div className="comment-item">
              <span className="comment-label">Interior</span>
              <span className="comment-text">{data.comments.interior}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Row */}
      <div className="image-row-equal">
        <div className="image-card-equal">
          <img src={data.images.rhs_apron} alt="RHS Apron" className="inspection-image" />
          <div className="image-label">RHS Apron Image</div>
        </div>
        <div className="image-card-equal">
          <img src={data.images.lhs_apron} alt="LHS Apron" className="inspection-image" />
          <div className="image-label">LHS Apron Image</div>
        </div>
        <div className="image-card-equal">
          <img src={data.images.chassis_plate} alt="Chassis Plate" className="inspection-image" />
          <div className="image-label">Chassis Plate Image</div>
        </div>
        <div className="image-card-equal">
          <img src={data.images.cng_plate} alt="CNG Plate" className="inspection-image" />
          <div className="image-label">CNG Plate Image</div>
        </div>
      </div>
    </InspectionPage>
  );
}
