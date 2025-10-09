import React from 'react'

export default function Hero(){
  return (
    <section className="hero" aria-label="hero">
      <div className="container">
        <div style={{display:'flex',gap:24,alignItems:'center'}}>
          <img src="/Images/Banner.jpeg" alt="banner" style={{width:'60%',borderRadius:12,objectFit:'cover'}}/>
          <div className="caption">
            <h1 style={{fontFamily:'Poppins,Inter',fontSize:36,color:'var(--primary)'}}>Checked. Cleared. Yours.</h1>
            <p style={{color:'var(--muted)'}}>Certified inspections with photo evidence, odometer validation, test-drive notes and a clear PDF report — trusted by buyers and fleet managers.</p>
            <div style={{marginTop:12}}><button className="btn-cta">Request Inspection</button></div>
          </div>
        </div>
      </div>
    </section>
  )
}
