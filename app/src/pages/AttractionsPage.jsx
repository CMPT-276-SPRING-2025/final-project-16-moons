  // Attractions page main file

  import BackgroundImage from '../assets/attractions-background.jpeg';
  import '../styles/Attractions.css';
  import { SearchBar } from "../components/SearchBar";
  import { useState } from "react";

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
