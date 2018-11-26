const request = require('request')

require('dotenv').config()

const {CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, CURRENT_PL, ARCHIVED_PL, DAYS_TO_EXPIRE} = process.env

const tokenOptions = {
    url: `https://accounts.spotify.com/api/token`,
    headers: { 'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')) },
    form: {
      	grant_type: `refresh_token`,
      	refresh_token: REFRESH_TOKEN
    },
    json: true
}

const getAccessToken = () => {
	return new Promise(function (res, rej) {
		request.post(tokenOptions, function(error, response, body) {
		    if (!error && response.statusCode === 200) {
		      	res(body.access_token)
		    } else {
		    	rej(error)
		    }
		})
	})
}

const promiseRequest = (options) => {
	return new Promise(function (res, rej) {
		request.get(options, function(error, response, body) {
		    if (!error && response.statusCode === 200) {
		      	res(body)
		    } else {
		    	rej(error)
		    }
		})
	})
}

exports.handler = async () => {
	const accessToken = await getAccessToken()

	const playlist = await promiseRequest({
		url: `https://api.spotify.com/v1/playlists/${CURRENT_PL}/tracks`,
		headers: { 'Authorization': `Bearer ${accessToken}` },
		json: true
	})

	const expiredTime = new Date(+ new Date() - 60 * 60 * 24 * 1000 * parseInt(DAYS_TO_EXPIRE)).getTime()
	const oldTracks = playlist.items.filter(track => new Date(track.added_at).getTime() < expiredTime)
	const uris = oldTracks.filter(track => !track.track.is_local).map(track => track.track.uri)

    console.log(uris)
	await new Promise(function (res, rej) {
		request.del({
			url: `https://api.spotify.com/v1/playlists/${CURRENT_PL}/tracks`,
			headers: { 'Authorization': `Bearer ${accessToken}` },
			body: JSON.stringify({
				tracks: uris.map(uri => ({uri}))
		  	})
		}, function(error, response, body) {
			if (!error && response.statusCode === 200) return res(body)
			rej(error)
		})
	})

	await new Promise(function (res, rej) {
		request.post({
			url: `https://api.spotify.com/v1/playlists/${ARCHIVED_PL}/tracks`,
			headers: { 'Authorization': `Bearer ${accessToken}` },
			body: JSON.stringify({
				uris: uris
			})
		}, function(error, response, body) {
			if (!error && response.statusCode === 201) return res(body)
			rej(error)
		})
	})
}