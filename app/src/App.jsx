import { useState } from "react";
import "./css/App.css";
import Navbar from "./components/Navbar";
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'

function App() {
	const [count, setCount] = useState(0);

	return (
		<div className='App'>
			<Navbar />
			<h1>Final Project</h1>
		</div>
	);
}

export default App;
