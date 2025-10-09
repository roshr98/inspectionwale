const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs-extra')
const path = require('path')
const helmet = require('helmet')
const morgan = require('morgan')
const nodemailer = require('nodemailer')
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb')
const fetch = require('node-fetch')

const app = express()
app.use(helmet())
app.use(morgan('dev'))
app.use(cors())
app.use(bodyParser.json())

const STORAGE = path.join(__dirname,'callbacks.json')

async function saveCallback(obj){
  let arr = []
  try{ arr = await fs.readJson(STORAGE) }catch(e){ arr = [] }
  arr.push({...obj,receivedAt:new Date().toISOString()})
  await fs.writeJson(STORAGE,arr,{spaces:2})
}

async function saveToFile(filename,obj){
  const p = path.join(__dirname,filename)
  let arr = []
  try{ arr = await fs.readJson(p) }catch(e){ arr = [] }
  arr.push({...obj,receivedAt:new Date().toISOString()})
  await fs.writeJson(p,arr,{spaces:2})
}

function createTransport(){
  // Use SMTP creds from env or fallback to ethereal when none provided
  const host = process.env.SMTP_HOST
  if(!host){
    console.warn('No SMTP_HOST provided — using ethereal test account for development')
    // create test account
    return nodemailer.createTestAccount().then(testAccount=>{
      return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth:{user:testAccount.user,pass:testAccount.pass}
      })
    })
  }

  const transporter = nodemailer.createTransport({
    host: host,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
  return Promise.resolve(transporter)
}

app.post('/api/callback', async (req,res)=>{
  const {name,mobile,model,city} = req.body || {}
  if(!name || !mobile) return res.status(400).json({error:'name and mobile required'})

  try{
    await saveCallback({name,mobile,model,city})

    const transporter = await createTransport()
    const to = process.env.NOTIFY_EMAIL || 'hello@inpection.com'
    const subject = `Callback request from ${name}`
    const text = `Callback request:\n\nName: ${name}\nMobile: ${mobile}\nCar: ${model || '-'}\nCity: ${city || '-'}\nReceived: ${new Date().toISOString()}`

  const info = await transporter.sendMail({from: process.env.FROM_EMAIL || 'no-reply@inpection.com',to,subject,text})

    // If using ethereal, include preview URL
    let preview = null
    if(nodemailer.getTestMessageUrl && info){
      preview = nodemailer.getTestMessageUrl(info)
    }

    res.json({ok:true,preview})
  }catch(err){
    console.error(err)
    res.status(500).json({error:'server_error'})
  }
})

// Demo signup endpoint - stores signup info
app.post('/api/signup', async (req,res)=>{
  const {name,email,mobile} = req.body || {}
  if(!name || !email) return res.status(400).json({error:'name and email required'})
  try{
    await saveToFile('signups.json',{name,email,mobile})
    res.json({ok:true})
  }catch(err){ console.error(err); res.status(500).json({error:'server_error'}) }
})

// Demo login endpoint - not secure, just a placeholder
app.post('/api/login', async (req,res)=>{
  const {email,password} = req.body || {}
  if(!email || !password) return res.status(400).json({error:'email and password required'})
  // In a real app validate, hash, and issue JWT. Here we just return ok for demo.
  try{ await saveToFile('logins.json',{email}); res.json({ok:true,token:'demo-token'}) }catch(err){ console.error(err); res.status(500).json({error:'server_error'}) }
})

// Quote endpoint - save and send email via SES if configured else nodemailer
app.post('/api/quote', async (req,res)=>{
  const {name,mobile,model,city} = req.body || {}
  if(!name || !mobile) return res.status(400).json({error:'name and mobile required'})
  try{
    await saveToFile('quotes.json',{name,mobile,model,city})
    const subject = `Quote request from ${name}`
    const text = `Quote request:\n\nName: ${name}\nMobile: ${mobile}\nCar: ${model || '-'}\nCity: ${city || '-'}\nReceived: ${new Date().toISOString()}`

    // Use SES if AWS creds present
    if(process.env.AWS_REGION && process.env.SES_FROM && process.env.SES_TO){
      const client = new SESClient({region:process.env.AWS_REGION})
      const cmd = new SendEmailCommand({
        Destination:{ToAddresses:[process.env.SES_TO]},
        Message:{Subject:{Data:subject},Body:{Text:{Data:text}}},
        Source:process.env.SES_FROM
      })
      await client.send(cmd)
      return res.json({ok:true,via:'ses'})
    }

    // fallback to nodemailer
    const transporter = await createTransport()
    const info = await transporter.sendMail({from: process.env.FROM_EMAIL || 'no-reply@inpection.com',to: process.env.NOTIFY_EMAIL || 'hello@inpection.com',subject,text})
    return res.json({ok:true,preview: nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null})
  }catch(err){ console.error(err); res.status(500).json({error:'server_error'}) }
})

// Reviews proxy - fetch Google Place details and return latest reviews with photo URLs
app.get('/api/reviews', async (req,res)=>{
  // Requires GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID env vars
  const key = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID
  if(key && placeId){
    try{
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews,photos&key=${encodeURIComponent(key)}`
      const r = await fetch(url)
      const j = await r.json()
      if(j && j.result){
        // Build usable photo URLs using the Place Photo service
        const photos = (j.result.photos||[]).slice(0,8).map(p=>({
          photo_reference: p.photo_reference,
          url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${encodeURIComponent(p.photo_reference)}&key=${encodeURIComponent(key)}`
        }))

        const reviews = (j.result.reviews||[]).slice(0,8).map((rv,i)=>({
          author: rv.author_name,
          text: rv.text,
          rating: rv.rating,
          relative_time_description: rv.relative_time_description,
          profile_photo: rv.profile_photo_url || null,
          // attach a photo from the place photos (if any) to each review in a round-robin fashion
          photo: photos.length ? photos[i % photos.length].url : null
        }))

        return res.json({ok:true,reviews,photos})
      }
      return res.json({ok:false,error:'no_result'})
    }catch(err){ console.error(err); return res.status(500).json({error:'fetch_failed'}) }
  }

  // fallback: return stored callbacks or sample reviews
  try{
    const stored = await fs.readJson(STORAGE).catch(()=>[])
    const sample = (stored.slice(-4).reverse().map((s,i)=>({author:s.name||'Customer',text:(s.model? ('Bought: '+s.model +'. '):'') + 'Thank you for the service.',rating:5})) )
    return res.json({ok:true,reviews: sample})
  }catch(err){ console.error(err); res.json({ok:false}) }
})

const port = process.env.PORT || 4000
app.listen(port,()=>console.log('Server listening on',port))
