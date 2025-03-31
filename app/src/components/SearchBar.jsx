import React, { useState } from "react";
import {FaSearch} from "react-icons/fa";
import "../styles/SearchBar.css";

export const SearchBar = ({ placeholder = "Type to search..." }) => {
    const [input, setInput] = useState("");

    return (
        <div className = "input-wrapper">
            <FaSearch id="search-icon" />
            <input 
                type="text"
                placeholder={placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
        </div>    
    )
};