import React from 'react';
import { Link } from "react-router-dom";
import BackgroundImage from '../assets/background.jpg';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home" style={{ backgroundImage: `url(${BackgroundImage})`}}>
      <div className="headerContainer">
        <h1>Jack of All Travel</h1>
        <p>The solution to all your travel needs.</p>
        <Link>
          <button> Plan Your Trip </button>
        </Link>
      </div>
    </div>
  )
}

export default Home