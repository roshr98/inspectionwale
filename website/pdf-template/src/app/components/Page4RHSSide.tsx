import React from 'react';
import { InspectionPage } from './InspectionPage';
import { getInspectionData } from '../../utils/dataLoader';

export function Page4RHSSide() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={4}>
      <h2 className="section-header-bilingual">Vehicle RHS Image / वाहन दाहिनी ओर का दृश्य</h2>

      <div className="image-detail-layout">
        {/* Left: Large Image */}
        <div className="large-image-container">
          <img src={data.images.vehicle_rhs} alt="RHS View" className="inspection-image-large" />
        </div>

        {/* Right: Detail Card */}
        <div className="detail-card compact-card">
          <div className="detail-item-compact">
            <span className="detail-label">RHS Fender Condition / दाहिना फेंडर स्थिति</span>
            <span className="detail-value">{data.rhs.fender_condition}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">Is RHS Fender Repainted? / क्या दाहिना फेंडर दोबारा रंगा गया?</span>
            <span className="detail-value">{data.rhs.fender_repainted}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">RHS Fender Paint Depth / दाहिना फेंडर पेंट गहराई</span>
            <span className="detail-value">{data.rhs.fender_paint_depth}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">RHS Front Door Condition / दाहिना फ्रंट डोर स्थिति</span>
            <span className="detail-value">{data.rhs.front_door_condition}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">Is RHS Front Door Repainted? / क्या दाहिना फ्रंट डोर दोबारा रंगा गया?</span>
            <span className="detail-value">{data.rhs.front_door_repainted}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">RHS Front Door Paint Depth / दाहिना फ्रंट डोर पेंट गहराई</span>
            <span className="detail-value">{data.rhs.front_door_paint_depth}</span>
          </div>
        </div>
      </div>

      {/* Below Image - Full Width Details */}
      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">RHS Quarter Panel Condition / दाहिना क्वार्टर पैनल स्थिति</span>
            <span className="detail-value">{data.rhs.quarter_panel_condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Is RHS Quarter Panel Repainted? / क्या दाहिना क्वार्टर पैनल दोबारा रंगा गया?</span>
            <span className="detail-value">{data.rhs.quarter_panel_repainted}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RHS Quarter Panel Paint Depth / दाहिना क्वार्टर पैनल पेंट गहराई</span>
            <span className="detail-value">{data.rhs.quarter_panel_paint_depth}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RHS Door Glass Original / दाहिना डोर ग्लास मूल</span>
            <span className="detail-value">{data.rhs.window_glass_original}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RHS Side Mirror Condition / दाहिना साइड मिरर स्थिति</span>
            <span className="detail-value">{data.rhs.side_mirror_condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RHS Rear Door Condition / दाहिना रियर डोर स्थिति</span>
            <span className="detail-value">{data.rhs.rear_door_condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Is RHS Rear Door Repainted? / क्या दाहिना रियर डोर दोबारा रंगा गया?</span>
            <span className="detail-value">{data.rhs.rear_door_repainted}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RHS Rear Door Paint Depth / दाहिना रियर डोर पेंट गहराई</span>
            <span className="detail-value">{data.rhs.rear_door_paint_depth}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RHS Front Door Company Fitted / दाहिना फ्रंट डोर कंपनी फिटेड</span>
            <span className="detail-value">{data.rhs.front_door_company_fitted}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RHS Rear Door Company Fitted / दाहिना रियर डोर कंपनी फिटेड</span>
            <span className="detail-value">{data.rhs.rear_door_company_fitted}</span>
          </div>
        </div>
      </div>
    </InspectionPage>
  );
}
