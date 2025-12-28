import React from 'react';
import { InspectionPage } from './InspectionPage';
import { getInspectionData } from '../../utils/dataLoader';

export function Page3FrontView() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={3}>
      <h2 className="section-header">Vehicle Front Image</h2>

      <div className="image-detail-layout">
        {/* Left: Large Image */}
        <div className="large-image-container">
          <img src={data.images.vehicle_front} alt="Front View" className="inspection-image-large" />
        </div>

        {/* Right: Detail Card */}
        <div className="detail-card compact-card">
          <div className="detail-item-compact">
            <span className="detail-label">Front Bumper Condition</span>
            <span className="detail-value">{data.front.bumper_condition}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">Paint Depth Reading</span>
            <span className="detail-value">{data.front.bumper_paint_depth}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">Is Front Bumper Repainted?</span>
            <span className="detail-value">{data.front.bumper_repainted}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">Bonnet Condition</span>
            <span className="detail-value">{data.front.bonnet_condition}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">Bonnet Paint Depth</span>
            <span className="detail-value">{data.front.bonnet_paint_depth}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">Is Bonnet Repainted?</span>
            <span className="detail-value">{data.front.bonnet_repainted}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">Is Bonnet Company Fitted?</span>
            <span className="detail-value">{data.front.bonnet_company_fitted}</span>
          </div>
        </div>
      </div>

      {/* Below Image - Full Width Details */}
      <div className="detail-card">
        <div className="detail-grid-four">
          <div className="detail-item">
            <span className="detail-label">Front Grille Condition</span>
            <span className="detail-value">{data.front.grill_condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Windshield Original</span>
            <span className="detail-value">{data.front.windshield_original}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Windshield Condition</span>
            <span className="detail-value">{data.front.windshield_condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Headlight Condition</span>
            <span className="detail-value">{data.front.headlight_condition}</span>
          </div>
        </div>
      </div>
    </InspectionPage>
  );
}
