const request = require('request')

const tokenOptions = {
    url: `https://accounts.spotify.com/api/token`,
    headers: { 'Authorization': 'Basic ' + (new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')) },
    form: {
      	grant_type: `refresh_token`,
      	refresh_token: process.env.REFRESH_TOKEN
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
		url: `https://api.spotify.com/v1/playlists/${process.env.CURRENT_PL}/tracks`,
		headers: { 'Authorization': `Bearer ${accessToken}` },
		json: true
	})

	const expireAfterDays = 90
	const expiredTime = new Date(+ new Date() - 60 * 60 * 24 * 1000 * expireAfterDays).getTime()
	const oldTracks = playlist.items.filter(track => new Date(track.added_at).getTime() < expiredTime)
	const uris = oldTracks.map(track => track.track.uri)

	await new Promise(function (res, rej) {
		request.del({
			url: `https://api.spotify.com/v1/playlists/${process.env.CURRENT_PL}/tracks`,
			headers: { 'Authorization': `Bearer ${accessToken}` },
			body: JSON.stringify({
				tracks: uris.map(uri => ({uri}))
		  	})
		}, function(error, response, body) {
			if (!error && response.statusCode === 200) res(body)
			rej(error)
		})
	})

	await new Promise(function (res, rej) {
		request.post({
			url: `https://api.spotify.com/v1/playlists/${process.env.ARCHIVED_PL}/tracks`,
			headers: { 'Authorization': `Bearer ${accessToken}` },
			body: JSON.stringify({
				uris: uris
			})
		}, function(error, response, body) {
			if (!error && response.statusCode === 200) res(body)
			rej(error)
		})
	})
}
