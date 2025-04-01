  // Hotels page main file

  import BackgroundImage from '../assets/hotels-background.jpg';
  import '../styles/hotels.css';
  import { SearchBar } from "../components/SearchBar";
  import { useState } from "react";

function Hotels() {
  return (
    <div className="hotels" style={{ backgroundImage: `url(${BackgroundImage})`}}>
      <div className="headerContainer">
        <h1>Hotels</h1>
      </div>
      <div className ="search-bar-container">
        <SearchBar placeholder="Search for a city to stay in..." />
      </div>
    </div>
  )
}

export default Hotels
