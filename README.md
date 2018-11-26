## Spotify Playlist with Expiring Tracks
Keep a spotify playlist fresh by setting a limit on the number of days a song will stay on the playlist and archive expired songs in a separate list. 

### Getting Started
1. run `npm install`
2. run `npm run dotenv`
3. Add spotify credentials to .env file (Client ID, Client Secret, Refresh Token, Playlist IDs etc.)
4. run the script `node index.js`

### Setting up on AWS Lambda and Cloudwatch
This is intended to be set up as a Lambda function and run periodically with a Cloudwatch rule in [AWS](https://aws.amazon.com/)
