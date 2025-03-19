import React from 'react';
import Logo from '../assets/airplane-icon.svg'; // ** Placeholder logo
import {Link} from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  return (
    <div className='navbar'>
        <div className='leftSide'>
            <img src={Logo} />
        </div>
        <div className='rightSide'>
          <Link to='/'>Home</Link>  
          <Link to='/calendar'>Calendar</Link>  
          <Link to='/flights'>Flights</Link>  
          <Link to='/attractions'>Attractions</Link>  
        </div>
    </div>
  )
}

export default Navbar