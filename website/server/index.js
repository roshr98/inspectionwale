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
  const {firstName,lastName,mobile,email,location,carType} = req.body || {}
  if(!firstName || !mobile) return res.status(400).json({error:'firstName and mobile required'})

  try{
    const payload = { firstName,lastName,mobile,email,location,carType }

    // Save to DynamoDB if configured, else save to file
    if(process.env.QUOTES_TABLE){
      try{
        const ddb = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' })
        const ddbDoc = DynamoDBDocumentClient.from(ddb)
        await ddbDoc.send(new PutCommand({ TableName: process.env.QUOTES_TABLE, Item: { id: String(Date.now()), ...payload, receivedAt: new Date().toISOString() } }))
      }catch(e){ console.error('Dynamo save failed',e); await saveToFile('callbacks.json',payload) }
    } else {
      await saveToFile('callbacks.json',payload)
    }

    // send notification and thank-you to user
    const notifyTo = process.env.NOTIFY_EMAIL || 'hello@inpection.com'
    const subject = `Callback request from ${firstName} ${lastName || ''}`
    const adminText = `Callback request:\n\nName: ${firstName} ${lastName || ''}\nMobile: ${mobile}\nEmail: ${email || '-'}\nLocation: ${location || '-'}\nCar type: ${carType || '-'}\nReceived: ${new Date().toISOString()}`

    // notify admin
    try{
      if(process.env.AWS_REGION && process.env.SES_FROM){
        const sesClient = new SESClient({ region: process.env.AWS_REGION })
        await sesClient.send(new SendEmailCommand({ Source: process.env.SES_FROM, Destination: { ToAddresses: [notifyTo] }, Message: { Subject: { Data: subject }, Body: { Text: { Data: adminText } } } }))
      } else {
        const transporter = await createTransport()
        await transporter.sendMail({ from: process.env.FROM_EMAIL || 'no-reply@inpection.com', to: notifyTo, subject, text: adminText })
      }
    }catch(err){ console.error('notify failed',err) }

    // thank-you email to user if email provided
    if(email){
      const userSubj = 'Thanks for requesting a quote'
      const userText = `Hi ${firstName},\n\nThanks for requesting a quote. We have received your details and will get back to you shortly.\n\nRegards,\nInspectionWale`;
      try{
        if(process.env.AWS_REGION && process.env.SES_FROM){
          const sesClient = new SESClient({ region: process.env.AWS_REGION })
          await sesClient.send(new SendEmailCommand({ Source: process.env.SES_FROM, Destination: { ToAddresses: [email] }, Message: { Subject: { Data: userSubj }, Body: { Text: { Data: userText } } } }))
        } else {
          const transporter = await createTransport()
          await transporter.sendMail({ from: process.env.FROM_EMAIL || 'no-reply@inpection.com', to: email, subject: userSubj, text: userText })
        }
      }catch(err){ console.error('send to user failed',err) }
    }

    return res.json({ ok: true })
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
  // Accept fields: firstName,lastName,mobile,email,location,carType
  const { firstName,lastName,mobile,email,location,carType } = req.body || {}
  if(!firstName || !mobile) return res.status(400).json({ error: 'firstName and mobile required' })
  try{
    const payload = { firstName,lastName,mobile,email,location,carType,receivedAt:new Date().toISOString() }

    // Save to DynamoDB if configured
    if(process.env.QUOTES_TABLE){
      try{
        const ddb = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' })
        const ddbDoc = DynamoDBDocumentClient.from(ddb)
        await ddbDoc.send(new PutCommand({ TableName: process.env.QUOTES_TABLE, Item: { id: String(Date.now()), ...payload } }))
      }catch(e){ console.error('Dynamo save failed',e); await saveToFile('quotes.json',payload) }
    } else {
      await saveToFile('quotes.json',payload)
    }

    // send admin notification
    const adminTo = process.env.NOTIFY_EMAIL || 'hello@inpection.com'
    const subject = `Quote request from ${firstName} ${lastName || ''}`
    const adminText = `Quote request:\n\nName: ${firstName} ${lastName || ''}\nMobile: ${mobile}\nEmail: ${email || '-'}\nLocation: ${location || '-'}\nCar type: ${carType || '-'}\nReceived: ${payload.receivedAt}`
    try{
      if(process.env.AWS_REGION && process.env.SES_FROM){
        const sesClient = new SESClient({ region: process.env.AWS_REGION })
        await sesClient.send(new SendEmailCommand({ Source: process.env.SES_FROM, Destination: { ToAddresses: [adminTo] }, Message: { Subject: { Data: subject }, Body: { Text: { Data: adminText } } } }))
      } else {
        const transporter = await createTransport()
        await transporter.sendMail({ from: process.env.FROM_EMAIL || 'no-reply@inpection.com', to: adminTo, subject, text: adminText })
      }
    }catch(err){ console.error('admin notify failed',err) }

    // thank you email to user
    if(email){
      const userSubj = 'Thanks for your quote request'
      const userText = `Hi ${firstName},\n\nThanks for requesting a quote. We'll reach out shortly with details.\n\nRegards,\nInspectionWale`
      try{
        if(process.env.AWS_REGION && process.env.SES_FROM){
          const sesClient = new SESClient({ region: process.env.AWS_REGION })
          await sesClient.send(new SendEmailCommand({ Source: process.env.SES_FROM, Destination: { ToAddresses: [email] }, Message: { Subject: { Data: userSubj }, Body: { Text: { Data: userText } } } }))
        } else {
          const transporter = await createTransport()
          await transporter.sendMail({ from: process.env.FROM_EMAIL || 'no-reply@inpection.com', to: email, subject: userSubj, text: userText })
        }
      }catch(err){ console.error('send to user failed',err) }
    }

    return res.json({ ok: true })
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
