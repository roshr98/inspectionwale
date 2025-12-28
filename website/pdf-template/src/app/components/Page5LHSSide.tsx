import React from 'react';
import { InspectionPage } from './InspectionPage';
import { getInspectionData } from '../../utils/dataLoader';

export function Page5LHSSide() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={5}>
      <h2 className="section-header">Vehicle LHS Image</h2>

      <div className="image-detail-layout">
        {/* Left: Large Image */}
        <div className="large-image-container">
          <img src={data.images.vehicle_lhs} alt="LHS View" className="inspection-image-large" />
        </div>

        {/* Right: Detail Card */}
        <div className="detail-card compact-card">
          <div className="detail-item-compact">
            <span className="detail-label">LHS Fender Condition</span>
            <span className="detail-value">{data.lhs.fender_condition}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">LHS Fender Repainted?</span>
            <span className="detail-value">{data.lhs.fender_repainted}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">LHS Fender Paint Depth</span>
            <span className="detail-value">{data.lhs.fender_paint_depth}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">LHS Front Door Condition</span>
            <span className="detail-value">{data.lhs.front_door_condition}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">LHS Front Door Repainted?</span>
            <span className="detail-value">{data.lhs.front_door_repainted}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">LHS Front Door Paint Depth</span>
            <span className="detail-value">{data.lhs.front_door_paint_depth}</span>
          </div>
        </div>
      </div>

      {/* Below Image - Full Width Details */}
      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">LHS Front Door Company Fitted?</span>
            <span className="detail-value">{data.lhs.front_door_company_fitted}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Rear Door Condition</span>
            <span className="detail-value">{data.lhs.rear_door_condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Is LHS Rear Door Repainted?</span>
            <span className="detail-value">{data.lhs.rear_door_repainted}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Rear Door Paint Depth</span>
            <span className="detail-value">{data.lhs.rear_door_paint_depth}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Rear Door Company Fitted?</span>
            <span className="detail-value">{data.lhs.rear_door_company_fitted}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Quarter Panel Condition</span>
            <span className="detail-value">{data.lhs.quarter_panel_condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Is LHS Quarter Panel Repainted?</span>
            <span className="detail-value">{data.lhs.quarter_panel_repainted}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Quarter Panel Paint Depth</span>
            <span className="detail-value">{data.lhs.quarter_panel_paint_depth}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Door Glass Original?</span>
            <span className="detail-value">{data.lhs.window_glass_original}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Side Mirror Condition</span>
            <span className="detail-value">{data.lhs.side_mirror_condition}</span>
          </div>
        </div>
      </div>
    </InspectionPage>
  );
}