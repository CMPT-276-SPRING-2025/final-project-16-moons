import React, { useState } from "react";
import {FaSearch} from "react-icons/fa";
import "../styles/SearchBar.css";

export const SearchBar = () => {
    const [input, setInput] = useState("");

    return (
        <div className = "input-wrapper">
            <FaSearch id="search-icon" />
            <input 
                type="text"
                placeholder = "Type to search..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
        </div>    
    )
};