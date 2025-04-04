import React from 'react';
import '../styles/Footer.css';
import {Link} from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import airplaneImage from '../assets/airplane-around-earth.png';

function Footer() {
  return (
    <div className="footer">
      <div className="footer-top">
        <div className="footer-logo">
          <Link to='/'>
            <img src={airplaneImage} alt="Airplane around Earth" />
          </Link>
        </div>
        <div className="footer-columns">
          <div className="footer-column">
            <h3>Contact</h3>
            <p>Nicole Stuart | <span>nds11@sfu.ca</span></p>
            <p>Jessica Fang | <span>jessica_fang@sfu.ca</span></p>
            <p>Jessica Liu | <span>jessica_liu_8@sfu.ca</span></p>
            <p>Rohin Aulakh | <span>rohin_aulakh@sfu.ca</span></p>
          </div>
          <div className="footer-column">
            <h3>Services</h3>
            <div className="service-link">
              <CalendarMonthIcon />
              <Link to='/calendar'>Calendar</Link>
            </div>
            <div className="service-link">
              <FlightIcon />
              <Link to='/flights'>Flights</Link>
            </div>
            <div className="service-link">
              <HotelIcon />
              <Link to='/hotels'>Hotels</Link>
            </div>
            <div className="service-link">
              <RestaurantIcon />
              <Link to='/restaurants'>Restaurants</Link>
            </div>
          </div>
          <div className="footer-column">
            <h3>Social</h3>
            <div className="socials">
              <a href="https://github.com/Nic-Stuart" target="_blank">
                <GitHubIcon />
              </a>
              <a href="https://github.com/fangjess" target="_blank">
                <GitHubIcon />
              </a>
              <a href="https://github.com/AngelxHaven" target="_blank">
                <GitHubIcon />
              </a>
              <a href="https://github.com/rohin19" target="_blank">
                <GitHubIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-divider"></div>
      <div className="footer-bottom">
        <p>CMPT 276 - Group 16</p>
        <p>Copyright &copy; JackofAllTravel 2025</p>
      </div>
    </div>
  )
}

export default Footer