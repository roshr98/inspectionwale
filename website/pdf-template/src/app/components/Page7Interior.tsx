import React from 'react';
import { InspectionPage } from './InspectionPage';
import { CheckCircle, XCircle } from 'lucide-react';
import { getInspectionData } from '../../utils/dataLoader';

// Helper function to check if a value is "good" condition
function isGoodCondition(value: string | undefined | null): boolean {
  if (!value) return false;
  const lowerVal = value.toLowerCase().trim();
  return ['good', 'ok', 'excellent', 'working', 'yes'].includes(lowerVal);
}

// Helper function to check if MIL light is off (which is good - means no warning)
function isMilLightOff(value: string | undefined | null): boolean {
  if (!value) return false;
  const lowerVal = value.toLowerCase().trim();
  return lowerVal === 'off';
}

// Helper function to check if steering type is power-assisted (which is good)
function isGoodSteeringType(value: string | undefined | null): boolean {
  if (!value) return false;
  const lowerVal = value.toLowerCase().trim();
  return ['power', 'electric', 'hydraulic'].includes(lowerVal);
}

export function Page7Interior() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={7}>
      <h2 className="section-header-bilingual">Interior Inspection / आंतरिक निरीक्षण</h2>

      {/* Top Row Images */}
      <div className="image-row-two">
        <div className="image-card-half">
          <img src={data.images.dashboard} alt="Dashboard" className="inspection-image" />
          <div className="image-label">Dashboard Image / डैशबोर्ड छवि</div>
        </div>
        <div className="image-card-half">
          <img src={data.images.cluster_meter} alt="Cluster Meter" className="inspection-image" />
          <div className="image-label">Cluster Meter Image / क्लस्टर मीटर छवि</div>
        </div>
      </div>

      {/* Dashboard and Cluster Fields in Two Columns */}
      <div className="two-column-cards">
        {/* Dashboard Card */}
        <div className="detail-card">
          <h3 className="card-title">Dashboard / डैशबोर्ड</h3>
          <div className="icon-detail-list">
            <div className="icon-detail-item">
              {isMilLightOff(data.interior.mil_light) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">MIL Light / एमआईएल लाइट</span>
              <span className="icon-detail-value">{data.interior.mil_light}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.dashboard_condition) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Dashboard Condition / डैशबोर्ड स्थिति</span>
              <span className="icon-detail-value">{data.interior.dashboard_condition}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.music_system) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Music System / म्यूजिक सिस्टम</span>
              <span className="icon-detail-value">{data.interior.music_system}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.steering_controls) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Steering Controls / स्टीयरिंग कंट्रोल</span>
              <span className="icon-detail-value">{data.interior.steering_controls}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.paddle_shifters) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Paddle Shifters / पैडल शिफ्टर</span>
              <span className="icon-detail-value">{data.interior.paddle_shifters}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.hand_brake) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Hand Brake / हैंड ब्रेक</span>
              <span className="icon-detail-value">{data.interior.hand_brake}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.speakers) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Speakers / स्पीकर</span>
              <span className="icon-detail-value">{data.interior.speakers}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.ac_vents) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">AC Vents / एसी वेंट</span>
              <span className="icon-detail-value">{data.interior.ac_vents}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.ac_working) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">AC Performance / एसी प्रदर्शन</span>
              <span className="icon-detail-value">{data.interior.ac_working}</span>
            </div>
          </div>
        </div>

        {/* Cluster Card */}
        <div className="detail-card">
          <h3 className="card-title">Cluster Controls / क्लस्टर कंट्रोल</h3>
          <div className="icon-detail-list">
            <div className="icon-detail-item">
              {isGoodSteeringType(data.interior.steering_type) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Steering Type / स्टीयरिंग प्रकार</span>
              <span className="icon-detail-value">{data.interior.steering_type}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.cruise_control) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Cruise Control / क्रूज़ कंट्रोल</span>
              <span className="icon-detail-value">{data.interior.cruise_control}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.navigation) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Navigation / नेविगेशन</span>
              <span className="icon-detail-value">{data.interior.navigation}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.glove_box) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Glove Box / ग्लव बॉक्स</span>
              <span className="icon-detail-value">{data.interior.glove_box}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.cabin_lights) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Cabin Lights / केबिन लाइट्स</span>
              <span className="icon-detail-value">{data.interior.cabin_lights}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.headlights) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Headlights / हेडलाइट्स</span>
              <span className="icon-detail-value">{data.interior.headlights}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.wipers) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Wipers / वाइपर</span>
              <span className="icon-detail-value">{data.interior.wipers}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.trip_switch) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Trip Switch / ट्रिप स्विच</span>
              <span className="icon-detail-value">{data.interior.trip_switch}</span>
            </div>
            <div className="icon-detail-item">
              {isGoodCondition(data.interior.boot_lever) ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Boot Lever / बूट लीवर</span>
              <span className="icon-detail-value">{data.interior.boot_lever}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Interior Details */}
      <div className="detail-card">
        <h3 className="card-title">Additional Controls & Features / अतिरिक्त नियंत्रण और सुविधाएँ</h3>
        <div className="detail-grid-four">
          <div className="detail-item">
            <span className="detail-label">Central Lock / सेंट्रल लॉक</span>
            <span className="detail-value">{data.interior.central_lock}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Rear Wiper / रियर वाइपर</span>
            <span className="detail-value">{data.interior.rear_wiper}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Rear View Mirror / रियर व्यू मिरर</span>
            <span className="detail-value">{data.interior.rear_view_mirror}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Bonnet Lever / बोनट लीवर</span>
            <span className="detail-value">{data.interior.bonnet_lever}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Side Mirror Adjustment / साइड मिरर एडजस्टमेंट</span>
            <span className="detail-value">{data.interior.side_mirror_adjustment}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fuel Lid Lever / फ्यूल लिड लीवर</span>
            <span className="detail-value">{data.interior.fuel_lid_lever}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Power Windows / पावर विंडोज</span>
            <span className="detail-value">{data.interior.power_windows}</span>
          </div>
        </div>
      </div>
    </InspectionPage>
  );
}
