import React from 'react';
import '../styles/Footer.css';
import EmailIcon from '@mui/icons-material/Email';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';

function Footer() {
  return (
    <div className="footer">
        <div className="contact">
            <EmailIcon /> <LocalPhoneIcon /> <LinkedInIcon /> <LiveHelpIcon />
        </div>
        <p>&copy; 2025 jackofalltravel.com</p>
    </div>
  )
}

export default Footer