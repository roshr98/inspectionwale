import React from 'react';
import { InspectionPage } from './InspectionPage';
import { CheckCircle, XCircle } from 'lucide-react';
import { getInspectionData } from '../../utils/dataLoader';

export function Page9Boot() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={9}>
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

      {/* Engine Section - Header and Images Only */}
      <h2 className="section-header-bilingual">Engine Inspection / इंजन निरीक्षण</h2>

      <div className="image-row-three">
        <div className="image-card-third">
          <img src={data.images.engine_compartment} alt="Engine Compartment" className="inspection-image" />
          <div className="image-label">Engine Compartment / इंजन कम्पार्टमेंट</div>
        </div>
        <div className="image-card-third">
          <img src={data.images.firewall} alt="Firewall" className="inspection-image" />
          <div className="image-label">Firewall / फ़ायरवॉल</div>
        </div>
        <div className="image-card-third">
          <img src={data.images.battery} alt="Battery" className="inspection-image" />
          <div className="image-label">Battery / बैटरी</div>
        </div>
      </div>
    </InspectionPage>
  );
}
