import React from 'react';
import { InspectionPage } from './InspectionPage';
import { getInspectionData } from '../../utils/dataLoader';

export function Page5LHSSide() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={5}>
      <h2 className="section-header-bilingual">Vehicle LHS Image / वाहन बायीं ओर का दृश्य</h2>

      <div className="image-detail-layout">
        {/* Left: Large Image */}
        <div className="large-image-container">
          <img src={data.images.vehicle_lhs} alt="LHS View" className="inspection-image-large" />
        </div>

        {/* Right: Detail Card */}
        <div className="detail-card compact-card">
          <div className="detail-item-compact">
            <span className="detail-label">LHS Fender Condition / बायां फेंडर स्थिति</span>
            <span className="detail-value">{data.lhs.fender_condition}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">LHS Fender Repainted? / क्या बायां फेंडर दोबारा रंगा गया?</span>
            <span className="detail-value">{data.lhs.fender_repainted}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">LHS Fender Paint Depth / बायां फेंडर पेंट गहराई</span>
            <span className="detail-value">{data.lhs.fender_paint_depth}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">LHS Front Door Condition / बायां फ्रंट डोर स्थिति</span>
            <span className="detail-value">{data.lhs.front_door_condition}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">LHS Front Door Repainted? / क्या बायां फ्रंट डोर दोबारा रंगा गया?</span>
            <span className="detail-value">{data.lhs.front_door_repainted}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">LHS Front Door Paint Depth / बायां फ्रंट डोर पेंट गहराई</span>
            <span className="detail-value">{data.lhs.front_door_paint_depth}</span>
          </div>
        </div>
      </div>

      {/* Below Image - Full Width Details */}
      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">LHS Front Door Company Fitted? / बायां फ्रंट डोर कंपनी फिटेड?</span>
            <span className="detail-value">{data.lhs.front_door_company_fitted}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Rear Door Condition / बायां रियर डोर स्थिति</span>
            <span className="detail-value">{data.lhs.rear_door_condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Is LHS Rear Door Repainted? / क्या बायां रियर डोर दोबारा रंगा गया?</span>
            <span className="detail-value">{data.lhs.rear_door_repainted}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Rear Door Paint Depth / बायां रियर डोर पेंट गहराई</span>
            <span className="detail-value">{data.lhs.rear_door_paint_depth}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Rear Door Company Fitted? / बायां रियर डोर कंपनी फिटेड?</span>
            <span className="detail-value">{data.lhs.rear_door_company_fitted}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Quarter Panel Condition / बायां क्वार्टर पैनल स्थिति</span>
            <span className="detail-value">{data.lhs.quarter_panel_condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Is LHS Quarter Panel Repainted? / क्या बायां क्वार्टर पैनल दोबारा रंगा गया?</span>
            <span className="detail-value">{data.lhs.quarter_panel_repainted}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Quarter Panel Paint Depth / बायां क्वार्टर पैनल पेंट गहराई</span>
            <span className="detail-value">{data.lhs.quarter_panel_paint_depth}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Door Glass Original? / बायां डोर ग्लास मूल?</span>
            <span className="detail-value">{data.lhs.window_glass_original}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Side Mirror Condition / बायां साइड मिरर स्थिति</span>
            <span className="detail-value">{data.lhs.side_mirror_condition}</span>
          </div>
        </div>
      </div>
    </InspectionPage>
  );
}
