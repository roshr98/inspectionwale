import React from 'react';
import { InspectionPage } from './InspectionPage';
import { getInspectionData } from '../../utils/dataLoader';

export function Page10StructurePerformance() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={10}>
      <h2 className="section-header-bilingual">Structure Inspection / संरचना निरीक्षण</h2>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Upper Member / अपर मेम्बर</span>
            <span className="detail-value">{data.structure.upper_member}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Lower Member / लोअर मेम्बर</span>
            <span className="detail-value">{data.structure.lower_member}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Cross Member / क्रॉस मेम्बर</span>
            <span className="detail-value">{data.structure.cross_member}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RHS Apron / दाहिना एप्रन</span>
            <span className="detail-value">{data.structure.rhs_apron}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Apron / बायां एप्रन</span>
            <span className="detail-value">{data.structure.lhs_apron}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">A Pillar RHS / ए पिलर दाहिना</span>
            <span className="detail-value">{data.structure.a_pillar_rhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">A Pillar LHS / ए पिलर बायां</span>
            <span className="detail-value">{data.structure.a_pillar_lhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">B Pillar RHS / बी पिलर दाहिना</span>
            <span className="detail-value">{data.structure.b_pillar_rhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">B Pillar LHS / बी पिलर बायां</span>
            <span className="detail-value">{data.structure.b_pillar_lhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">C Pillar RHS / सी पिलर दाहिना</span>
            <span className="detail-value">{data.structure.c_pillar_rhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">C Pillar LHS / सी पिलर बायां</span>
            <span className="detail-value">{data.structure.c_pillar_lhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RHS Fender Wall / दाहिना फेंडर वॉल</span>
            <span className="detail-value">{data.structure.fender_wall_rhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Fender Wall / बायां फेंडर वॉल</span>
            <span className="detail-value">{data.structure.fender_wall_lhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Tailgate Frame / टेलगेट फ्रेम</span>
            <span className="detail-value">{data.structure.tailgate_frame}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Dicky Tub / डिक्की टब</span>
            <span className="detail-value">{data.structure.dicky_tub}</span>
          </div>
        </div>
      </div>

      {/* Performance Section */}
      <h2 className="section-header-bilingual">Performance Test Drive / प्रदर्शन परीक्षण ड्राइव</h2>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Steering / स्टीयरिंग</span>
            <span className="detail-value">{data.performance.steering}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Alignment / एलाइनमेंट</span>
            <span className="detail-value">{data.performance.alignment}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Ignition / इग्निशन</span>
            <span className="detail-value">{data.performance.ignition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Clutch / क्लच</span>
            <span className="detail-value">{data.performance.clutch}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Brakes / ब्रेक</span>
            <span className="detail-value">{data.performance.brakes}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Gear Shifting / गियर शिफ्टिंग</span>
            <span className="detail-value">{data.performance.gear_shift}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Acceleration / एक्सीलरेशन</span>
            <span className="detail-value">{data.performance.acceleration}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Suspension / सस्पेंशन</span>
            <span className="detail-value">{data.performance.suspension}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Engine Noise / इंजन शोर</span>
            <span className="detail-value">{data.performance.engine_noise}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CNG Performance / सीएनजी प्रदर्शन</span>
            <span className="detail-value">{data.performance.cng_mode}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Wheel Alignment / व्हील एलाइनमेंट</span>
            <span className="detail-value">{data.performance.wheel_alignment}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Estimated Repair Cost / अनुमानित मरम्मत लागत</span>
            <span className="detail-value">{data.performance.estimated_repair_cost}</span>
          </div>
        </div>
      </div>
    </InspectionPage>
  );
}
