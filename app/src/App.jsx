import { useState } from "react";
import "./css/App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Calendar from "./pages/CalendarPage";
import Hotels from "./pages/HotelsPage";
import Flights from "./pages/FlightsPage";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Restaurants from "./pages/RestaurantsPage";

function App() {
	const [count, setCount] = useState(0);

	return (
		<div className='App'>
			<Router>
				<Navbar />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/calendar" element={<Calendar />} />
					<Route path="/flights" element={<Flights />} />
					<Route path="/hotels" element={<Hotels />} />
					<Route path="/restaurants" element={<Restaurants />} />
				</Routes>
				<Footer />
			</Router>
		</div>
	);
}

export default App;
