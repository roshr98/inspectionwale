import React from 'react';
import { InspectionPage } from './InspectionPage';
import { getInspectionData } from '../../utils/dataLoader';

export function Page9EngineTyres() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={9}>
      <h2 className="section-header">Engine Inspection</h2>

      {/* Image Row */}
      <div className="image-row-three">
        <div className="image-card-third">
          <img src={data.images.engine_compartment} alt="Engine Compartment" className="inspection-image" />
          <div className="image-label">Engine Compartment</div>
        </div>
        <div className="image-card-third">
          <img src={data.images.firewall} alt="Firewall" className="inspection-image" />
          <div className="image-label">Firewall</div>
        </div>
        <div className="image-card-third">
          <img src={data.images.battery} alt="Battery" className="inspection-image" />
          <div className="image-label">Battery</div>
        </div>
      </div>

      {/* Engine Details */}
      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Oil Leaks</span>
            <span className="detail-value">{data.engine.oil_leak}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Battery Condition</span>
            <span className="detail-value">{data.engine.battery_condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Hose Pipes</span>
            <span className="detail-value">{data.engine.hose_pipes}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Engine Oil</span>
            <span className="detail-value">{data.engine.oil_condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Wiring</span>
            <span className="detail-value">{data.engine.wiring}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Engine Mounts</span>
            <span className="detail-value">{data.engine.mounting}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Brake Oil Level</span>
            <span className="detail-value">{data.engine.brake_oil_level}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Coolant Level</span>
            <span className="detail-value">{data.engine.coolant_level}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Belts</span>
            <span className="detail-value">{data.engine.belts}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Firewall Rust</span>
            <span className="detail-value">{data.engine.firewall_rust}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Estimated Repair Cost</span>
            <span className="detail-value">{data.engine.estimated_repair_cost}</span>
          </div>
        </div>
      </div>

      {/* Tyres & Wheels Section */}
      <h2 className="section-header">Tyres & Wheels</h2>

      <div className="tyre-grid">
        {/* Front RHS */}
        <div className="tyre-card">
          <img src={data.images.tyre_rhs_front} alt="Front RHS Tyre" className="tyre-image" />
          <h3 className="tyre-title">Front RHS</h3>
          <div className="tyre-details">
            <div className="tyre-detail-item">
              <span className="tyre-label">Tyre Brand</span>
              <span className="tyre-value">{data.tyres.rhs_front.brand}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Wheel Type</span>
              <span className="tyre-value">{data.tyres.rhs_front.wheel_type}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Remaining Life</span>
              <span className="tyre-value">{data.tyres.rhs_front.remaining_life}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Est. Replacement Cost</span>
              <span className="tyre-value">{data.tyres.rhs_front.estimated_cost}</span>
            </div>
          </div>
        </div>

        {/* Rear RHS */}
        <div className="tyre-card">
          <img src={data.images.tyre_rhs_rear} alt="Rear RHS Tyre" className="tyre-image" />
          <h3 className="tyre-title">Rear RHS</h3>
          <div className="tyre-details">
            <div className="tyre-detail-item">
              <span className="tyre-label">Tyre Brand</span>
              <span className="tyre-value">{data.tyres.rhs_rear.brand}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Wheel Type</span>
              <span className="tyre-value">{data.tyres.rhs_rear.wheel_type}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Remaining Life</span>
              <span className="tyre-value">{data.tyres.rhs_rear.remaining_life}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Est. Replacement Cost</span>
              <span className="tyre-value">{data.tyres.rhs_rear.estimated_cost}</span>
            </div>
          </div>
        </div>

        {/* Front LHS */}
        <div className="tyre-card">
          <img src={data.images.tyre_lhs_front} alt="Front LHS Tyre" className="tyre-image" />
          <h3 className="tyre-title">Front LHS</h3>
          <div className="tyre-details">
            <div className="tyre-detail-item">
              <span className="tyre-label">Tyre Brand</span>
              <span className="tyre-value">{data.tyres.lhs_front.brand}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Wheel Type</span>
              <span className="tyre-value">{data.tyres.lhs_front.wheel_type}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Remaining Life</span>
              <span className="tyre-value">{data.tyres.lhs_front.remaining_life}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Est. Replacement Cost</span>
              <span className="tyre-value">{data.tyres.lhs_front.estimated_cost}</span>
            </div>
          </div>
        </div>

        {/* Rear LHS */}
        <div className="tyre-card">
          <img src={data.images.tyre_lhs_rear} alt="Rear LHS Tyre" className="tyre-image" />
          <h3 className="tyre-title">Rear LHS</h3>
          <div className="tyre-details">
            <div className="tyre-detail-item">
              <span className="tyre-label">Tyre Brand</span>
              <span className="tyre-value">{data.tyres.lhs_rear.brand}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Wheel Type</span>
              <span className="tyre-value">{data.tyres.lhs_rear.wheel_type}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Remaining Life</span>
              <span className="tyre-value">{data.tyres.lhs_rear.remaining_life}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Est. Replacement Cost</span>
              <span className="tyre-value">{data.tyres.lhs_rear.estimated_cost}</span>
            </div>
          </div>
        </div>

        {/* Spare Tyre */}
        <div className="tyre-card">
          <img src={data.images.spare_tyre} alt="Spare Tyre" className="tyre-image" />
          <h3 className="tyre-title">Spare Tyre</h3>
          <div className="tyre-details">
            <div className="tyre-detail-item">
              <span className="tyre-label">Tyre Brand</span>
              <span className="tyre-value">{data.tyres.spare.brand}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Wheel Type</span>
              <span className="tyre-value">{data.tyres.spare.wheel_type}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Remaining Life</span>
              <span className="tyre-value">{data.tyres.spare.remaining_life}</span>
            </div>
            <div className="tyre-detail-item">
              <span className="tyre-label">Est. Replacement Cost</span>
              <span className="tyre-value">{data.tyres.spare.estimated_cost}</span>
            </div>
          </div>
        </div>
      </div>
    </InspectionPage>
  );
}
