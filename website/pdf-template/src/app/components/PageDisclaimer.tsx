import React from 'react';
import { InspectionPage } from './InspectionPage';

export function PageDisclaimer() {
  return (
    <InspectionPage pageNumber={11}>
      <h2 className="section-header-bilingual">Disclaimer / अस्वीकरण</h2>

      <div className="disclaimer-card">
        <h3 className="disclaimer-title">IMPORTANT - PLEASE READ CAREFULLY</h3>
        
        <div className="disclaimer-content">
          <p><strong>1. Scope of Inspection:</strong> This inspection report is based on a visual and mechanical examination of the vehicle conducted on the date mentioned. The report reflects the condition of the vehicle at the time of inspection only.</p>
          
          <p><strong>2. Limitations:</strong> This inspection does not include dismantling of any parts or components. Hidden damages, internal engine conditions, or issues that require specialized diagnostic equipment may not be detected during this inspection.</p>
          
          <p><strong>3. Accuracy:</strong> While every effort has been made to provide accurate information, Inspectionwale does not guarantee the completeness or accuracy of all details. The information provided is based on the inspector's professional judgment and available documentation.</p>
          
          <p><strong>4. No Warranty:</strong> This report does not constitute a warranty or guarantee of the vehicle's condition, performance, or future reliability. It is an opinion based on the inspection conducted at a specific point in time.</p>
          
          <p><strong>5. Third-Party Verification:</strong> We recommend buyers to independently verify all legal documents including RC, insurance, and pollution certificates with respective authorities before making a purchase decision.</p>
          
          <p><strong>6. Pricing & Valuation:</strong> Any price advice or valuation provided is indicative only and based on current market conditions. Actual market value may vary based on location, demand, and other factors.</p>
          
          <p><strong>7. Liability:</strong> Inspectionwale, its employees, and inspectors shall not be held liable for any direct, indirect, incidental, or consequential damages arising from the use of this report or purchase decisions made based on this report.</p>
          
          <p><strong>8. Confidentiality:</strong> This report is confidential and intended solely for the use of the person or entity to whom it is addressed. Unauthorized distribution or reproduction is prohibited.</p>
          
          <p><strong>9. Legal Compliance:</strong> The buyer is responsible for ensuring that all legal and regulatory requirements are met before completing the purchase of the vehicle.</p>
          
          <p><strong>10. Final Decision:</strong> This report is meant to assist in making an informed decision. The final purchase decision rests entirely with the buyer.</p>
        </div>

        <div className="disclaimer-divider"></div>

        <div className="disclaimer-content hindi">
          <p><strong>महत्वपूर्ण - कृपया ध्यान से पढ़ें</strong></p>
          
          <p><strong>1. निरीक्षण का दायरा:</strong> यह निरीक्षण रिपोर्ट उल्लिखित तिथि पर वाहन की दृश्य और यांत्रिक जांच पर आधारित है। रिपोर्ट केवल निरीक्षण के समय वाहन की स्थिति को दर्शाती है।</p>
          
          <p><strong>2. सीमाएं:</strong> इस निरीक्षण में किसी भी भाग या घटक को अलग करना शामिल नहीं है। छिपी हुई क्षति, आंतरिक इंजन की स्थिति, या विशेष डायग्नोस्टिक उपकरण की आवश्यकता वाली समस्याओं का पता इस निरीक्षण के दौरान नहीं लगाया जा सकता है।</p>
          
          <p><strong>3. सटीकता:</strong> सटीक जानकारी प्रदान करने के लिए हर संभव प्रयास किया गया है, लेकिन Inspectionwale सभी विवरणों की पूर्णता या सटीकता की गारंटी नहीं देता है।</p>
          
          <p><strong>4. कोई वारंटी नहीं:</strong> यह रिपोर्ट वाहन की स्थिति, प्रदर्शन, या भविष्य की विश्वसनीयता की वारंटी या गारंटी नहीं है।</p>
          
          <p><strong>5. तीसरे पक्ष का सत्यापन:</strong> हम खरीदारों को सलाह देते हैं कि खरीद निर्णय लेने से पहले सभी कानूनी दस्तावेजों को संबंधित अधिकारियों के साथ स्वतंत्र रूप से सत्यापित करें।</p>
          
          <p><strong>6. मूल्य निर्धारण और मूल्यांकन:</strong> कोई भी मूल्य सलाह या मूल्यांकन केवल संकेतक है और वर्तमान बाजार स्थितियों पर आधारित है।</p>
          
          <p><strong>7. दायित्व:</strong> Inspectionwale, इसके कर्मचारी और निरीक्षक इस रिपोर्ट के उपयोग से उत्पन्न होने वाली किसी भी प्रत्यक्ष, अप्रत्यक्ष क्षति के लिए उत्तरदायी नहीं होंगे।</p>
          
          <p><strong>8. गोपनीयता:</strong> यह रिपोर्ट गोपनीय है और केवल उस व्यक्ति या संस्था के उपयोग के लिए है जिसे यह संबोधित की गई है।</p>
          
          <p><strong>9. कानूनी अनुपालन:</strong> खरीदार वाहन की खरीद पूरी करने से पहले सभी कानूनी और नियामक आवश्यकताओं को पूरा करने के लिए जिम्मेदार है।</p>
          
          <p><strong>10. अंतिम निर्णय:</strong> यह रिपोर्ट एक सूचित निर्णय लेने में सहायता करने के लिए है। अंतिम खरीद निर्णय पूरी तरह से खरीदार के पास है।</p>
        </div>

        <div className="signature-section">
          <div className="signature-line-disclaimer"></div>
          <p className="signature-text">Inspector's Signature</p>
          <p className="company-name">INSPECTIONWALE</p>
        </div>
      </div>
    </InspectionPage>
  );
}
