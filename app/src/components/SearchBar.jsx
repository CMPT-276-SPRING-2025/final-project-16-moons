import React, { useState } from "react";
import {FaSearch} from "react-icons/fa";
import "../styles/SearchBar.css";

export const SearchBar = ({ placeholder = "Type to search...", onSearch = () => {} }) => {
    const [input, setInput] = useState("");
    
    const handleSearch = () => {
        if (input.trim()) {
            onSearch(input);
        }
    };
    // if enter key is pressed, handle search
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="input-wrapper">
            <FaSearch id="search-icon" onClick={handleSearch} />
            <input 
                type="text"
                placeholder={placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
            />
        </div>    
    );
};