import React from 'react'

export default function Why(){
  return (
    <div className="container">
      <h2 style={{fontFamily:'Poppins,Inter',color:'var(--primary)'}}>Certified trouble-free vehicles</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginTop:12}}>
        <div style={{background:'rgba(255,255,255,0.03)',padding:12,borderRadius:10}}> <div style={{width:56,height:56,display:'grid',placeItems:'center',borderRadius:8,background:'#fff'}}>✓</div><strong style={{display:'block',marginTop:8}}>160+ Checks</strong></div>
        <div style={{background:'rgba(255,255,255,0.03)',padding:12,borderRadius:10}}> <div style={{width:56,height:56,display:'grid',placeItems:'center',borderRadius:8,background:'#fff'}}>📄</div><strong style={{display:'block',marginTop:8}}>Clear Report</strong></div>
        <div style={{background:'rgba(255,255,255,0.03)',padding:12,borderRadius:10}}> <div style={{width:56,height:56,display:'grid',placeItems:'center',borderRadius:8,background:'#fff'}}>🛡️</div><strong style={{display:'block',marginTop:8}}>Unbiased</strong></div>
        <div style={{background:'rgba(255,255,255,0.03)',padding:12,borderRadius:10}}> <div style={{width:56,height:56,display:'grid',placeItems:'center',borderRadius:8,background:'#fff'}}>⏱️</div><strong style={{display:'block',marginTop:8}}>Quick Turnaround</strong></div>
      </div>
    </div>
  )
}
