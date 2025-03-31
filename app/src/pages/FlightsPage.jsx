  // Flights page main file

  import BackgroundImage from '../assets/flights-background.jpg';
  import '../styles/Flights.css';
  import { SearchBar } from "../components/SearchBar";
  import { useState } from "react";

function Flights() {
  return (
    <div className="flights" style={{ backgroundImage: `url(${BackgroundImage})`}}>
      <div className="headerContainer">
        <h1>Flights</h1>
      </div>
      <div className ="search-bar-container">
        <SearchBar placeholder="Search for a city to travel to..." />
      </div>
    </div>
  )
}

export default Flights