let express = require('express')
let request = require('request')

const app = express();
const port = 8888;

const redirect_uri = 'http://localhost:8888/callback'

app.get('/login', (req, res) => {
    let scopes = 'user-read-recently-played user-top-read';
    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + process.env.SPOTIFY_CLIENT_ID +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(redirect_uri));
});

app.get('/callback', (req, res) => {
    let code = req.query.code || null
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(
                process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
            ).toString('base64'))
        },
        json: true
    }
    request.post(authOptions, function (error, response, body) {
        var access_token = body.access_token
        let uri = process.env.FRONTEND_URI || 'http://localhost:3000'
        res.redirect(uri + '?access_token=' + access_token)
    })
});

app.listen(port);