
/**
 * InspectorForm.jsx - Single-file React component (starter)
 * Assumptions:
 * - Amplify configured separately (Amplify.configure({...}))
 * - API endpoints:
 *   POST /api/presign  -> { url, key }
 *   POST /api/inspections -> creates inspection draft { inspectionId }
 *   PUT  /api/inspections/{id} -> update draft
 *   POST /api/inspections/{id}/submit -> submit to trigger PDF generation
 *
 * This is a starter component; wire into your Amplify/React app.
 */
import React, { useState } from 'react';

export default function InspectorForm({ apiBaseUrl }) {
  const [form, setForm] = useState({ vehicle: { regNumber: '', makeModel: '' }, inspector: {}, sections: {}, images: [] });
  const [uploading, setUploading] = useState(false);

  const updateField = (path, value) => {
    const copy = JSON.parse(JSON.stringify(form));
    const parts = path.split('.');
    let cur = copy;
    for (let i = 0; i < parts.length-1; i++) {
      if (!cur[parts[i]]) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length-1]] = value;
    setForm(copy);
  };

  async function createDraft() {
    const resp = await fetch(apiBaseUrl + '/api/inspections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    return resp.json();
  }

  async function presignUpload(fileName, contentType) {
    const resp = await fetch(apiBaseUrl + '/api/presign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName, contentType }) });
    return resp.json(); // { url, key }
  }

  async function uploadFileToS3(url, file, contentType) {
    await fetch(url, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file });
  }

  async function handlePhotoPick(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const presign = await presignUpload(file.name, file.type);
      await uploadFileToS3(presign.url, file, file.type);
      // attach s3 key to form.images
      const copy = { ...form };
      copy.images = copy.images || [];
      copy.images.push({ key: presign.key, filename: file.name });
      setForm(copy);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveDraft() {
    // if no inspectionId, create draft else update
    if (!form.inspectionId) {
      const data = await createDraft();
      setForm({ ...form, inspectionId: data.inspectionId });
      alert('Draft created: ' + data.inspectionId);
    } else {
      await fetch(apiBaseUrl + '/api/inspections/' + form.inspectionId, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      alert('Draft updated');
    }
  }

  async function handleSubmit() {
    if (!form.inspectionId) {
      const data = await createDraft();
      setForm({ ...form, inspectionId: data.inspectionId });
    }
    await fetch(apiBaseUrl + '/api/inspections/' + form.inspectionId + '/submit', { method: 'POST' });
    alert('Submitted. PDF generation triggered.');
  }

  return (
    <div style={{ maxWidth: 900, margin: 'auto' }}>
      <h2>Inspector Form (starter)</h2>
      <div>
        <label>Registration Number</label><br/>
        <input value={form.vehicle.regNumber} onChange={e => updateField('vehicle.regNumber', e.target.value)} />
      </div>
      <div>
        <label>Make / Model</label><br/>
        <input value={form.vehicle.makeModel} onChange={e => updateField('vehicle.makeModel', e.target.value)} />
      </div>
      <div>
        <label>Photos</label><br/>
        <input type="file" accept="image/*" onChange={handlePhotoPick} />
        {uploading && <div>Uploading...</div>}
        <div>
          {form.images && form.images.map((im, idx) => <div key={idx}>{im.filename} — {im.key}</div>)}
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={handleSaveDraft}>Save Draft</button>
        <button onClick={handleSubmit} style={{ marginLeft: 8 }}>Submit & Generate PDF</button>
      </div>
    </div>
  );
}
