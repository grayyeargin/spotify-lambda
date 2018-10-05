const request = require('request')

const tokenOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')) },
    form: {
      	grant_type: 'refresh_token',
      	refresh_token: process.env.REFRESH_TOKEN
    },
    json: true
}

const getAccessToken = () => {
	return new Promise(function (res, rej) {
		request.post(authOptions, function(error, response, body) {
		    if (!error && response.statusCode === 200) {
		      	res(body.access_token)
		    } else {
		    	rej(error)
		    }
		})
	}
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
	}
}

exports.handler = async (event) => {
    const accessToken = await getAccessToken()
    const me = await promiseRequest({
	  	url: 'https://api.spotify.com/v1/me',
	  	headers: { 'Authorization': 'Bearer ' + accessToken },
	  	json: true
	})

	return me
}