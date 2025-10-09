import React from 'react'

const items = [
  ['Engine','/Icons/Enginecheck.png'],
  ['Test Drive','/Icons/testdrive.png'],
  ['Suspension','/Icons/Suspensioncheck.png'],
  ['Tyres','/Icons/Tirecheck.png'],
  ['Electricals','/Icons/Electriccheck.png'],
  ['Interior','/Icons/Interiorcheck.png'],
  ['Paint','/Icons/Paintcheck.png'],
  ['Damage','/Icons/Accidentcheck.png'],
  ['Documents','/Icons/Documentcheck.png'],
]

export default function Checks(){
  return (
    <div className="container">
      <h4 className="whyus-header" style={{marginTop:24}}>Inspection Checklist</h4>
      <div className="checks-grid">
        {items.map(i=> (
          <div className="check" key={i[0]}>
            <img src={i[1]} alt={i[0]} style={{width:44,height:44,borderRadius:10,background:'#fff',padding:6}}/>
            <strong style={{marginLeft:6}}>{i[0]}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
