import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

function Navbar() {
	const [isAdmin, setIsAdmin] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Check if user is admin
	useEffect(() => {
		const token = localStorage.getItem("token");
		const userString = localStorage.getItem("user");

		if (token && userString) {
			try {
				const userData = JSON.parse(userString || '{}');
				setIsAdmin(userData?.role === "admin");
				setIsLoggedIn(true);
			} catch (error) {
				console.error("Error parsing user data:", error);
				setIsAdmin(false);
				setIsLoggedIn(false);
				// Clear invalid data
				localStorage.removeItem("user");
				localStorage.removeItem("token");
			}
		} else {
			setIsAdmin(false);
			setIsLoggedIn(false);
		}
	}, []);

	return (
		<nav className="border-b bg-white sticky top-0 z-50">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link to="/" className="text-lg sm:text-xl font-bold text-blue-600">
						Kham River Monitor
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex gap-6">
						<Link
							to="/"
							className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
						>
							Home
						</Link>
						{isAdmin && (
							<Link
								to="/dashboard"
								className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
							>
								Dashboard
							</Link>
						)}
						<Link
							to="/water-quality"
							className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
						>
							Water Quality
						</Link>
						<Link
							to="/predictions"
							className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
						>
							Predictions
						</Link>
						<Link
							to="/stations"
							className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
						>
							Stations
						</Link>
						<Link
							to="/blog"
							className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
						>
							Blog
						</Link>
					</div>

					{/* Desktop Login Button */}
					<Link
						to="/login"
						className="hidden md:block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
					>
						{isLoggedIn ? 'Logout' : 'Login'}
					</Link>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
						aria-label="Toggle mobile menu"
					>
						{isMobileMenuOpen ? (
							<X className="h-6 w-6" />
						) : (
							<Menu className="h-6 w-6" />
						)}
					</button>
				</div>

				{/* Mobile Navigation Menu */}
				{isMobileMenuOpen && (
					<div className="md:hidden border-t bg-white">
						<div className="px-2 pt-2 pb-3 space-y-1">
							<Link
								to="/"
								className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-colors"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Home
							</Link>
							{isAdmin && (
								<Link
									to="/dashboard"
									className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-colors"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									Dashboard
								</Link>
							)}
							<Link
								to="/water-quality"
								className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-colors"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Water Quality
							</Link>
							<Link
								to="/predictions"
								className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-colors"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Predictions
							</Link>
							<Link
								to="/stations"
								className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-colors"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Stations
							</Link>
							<Link
								to="/blog"
								className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 transition-colors"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Blog
							</Link>
							<Link
								to="/login"
								className="block px-3 py-2 mt-4 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								{isLoggedIn ? 'Logout' : 'Login'}
							</Link>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}

export default Navbar;