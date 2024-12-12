import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link as ScrollLink } from 'react-scroll';
import './Navbar.css';
import Modal from './Modal';

const Navbar = () => {
    const { currentUser, login, logout } = useContext(AuthContext);
    const { cart } = useCart();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loginError, setLoginError] = useState(null);
    const [registerError, setRegisterError] = useState(null);

    const userMenuRef = useRef(null);
    const hamburgerMenuRef = useRef(null);

    const [showUserMenu, setShowUserMenu] = useState(false);
    

    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

    const isLoggedIn = !!currentUser;
    const isAdmin = currentUser?.isAdmin;
    const navigate = useNavigate();

    const navigateToSection = (section) => {
        navigate('/'); // Átirányít a főoldalra
        setTimeout(() => {
            document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
        }, 100); // Vár egy kicsit, hogy a főoldal betöltődjön
    };
    

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target) &&
                (!isMobileView || showUserMenu)
            ) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isMobileView, showUserMenu]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                hamburgerMenuRef.current &&
                !hamburgerMenuRef.current.contains(event.target) &&
                showHamburgerMenu
            ) {
                setShowHamburgerMenu(false);
            }
        };
    
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [showHamburgerMenu]);
    

    const handleLoginOpen = () => setShowLoginModal(true);
    const handleLoginClose = () => setShowLoginModal(false);
    const handleRegisterOpen = () => setShowRegisterModal(true);
    const handleRegisterClose = () => setShowRegisterModal(false);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError(null);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data.token);
                handleLoginClose();
            } else {
                setLoginError(data.message || 'Hiba történt a bejelentkezés során.');
            }
        } catch (err) {
            setLoginError('Hiba történt a bejelentkezés során.');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setRegisterError(null);

        if (registerPassword !== confirmPassword) {
            setRegisterError('A jelszavaknak egyezniük kell!');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password: registerPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                handleRegisterClose();
            } else {
                setRegisterError(data.message || 'Hiba történt a regisztráció során.');
            }
        } catch (err) {
            setRegisterError('Hiba történt a regisztráció során.');
        }
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();

        if (!searchQuery.trim()) return;

        try {
            const response = await fetch('http://localhost:5000/api/products/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: searchQuery }),
            });

            const data = await response.json();
            setSearchResults(data);
            setShowSearchModal(true); // Mutassa a keresési eredményeket modális ablakban
        } catch (err) {
            console.error('Hiba történt a keresés során:', err);
        }
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
    };

    const toggleHamburgerMenu = () => setShowHamburgerMenu(!showHamburgerMenu);

    return (
        <nav className="navbar">
            {/* Hamburger ikon */}
            <div className="hamburger" onClick={toggleHamburgerMenu}>
                <div className={`line ${showHamburgerMenu ? 'active' : ''}`}></div>
                <div className={`line ${showHamburgerMenu ? 'active' : ''}`}></div>
                <div className={`line ${showHamburgerMenu ? 'active' : ''}`}></div>
            </div>

            {/* Hamburger menü (mobil) */}
            <div className={`hamburger-menu ${showHamburgerMenu ? 'open' : ''}`}
                ref={hamburgerMenuRef}
            >
                <ul>
                        <li onClick={() => {
            navigateToSection('categories');
            setShowHamburgerMenu(false); // Bezárja a menüt
        }}>
            Kategóriák
        </li>
        <li onClick={() => {
            navigateToSection('popular-products');
            setShowHamburgerMenu(false);
        }}>
            Népszerű termékek
        </li>
        <li onClick={() => {
            navigateToSection('blog');
            setShowHamburgerMenu(false);
        }}>
            Blog
        </li>
        <li onClick={() => {
            navigateToSection('contact');
            setShowHamburgerMenu(false);
        }}>
            Kapcsolat
        </li>
                    <li>
                        {/* Keresőmező (mobil) */}
                        <form onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                placeholder="Keresés..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                    </li>
                </ul>
            </div>

            {/* Logó */}
            <Link to="/" className="logo">
                <img src="/images/PárlatPatikaLogo.png" alt="Prémium Italok Logó" className="logo-image" />
            </Link>

            {/* Navigációs linkek */}
            <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                <li onClick={() => navigateToSection('categories')}>
                    <span>Kategóriák</span>
                </li>
                <li onClick={() => navigateToSection('popular-products')}>
                    <span>Népszerű termékek</span>
                </li>
                <li onClick={() => navigateToSection('blog')}>
                    <span>Blog</span>
                </li>
                <li onClick={() => navigateToSection('contact')}>
                    <span>Kapcsolat</span>
                </li>

                <li>
                    {/* Keresőmező (desktop) */}
                    <form onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Keresés..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </li>
            </ul>

            {/* Navbar ikonok */}
            <div className="navbar-icons">
                {isLoggedIn ? (
                    <div
                        className="user-menu"
                        ref={userMenuRef}
                        onMouseLeave={!isMobileView ? () => setShowUserMenu(false) : undefined}
                    >
                        <i
                            className="fas fa-user"
                            onClick={() => setShowUserMenu((prev) => !prev)}
                        ></i>
                        {showUserMenu && (
                            <div className="user-dropdown">
                                <p>Belépve, mint: {currentUser.email}</p>
                                <ul>
                                    <li><Link to="/details">Adataim</Link></li>
                                    <li><Link to="/orders">Megrendelések</Link></li>
                                    <li><Link to="/favourites">Kedvencek</Link></li>
                                    {isAdmin && <li><Link to="/admin">Admin Funkciók</Link></li>}
                                </ul>
                                <button onClick={handleLogout}>Kilépés</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <i className="fas fa-user" onClick={() => setShowLoginModal(true)}></i>
                )}
                <Link to="/cart" className="cart-link">
                    <i className="fas fa-shopping-cart"></i>
                    <span className="cart-count">{cart.length}</span>
                </Link>
            </div>

            {/* Bejelentkezési modális ablak */}
            {/* Bejelentkezési modális ablak */}
<Modal
    showModal={showLoginModal}
    handleClose={handleLoginClose}
    title="Bejelentkezés"
>
    <form onSubmit={handleLoginSubmit}>
        <label>Email:</label>
        <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
        />
        <label>Jelszó:</label>
        <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
        />
        <button type="submit">Bejelentkezés</button>
        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
    </form>

    {/* Új regisztrációs gomb a modális alján */}
    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <p>Még nincs fiókod?</p>
        <button 
            type="button" 
            style={{ 
                background: 'none', 
                color: 'blue', 
                textDecoration: 'underline', 
                cursor: 'pointer' 
            }}
            onClick={() => {
                handleLoginClose();
                navigate('/register');
            }}
        >
            Regisztrálj most!
        </button>
    </div>
</Modal>


            {/* Regisztrációs modális ablak */}
            <Modal
                showModal={showRegisterModal}
                handleClose={handleRegisterClose}
                title="Regisztráció"
            >
                <form onSubmit={handleRegisterSubmit}>
                    <label>Felhasználónév:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label>Jelszó:</label>
                    <input
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                    />
                    <label>Jelszó megerősítése:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Regisztráció</button>
                    {registerError && <p style={{ color: 'red' }}>{registerError}</p>}
                </form>
            </Modal>

            {/* Keresési eredmények modális ablak */}
            {showSearchModal && (
                <Modal
                    showModal={showSearchModal}
                    handleClose={() => setShowSearchModal(false)}
                    title="Keresési találatok"
                >
                    {searchResults.length > 0 ? (
                        <ul>
                            {searchResults.map((product) => (
                                <li key={product._id}>
                                    <Link to={`/product/${product._id}`} onClick={() => setShowSearchModal(false)}>
                                        {product.name} - {product.price} Ft
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Nincs találat.</p>
                    )}
                </Modal>
            )}
        </nav>
    );
};

export default Navbar;
