let accessToken;
const clientID = "33f3571bade14ddc82fa6182e542ffdd";
const redirectURL = "http://[::1]:5173/callback";
const scope = "playlist-modify-public";

function generateCodeVerifier(length = 128) {
   const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
   let verifier = '';
   for (let i = 0; i < length; i++){
      verifier += possible.charAt(Math.floor(Math.random() * possible.length));
   }
   return verifier;
}

async function generateCodeChallenge(codeVerifier) {
   const encoder = new TextEncoder();
   const data = encoder.encode(codeVerifier);
   const digest = await window.crypto.subtle.digest('SHA-256', data);
   const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
   .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
   return base64;
}

const Spotify = {
   async getAccessToken(){
      if (accessToken) return accessToken;

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code){
         const codeVerifier = localStorage.getItem("code_verifier");
         const body = new URLSearchParams({
            client_id: clientID,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectURL,
            code_verifier: codeVerifier
         });

         const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded"},
            body: body
         });

         const data = await response.json();
         accessToken = data.access_token;

         window.history.replaceState({}, document.title, "/");
         return accessToken;
      }

      const codeVerifier = generateCodeVerifier();
      localStorage.setItem("code_verifier", codeVerifier);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=code&redirect_uri=${encodeURIComponent(redirectURL)}&scope=${encodeURIComponent(scope)}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
      window.location = authUrl;
   },


async search(term){
    const token = await this.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
       headers: {Authorization: `Bearer ${token}`},
    })
    .then((response) => response.json())
    .then((jsonResponse) => {
        if(!jsonResponse.tracks){
           return [];
        }
 
        return jsonResponse.tracks.items.map(t => ({
            id: t.id,
            name: t.name,
            artist: t.artists[0].name,
            album: t.album.name,
            uri: t.uri,
            albumImage: t.album.images[0]?.url
     } ));
    });
   },
   
async savePlaylist(name, trackUris) {
   if (!name || !trackUris) return;
   const token = await Spotify.getAccessToken();
   const header = { Authorization: `Bearer ${token}`};

   const userResponse = await fetch (`https://api.spotify.com/v1/me`, { headers: header });
   const userId = (await userResponse.json()).id;

   const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
         ...header,
         "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: name })
   });

   const playlistId = (await playlistResponse.json()).id;

   return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
         ...header,
         "Content-Type": "application/json"
      },
      body: JSON.stringify({ uris: trackUris })
   });

},

};
export default Spotify;