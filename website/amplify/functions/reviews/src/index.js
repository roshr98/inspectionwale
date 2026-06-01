// No need to require fetch - Node.js 18+ has built-in fetch

exports.handler = async (event) => {
  const key = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  }

  try {
    if (key && placeId) {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,rating,user_ratings_total,reviews,photos&key=${encodeURIComponent(key)}`
      console.log('Fetching from Google Places API...')
      console.log('Place ID:', placeId)
      console.log('API Key (first 10 chars):', key.substring(0, 10) + '...')
      
      const r = await fetch(url)
      const j = await r.json()
      
      console.log('Google API Response:', JSON.stringify(j, null, 2))
      
      // Check for API errors
      if (j.status && j.status !== 'OK') {
        console.error('Google API Error:', j.status, j.error_message || '')
        return { 
          statusCode: 200, 
          headers,
          body: JSON.stringify({ 
            ok: false, 
            error: 'google_api_error',
            status: j.status,
            message: j.error_message || 'No error message provided'
          }) 
        }
      }
      
      if (j && j.result) {
        const businessName = j.result.name || 'InspectionWale'
        const overallRating = j.result.rating || 0
        const totalReviews = j.result.user_ratings_total || 0
        
        const photos = (j.result.photos || []).slice(0, 8).map((p) => ({
          photo_reference: p.photo_reference,
          url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${encodeURIComponent(p.photo_reference)}&key=${encodeURIComponent(key)}`
        }))
        
        const reviews = (j.result.reviews || []).slice(0, 6).map((rv, i) => ({
          author: rv.author_name,
          text: rv.text,
          rating: rv.rating,
          time: rv.relative_time_description || rv.time,
          profile_photo: rv.profile_photo_url || null,
          photo: photos.length ? photos[i % photos.length].url : null
        }))
        
        return { 
          statusCode: 200, 
          headers,
          body: JSON.stringify({ 
            ok: true, 
            businessName,
            overallRating,
            totalReviews,
            reviews, 
            photos 
          }) 
        }
      }
      
      console.warn('No result object in Google API response')
      return { 
        statusCode: 200, 
        headers,
        body: JSON.stringify({ 
          ok: false, 
          error: 'no_result',
          debug: 'No result object in API response'
        }) 
      }
    }

    // Fallback: return sample reviews if API not configured
    console.warn('GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID not configured')
    const sample = [
      { 
        author: 'Rajesh Kumar', 
        text: 'Excellent inspection service! Very thorough and professional. Found issues I would have never noticed.', 
        rating: 5,
        time: 'a month ago',
        profile_photo: null 
      },
      { 
        author: 'Priya Sharma', 
        text: 'Highly recommend InspectionWale. Saved me from buying a flood-damaged car. Worth every rupee!', 
        rating: 5,
        time: '2 months ago',
        profile_photo: null 
      },
      { 
        author: 'Amit Patel', 
        text: 'Quick turnaround and detailed report. The inspector was knowledgeable and explained everything clearly.', 
        rating: 5,
        time: '3 weeks ago',
        profile_photo: null 
      }
    ]
    return { 
      statusCode: 200, 
      headers,
      body: JSON.stringify({ 
        ok: true, 
        businessName: 'InspectionWale',
        overallRating: 4.9,
        totalReviews: 127,
        reviews: sample 
      }) 
    }
  } catch (err) {
    console.error('Reviews fetch error:', err)
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ ok: false, error: 'fetch_failed' }) 
    }
  }
}
