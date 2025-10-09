import React from 'react'
import Hero from './components/Hero'
import Why from './components/Why'
import Checks from './components/Checks'
import Callback from './components/Callback'

export default function App(){
  return (
    <div>
      <Hero />
      <section style={{padding:'32px'}}>
        <Why />
        <Checks />
      </section>
      <Callback />
    </div>
  )
}
