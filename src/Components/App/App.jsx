import React,{ useState } from 'react';
import styles from'./App.module.css'
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify/Spotify';


function App() {
  const [searchResults, setSearchResults]= useState([ 
    {  
      name: "example track name 1",
      artist: "example track artist 1",
      album: "example track album 1",
      id: 1,
    },
  {
      name: "example track name 2",
      artist: "example track artist 2",
      album: "example track album 2",
      id: 2,
  }  
]);

const [playlistName, setPlaylistName] = useState("Example Playlist Name");
const [playlistTracks, setPlaylistTracks] = useState([
  {  
    name: "example playlist 1",
    artist: "example artist 1",
    album: "example album 1",
    id: 1,
  },
{
    name: "example playlist 2",
    artist: "example artist 2",
    album: "example album 2",
    id: 2,
}
]);

function addTrack(track){
 const existingTracks = playlistTracks.find((t) => t.id === track.id);
 const newTrack = playlistTracks.concat(track);
 if(existingTracks) {
  console.log("Track already exists");
 }else{
  setPlaylistTracks(newTrack);
 }
}

function removeTrack(track){
  const existingTracks = playlistTracks.filter((t) => t.id !== track.id);
  setPlaylistTracks(existingTracks);
}

function updatePlaylistName(name){
  setPlaylistName(name);
}

function savePlaylist(){
  const trackURIs= playlistTracks.map((t) => t.uri);
  Spotify.savePlaylist(playlistName, trackURIs).then(() => {
    updatePlaylistName("New Playlist");
    setPlaylistTracks([]);
  });
}

function search(term){
  Spotify.search(term).then(result => setSearchResults(result));
  console.log(term);
}
     
  return (
    <div>
        <h1>
          Ja<span className={styles.highlight}>mmm</span>ing
        </h1>
        <div className={styles.App}>
          {/* <!-- Add a SearchBar component --> */}
          <SearchBar onSearch={search}/>
          <div className={styles["App-playlist"]}>
            {/* <!-- Add a SearchResults component --> */}
            <SearchResults userSearchResults={searchResults} onAdd= {addTrack}/>
            {/* <!-- Add a Playlist component --> */}
            <Playlist 
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onRemove={removeTrack}
            onNameChange={updatePlaylistName}
            onSave= {savePlaylist}/>
          </div>
        </div>
      </div>
     
  );
}

export default App;
