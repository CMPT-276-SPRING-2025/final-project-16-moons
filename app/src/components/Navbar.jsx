import React, { useState } from 'react';
import Logo from '../assets/airplane-around-earth.png'; // ** Placeholder logo
import {Link} from 'react-router-dom';
import '../styles/Navbar.css';
import ReorderIcon from '@mui/icons-material/Reorder';

function Navbar() {

  /* Code to make navbar reactive */
  const [openLinks, setOpenLinks] = useState(false);

  const toggleNavbar = () => {
    setOpenLinks(!openLinks); 
  };

  return (
    <div className='navbar'>
        <div className='leftSide' id={openLinks ? "open" : "close"}>
            <Link to='/'>
              <img src={Logo} />
            </Link>
            <div className="hiddenLinks">
            <Link to='/'>Home</Link>  
            <Link to='/calendar'>Calendar</Link>  
            <Link to='/flights'>Flights</Link>  
            <Link to='/hotels'>Hotels</Link>
            <Link to='/restaurants'>Restaurants</Link>
            </div>
        </div>
        <div className='rightSide'>
          <Link to='/'>Home</Link>  
          <Link to='/calendar'>Calendar</Link>  
          <Link to='/flights'>Flights</Link>  
          <Link to='/hotels'>Hotels</Link>
          <Link to='/restaurants'>Restaurants</Link>
          <button onClick={toggleNavbar}>
            <ReorderIcon />
          </button>  
        </div>
    </div>
  )
}

export default Navbar