const fetch = require('node-fetch')

exports.handler = async (event) => {
  const key = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID
  try {
    if (key && placeId) {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews,photos&key=${encodeURIComponent(key)}`
      const r = await fetch(url)
      const j = await r.json()
      if (j && j.result) {
        const photos = (j.result.photos || []).slice(0, 8).map((p) => ({
          photo_reference: p.photo_reference,
          url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${encodeURIComponent(p.photo_reference)}&key=${encodeURIComponent(key)}`
        }))
        const reviews = (j.result.reviews || []).slice(0, 8).map((rv, i) => ({
          author: rv.author_name,
          text: rv.text,
          rating: rv.rating,
          relative_time_description: rv.relative_time_description,
          profile_photo: rv.profile_photo_url || null,
          photo: photos.length ? photos[i % photos.length].url : null
        }))
        return { statusCode: 200, body: JSON.stringify({ ok: true, reviews, photos }) }
      }
      return { statusCode: 200, body: JSON.stringify({ ok: false, error: 'no_result' }) }
    }

    // fallback: return a small sample
    const sample = [
      { author: 'Test User', text: 'Great inspection service!', rating: 5 },
      { author: 'Another User', text: 'Thorough and quick.', rating: 5 }
    ]
    return { statusCode: 200, body: JSON.stringify({ ok: true, reviews: sample }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'fetch_failed' }) }
  }
}
