import React, { useState, useEffect } from 'react';
import { SinglePageForm } from './components/SinglePageForm';
import { Page1Header } from './components/Page1Header';
import { Page2KeyHighlights } from './components/Page2KeyHighlights';
import { Page3FrontView } from './components/Page3FrontView';
import { Page4RHSSide } from './components/Page4RHSSide';
import { Page5LHSSide } from './components/Page5LHSSide';
import { Page6RearRoof } from './components/Page6RearRoof';
import { Page7Interior } from './components/Page7Interior';
import { Page8RearCabinBoot } from './components/Page8RearCabinBoot';
import { Page9Boot } from './components/Page9Boot';
import { Page10EngineTyres } from './components/Page10EngineTyres';
import { Page11StructurePerformance } from './components/Page11StructurePerformance';
import { Page12Disclaimer } from './components/Page12Disclaimer';
import { saveInspectionData } from '../utils/dataLoader';
import { initTestDataHelper } from '../utils/testDataHelper';
import '../styles/inspector-form.css';
import '../styles/image-upload.css';
import '../styles/single-page-form.css';

export default function App() {
  const [view, setView] = useState<'form' | 'report'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === 'report' ? 'report' : 'form';
    } catch (_e) {
      return 'form';
    }
  });
  const [, setUpdateTrigger] = useState(0); // Used to force re-render when data changes

  // Initialize test data helper for development
  useEffect(() => {
    initTestDataHelper();
  }, []);

  const handleSaveData = (formData: any) => {
    saveInspectionData(formData);
    // Trigger re-render to update the report view with new data
    setUpdateTrigger(prev => prev + 1);
  };

  const handleViewReport = () => {
    setView('report');
  };

  const handleViewForm = () => {
    setView('form');
  };

  // Signal to the Lambda PDF renderer that the report is ready.
  useEffect(() => {
    if (view !== 'report') {
      try {
        document.documentElement.removeAttribute('data-report-ready');
      } catch (_e) {
        // ignore
      }
      return;
    }

    let cancelled = false;

    const markReady = async () => {
      try {
        // Ensure webfonts are loaded before the Lambda renderer snapshots the page.
        // This prevents per-glyph fallback (e.g., digits using a different font/weight).
        // `document.fonts` is supported in Chromium.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fonts: any = (document as any).fonts;
        if (fonts?.ready) {
          await fonts.ready;
        }
      } catch (_e) {
        // ignore
      }

      if (cancelled) return;

      try {
        document.documentElement.setAttribute('data-report-ready', 'true');
      } catch (_e) {
        // ignore
      }
    };

    // Let the report layout paint before marking ready.
    const t = window.setTimeout(() => {
      void markReady();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [view]);

  return (
    <div className="bg-white">
      {view === 'form' ? (
        <SinglePageForm onSave={handleSaveData} onViewReport={handleViewReport} />
      ) : (
        <>
          <div className="report-header-actions no-print">
            <button onClick={handleViewForm} className="back-to-form-btn">
              ← Back to Form
            </button>
            <button onClick={() => window.print()} className="print-btn">
              🖨️ Print Report
            </button>
          </div>
          <Page1Header />
          <Page2KeyHighlights />
          <Page3FrontView />
          <Page4RHSSide />
          <Page5LHSSide />
          <Page6RearRoof />
          <Page7Interior />
          <Page8RearCabinBoot />
          <Page9Boot />
          <Page10EngineTyres />
          <Page11StructurePerformance />
          <Page12Disclaimer />
        </>
      )}
    </div>
  );
}