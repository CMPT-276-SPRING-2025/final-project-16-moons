  // Restaurants page main file

  import BackgroundImage from '../assets/restaurants-background.jpeg';
  import '../styles/restaurants.css';
  import { SearchBar } from "../components/SearchBar";
  import { useState } from "react";

function Restaurants() {
  return (
    <div className="restaurants" style={{ backgroundImage: `url(${BackgroundImage})`}}>
      <div className="headerContainer">
        <h1>Restaurants</h1>
      </div>
      <div className ="search-bar-container">
        <SearchBar placeholder="Search for restaurants..." />
      </div>
    </div>
  )
}

export default Restaurants
