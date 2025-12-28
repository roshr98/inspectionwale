import React from 'react';
import { InspectionPage } from './InspectionPage';
import { CheckCircle, XCircle } from 'lucide-react';
import { getInspectionData } from '../../utils/dataLoader';

export function Page2KeyHighlights() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={2}>
      <h2 className="section-header-bilingual">Key Highlights / मुख्य विशेषताएं</h2>

      <div className="two-column-cards">
        {/* Inspection Flags Card */}
        <div className="detail-card">
          <h3 className="card-title">Inspection Flags / निरीक्षण फ्लैग</h3>
          <div className="flag-list">
            <div className="flag-item">
              {data.flags.accidental === 'No' ? (
                <CheckCircle className="flag-icon flag-yes" />
              ) : (
                <XCircle className="flag-icon flag-no" />
              )}
              <span className="flag-label">Is Car Accidental? / क्या कार दुर्घटनाग्रस्त है?</span>
              <span className="flag-value">{data.flags.accidental}</span>
            </div>
            <div className="flag-item">
              {data.flags.flood_damage === 'No' ? (
                <CheckCircle className="flag-icon flag-yes" />
              ) : (
                <XCircle className="flag-icon flag-no" />
              )}
              <span className="flag-label">Flood Damage / बाढ़ क्षति</span>
              <span className="flag-value">{data.flags.flood_damage}</span>
            </div>
            <div className="flag-item">
              {data.flags.fire_damage === 'No' ? (
                <CheckCircle className="flag-icon flag-yes" />
              ) : (
                <XCircle className="flag-icon flag-no" />
              )}
              <span className="flag-label">Fire Damage / आग क्षति</span>
              <span className="flag-value">{data.flags.fire_damage}</span>
            </div>
            <div className="flag-item">
              {data.flags.rc_chassis_match === 'Yes' ? (
                <CheckCircle className="flag-icon flag-yes" />
              ) : (
                <XCircle className="flag-icon flag-no" />
              )}
              <span className="flag-label">RC & Chassis Match / आरसी और चेसिस मेल</span>
              <span className="flag-value">{data.flags.rc_chassis_match}</span>
            </div>
            <div className="flag-item">
              {data.flags.service_logs_available === 'Yes' ? (
                <CheckCircle className="flag-icon flag-yes" />
              ) : (
                <XCircle className="flag-icon flag-no" />
              )}
              <span className="flag-label">Service Logs Available / सर्विस लॉग उपलब्ध</span>
              <span className="flag-value">{data.flags.service_logs_available}</span>
            </div>
          </div>
        </div>

        {/* Additional Comments Card */}
        <div className="detail-card">
          <h3 className="card-title">Additional Comments / अतिरिक्त टिप्पणियाँ</h3>
          <div className="comment-list">
            <div className="comment-item">
              <span className="comment-label">Engine / इंजन</span>
              <span className="comment-text">{data.comments.engine}</span>
            </div>
            <div className="comment-item">
              <span className="comment-label">Structure / संरचना</span>
              <span className="comment-text">{data.comments.structure}</span>
            </div>
            <div className="comment-item">
              <span className="comment-label">Test Drive / परीक्षण ड्राइव</span>
              <span className="comment-text">{data.comments.test_drive}</span>
            </div>
            <div className="comment-item">
              <span className="comment-label">Exterior / बाहरी</span>
              <span className="comment-text">{data.comments.exterior}</span>
            </div>
            <div className="comment-item">
              <span className="comment-label">Interior / आंतरिक</span>
              <span className="comment-text">{data.comments.interior}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Row */}
      <div className="image-row-equal">
        <div className="image-card-equal">
          <img src={data.images.rhs_apron} alt="RHS Apron" className="inspection-image" />
          <div className="image-label">RHS Apron Image / दायीं एप्रन छवि</div>
        </div>
        <div className="image-card-equal">
          <img src={data.images.lhs_apron} alt="LHS Apron" className="inspection-image" />
          <div className="image-label">LHS Apron Image / बायीं एप्रन छवि</div>
        </div>
        <div className="image-card-equal">
          <img src={data.images.chassis_plate} alt="Chassis Plate" className="inspection-image" />
          <div className="image-label">Chassis Plate Image / चेसिस प्लेट छवि</div>
        </div>
        <div className="image-card-equal">
          <img src={data.images.cng_plate} alt="CNG Plate" className="inspection-image" />
          <div className="image-label">CNG Plate Image / सीएनजी प्लेट छवि</div>
        </div>
      </div>
    </InspectionPage>
  );
}