import React from 'react';
import { InspectionPage } from './InspectionPage';
import { getInspectionData } from '../../utils/dataLoader';

export function Page10StructurePerformance() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={10}>
      <h2 className="section-header">Structure Inspection</h2>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Upper Member</span>
            <span className="detail-value">{data.structure.upper_member}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Lower Member</span>
            <span className="detail-value">{data.structure.lower_member}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Cross Member</span>
            <span className="detail-value">{data.structure.cross_member}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RHS Apron</span>
            <span className="detail-value">{data.structure.rhs_apron}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Apron</span>
            <span className="detail-value">{data.structure.lhs_apron}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">A Pillar RHS</span>
            <span className="detail-value">{data.structure.a_pillar_rhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">A Pillar LHS</span>
            <span className="detail-value">{data.structure.a_pillar_lhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">B Pillar RHS</span>
            <span className="detail-value">{data.structure.b_pillar_rhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">B Pillar LHS</span>
            <span className="detail-value">{data.structure.b_pillar_lhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">C Pillar RHS</span>
            <span className="detail-value">{data.structure.c_pillar_rhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">C Pillar LHS</span>
            <span className="detail-value">{data.structure.c_pillar_lhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">RHS Fender Wall</span>
            <span className="detail-value">{data.structure.fender_wall_rhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LHS Fender Wall</span>
            <span className="detail-value">{data.structure.fender_wall_lhs}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Tailgate Frame</span>
            <span className="detail-value">{data.structure.tailgate_frame}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Dicky Tub</span>
            <span className="detail-value">{data.structure.dicky_tub}</span>
          </div>
        </div>
      </div>

      {/* Performance Section */}
      <h2 className="section-header">Performance Test Drive</h2>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Steering</span>
            <span className="detail-value">{data.performance.steering}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Alignment</span>
            <span className="detail-value">{data.performance.alignment}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Ignition</span>
            <span className="detail-value">{data.performance.ignition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Clutch</span>
            <span className="detail-value">{data.performance.clutch}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Brakes</span>
            <span className="detail-value">{data.performance.brakes}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Gear Shifting</span>
            <span className="detail-value">{data.performance.gear_shift}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Acceleration</span>
            <span className="detail-value">{data.performance.acceleration}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Suspension</span>
            <span className="detail-value">{data.performance.suspension}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Engine Noise</span>
            <span className="detail-value">{data.performance.engine_noise}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CNG Performance</span>
            <span className="detail-value">{data.performance.cng_mode}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Wheel Alignment</span>
            <span className="detail-value">{data.performance.wheel_alignment}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Estimated Repair Cost</span>
            <span className="detail-value">{data.performance.estimated_repair_cost}</span>
          </div>
        </div>
      </div>
    </InspectionPage>
  );
}
