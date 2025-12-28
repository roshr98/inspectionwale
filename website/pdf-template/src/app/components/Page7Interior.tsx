import React from 'react';
import { InspectionPage } from './InspectionPage';
import { CheckCircle, XCircle } from 'lucide-react';
import { getInspectionData } from '../../utils/dataLoader';

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
              {data.interior.mil_light === 'Working' || data.interior.mil_light === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">MIL Light / एमआईएल लाइट</span>
              <span className="icon-detail-value">{data.interior.mil_light}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.dashboard_condition === 'Working' || data.interior.dashboard_condition === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Dashboard Condition / डैशबोर्ड स्थिति</span>
              <span className="icon-detail-value">{data.interior.dashboard_condition}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.music_system === 'Working' || data.interior.music_system === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Music System / म्यूजिक सिस्टम</span>
              <span className="icon-detail-value">{data.interior.music_system}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.steering_controls === 'Working' || data.interior.steering_controls === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Steering Controls / स्टीयरिंग कंट्रोल</span>
              <span className="icon-detail-value">{data.interior.steering_controls}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.paddle_shifters === 'Working' || data.interior.paddle_shifters === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Paddle Shifters / पैडल शिफ्टर</span>
              <span className="icon-detail-value">{data.interior.paddle_shifters}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.hand_brake === 'Working' || data.interior.hand_brake === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Hand Brake / हैंड ब्रेक</span>
              <span className="icon-detail-value">{data.interior.hand_brake}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.speakers === 'Working' || data.interior.speakers === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Speakers / स्पीकर</span>
              <span className="icon-detail-value">{data.interior.speakers}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.ac_vents === 'Working' || data.interior.ac_vents === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">AC Vents / एसी वेंट</span>
              <span className="icon-detail-value">{data.interior.ac_vents}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.ac_working === 'Working' || data.interior.ac_working === 'Yes' ? (
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
              {data.interior.steering_type === 'Working' || data.interior.steering_type === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Steering Type / स्टीयरिंग प्रकार</span>
              <span className="icon-detail-value">{data.interior.steering_type}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.cruise_control === 'Working' || data.interior.cruise_control === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Cruise Control / क्रूज़ कंट्रोल</span>
              <span className="icon-detail-value">{data.interior.cruise_control}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.navigation === 'Working' || data.interior.navigation === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Navigation / नेविगेशन</span>
              <span className="icon-detail-value">{data.interior.navigation}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.glove_box === 'Working' || data.interior.glove_box === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Glove Box / ग्लव बॉक्स</span>
              <span className="icon-detail-value">{data.interior.glove_box}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.cabin_lights === 'Working' || data.interior.cabin_lights === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Cabin Lights / केबिन लाइट्स</span>
              <span className="icon-detail-value">{data.interior.cabin_lights}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.headlights === 'Working' || data.interior.headlights === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Headlights / हेडलाइट्स</span>
              <span className="icon-detail-value">{data.interior.headlights}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.wipers === 'Working' || data.interior.wipers === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Wipers / वाइपर</span>
              <span className="icon-detail-value">{data.interior.wipers}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.trip_switch === 'Working' || data.interior.trip_switch === 'Yes' ? (
                <CheckCircle className="check-icon-small" />
              ) : (
                <XCircle className="x-icon-small" />
              )}
              <span className="icon-detail-label">Trip Switch / ट्रिप स्विच</span>
              <span className="icon-detail-value">{data.interior.trip_switch}</span>
            </div>
            <div className="icon-detail-item">
              {data.interior.boot_lever === 'Working' || data.interior.boot_lever === 'Yes' ? (
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

      {/* Driver Cabin Section */}
      <div className="image-card-full">
        <img src={data.images.driver_cabin} alt="Driver Cabin" className="inspection-image" />
        <div className="image-label">Driver Cabin Image / ड्राइवर केबिन छवि</div>
      </div>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Front Seat Condition / फ्रंट सीट स्थिति</span>
            <span className="detail-value">{data.seats.front_condition}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Seat Adjustment Type / सीट एडजस्टमेंट प्रकार</span>
            <span className="detail-value">{data.seats.adjustment_type}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Seat Belts / सीट बेल्ट</span>
            <span className="detail-value">{data.seats.seat_belts}</span>
          </div>
        </div>
      </div>
    </InspectionPage>
  );
}
