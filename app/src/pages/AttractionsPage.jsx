  // Attractions page main file

  import BackgroundImage from '../assets/attractions-background.jpg';
  import '../styles/Attractions.css';
  import { SearchBar } from "../components/SearchBar.jsx";

function Attractions() {
  return (
    <div className="attractions" style={{ backgroundImage: `url(${BackgroundImage})`}}>
      <div className="headerContainer">
        <h1>Attractions</h1>
      </div>
      <div className ="search-bar-container">
        <SearchBar />
      </div>
    </div>
  )
}

export default Attractions
