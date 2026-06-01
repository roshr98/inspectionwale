import React from 'react';
import { Mail, Phone, Globe, Award, FileText, DollarSign } from 'lucide-react';

interface InspectionPageProps {
  children: React.ReactNode;
  pageNumber: number;
}

export function InspectionPage({ children, pageNumber }: InspectionPageProps) {
  return (
    <div className="inspection-page">
      {/* Global Header */}
      <div className="global-header">
        <div className="header-logo">
          <div className="logo-box">
            <span className="logo-text">INSPECTIONWALE</span>
          </div>
        </div>
        <div className="header-contact">
          <span className="contact-item">
            <Mail className="contact-icon" />
            hello@inspectionwale.com
          </span>
          <span className="contact-separator">|</span>
          <span className="contact-item">
            <Phone className="contact-icon" />
            +91 91675 58998
          </span>
          <span className="contact-separator">|</span>
          <span className="contact-item">
            <Globe className="contact-icon" />
            inspectionwale.com
          </span>
        </div>
      </div>

      {/* Page Content */}
      <div className="inspection-content">
        {children}
      </div>

      {/* Global Footer */}
      <div className="global-footer">
        <div className="footer-logo">
          <span className="footer-logo-text">INSPECTIONWALE</span>
        </div>
        <div className="footer-item">
          <Award className="footer-icon" />
          <span>2000+ Cars Inspected</span>
        </div>
        <div className="footer-item">
          <FileText className="footer-icon" />
          <span>Easy to understand reports</span>
        </div>
        <div className="footer-item">
          <DollarSign className="footer-icon" />
          <span>Pricing assistance</span>
        </div>
      </div>

      {/* Page Number */}
      <div className="page-number-footer">Page {pageNumber}</div>
    </div>
  );
}
