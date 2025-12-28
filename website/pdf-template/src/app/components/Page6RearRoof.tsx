import React from 'react';
import { InspectionPage } from './InspectionPage';
import { getInspectionData } from '../../utils/dataLoader';

export function Page6RearRoof() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={6}>
      <h2 className="section-header-bilingual">Vehicle Rear Image / वाहन पिछला दृश्य</h2>

      <div className="image-detail-layout">
        {/* Left: Large Image */}
        <div className="large-image-container">
          <img src={data.images.vehicle_rear} alt="Rear View" className="inspection-image-large" />
        </div>

        {/* Right: Detail Card */}
        <div className="detail-card compact-card">
          <div className="detail-item-compact">
            <span className="detail-label">Rear Bumper Condition / रियर बंपर स्थिति</span>
            <span className="detail-value">{data.rear.bumper_condition}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">Is Rear Bumper Repainted? / क्या रियर बंपर दोबारा रंगा गया?</span>
            <span className="detail-value">{data.rear.bumper_repainted}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">Rear Bumper Paint Depth / रियर बंपर पेंट गहराई</span>
            <span className="detail-value">{data.rear.bumper_paint_depth}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">Rear Windshield Condition / रियर विंडशील्ड स्थिति</span>
            <span className="detail-value">{data.rear.windshield_condition}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">Rear Windshield Original / रियर विंडशील्ड मूल</span>
            <span className="detail-value">{data.rear.windshield_original}</span>
          </div>
          <div className="detail-item-compact">
            <span className="detail-label">Tail Gate Condition / टेल गेट स्थिति</span>
            <span className="detail-value">{data.rear.tailgate_condition}</span>
          </div>
        </div>
      </div>

      {/* Below Image - Full Width Details */}
      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Tail Gate Paint Depth / टेल गेट पेंट गहराई</span>
            <span className="detail-value">{data.rear.tailgate_paint_depth}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Is Tail Gate Repainted? / क्या टेल गेट दोबारा रंगा गया?</span>
            <span className="detail-value">{data.rear.tailgate_repainted}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Tail Lights Condition / टेल लाइट्स स्थिति</span>
            <span className="detail-value">{data.rear.tail_lights_condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Roof Condition / छत की स्थिति</span>
            <span className="detail-value">{data.roof.condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Roof Type / छत का प्रकार</span>
            <span className="detail-value">{data.roof.type}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Roof Paint Depth / छत पेंट गहराई</span>
            <span className="detail-value">{data.roof.paint_depth}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Is Roof Repainted? / क्या छत दोबारा रंगी गई?</span>
            <span className="detail-value">{data.roof.repainted}</span>
          </div>
        </div>
      </div>
    </InspectionPage>
  );
}
