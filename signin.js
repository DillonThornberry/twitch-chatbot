const express = require('express')
const request = require('request')
const fs = require('fs')
const open = require('open')

require('dotenv').config()

const scope = encodeURI('user-read-playback-state user-modify-playback-state')

// Sign-in page is opened in browser
open(`https://accounts.spotify.com/en/authorize?response_type=code&scope=${scope}&redirect_uri=http:%2F%2Flocalhost:3002%2Fcallback&client_id=${process.env.SPOTIFY_CLIENT_ID}`)

const app = express()

const redirect_uri = 'http://localhost:3002/callback'

// Listen for callback from Spotify with access code
app.get('/callback', (req, res) => {
    const code = req.query.code
    if (!code){
      return res.send(JSON.stringify('Access was denied'))
    }
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
        },
        json: true
    }

    // Exchange code for refresh token and store it to a json file, then exit 
    request.post(authOptions, (error, response) => {
        const refresh_token = response.body.refresh_token
        fs.writeFile('refresh-token.json', JSON.stringify({ refresh_token }), () => {
          console.log('token overwritten')
          process.exit(1)
        })
    })

    res.send(JSON.stringify('Refresh Token was received'))
    
})

app.listen(3002, () => console.log('listening on 3002'))