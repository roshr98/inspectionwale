import React, {useState} from 'react'

export default function Callback(){
  const [form,setForm] = useState({name:'',mobile:'',model:'',city:''})
  const [sent,setSent] = useState(false)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')

  function update(e){ setForm({...form,[e.target.name]:e.target.value}) }

  async function submit(e){
    e.preventDefault();
    setBusy(true); setError('')
    try{
      const base = import.meta.env.VITE_API_BASE || ''
      const res = await fetch(base + '/api/callback',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(form)})
      if(res.ok){ setSent(true) }
      else { const j = await res.json().catch(()=>null); setError(j && j.error ? j.error : 'Failed to submit') }
    }catch(err){ setError('Network error') }
    setBusy(false)
  }

  return (
    <div className="container" style={{marginTop:20}}>
      <div style={{maxWidth:420,marginLeft:'auto'}}>
        <div style={{background:'rgba(255,255,255,0.03)',padding:18,borderRadius:12}}>
          <h5>Request Callback</h5>
          {error && <div className="text-danger small" style={{marginBottom:8}}>{error}</div>}
          {sent ? <div style={{color:'#22c55e'}}>Thanks — we'll call you soon.</div> : (
          <form onSubmit={submit}>
            <div style={{marginBottom:10}}><label className="small">Name</label><input name="name" value={form.name} onChange={update} className="form-control" required/></div>
            <div style={{marginBottom:10}}><label className="small">Mobile</label><input name="mobile" value={form.mobile} onChange={update} className="form-control" required/></div>
            <div style={{marginBottom:10}}><label className="small">Car Model</label><input name="model" value={form.model} onChange={update} className="form-control"/></div>
            <div style={{marginBottom:10}}><label className="small">City</label><input name="city" value={form.city} onChange={update} className="form-control"/></div>
            <button className="btn-cta" type="submit" disabled={busy}>{busy ? 'Sending...' : 'Request Callback'}</button>
          </form>) }
        </div>
      </div>
    </div>
  )
}
