import './Navbar.css'

const navItems = ['Home', 'About', 'Shop', 'Categories', 'Contact']

function Navbar({ theme, activePage, onNavigate, onThemeToggle, onAdminClick }) {
  return (
    <header className="navbar">
      <div className="navbar__brand" aria-label="MediCare logo">
        <div className="brand__logo">M</div>
        <span className="brand__name">MediCare</span>
      </div>

      <nav className="navbar__menu" aria-label="Main navigation">
        {navItems.map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className={`navbar__link${activePage === item.toLowerCase() ? ' navbar__link--active' : ''}`}
            aria-current={activePage === item.toLowerCase() ? 'page' : undefined}
            onClick={(event) => {
              if (item === 'Home' || item === 'About' || item === 'Contact') {
                event.preventDefault()
                onNavigate(item.toLowerCase())
              } else if (item === 'Shop' || item === 'Categories') {
                event.preventDefault()
                onNavigate('home')
                requestAnimationFrame(() => {
                  document.getElementById(item === 'Shop' ? 'shop' : 'categories')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                })
              }
            }}
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="navbar__actions">
        <button
          type="button"
          className="navbar__theme-toggle"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          onClick={onThemeToggle}
        >
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
            </svg>
          )}
        </button>
        <button type="button" className="navbar__admin" aria-label="Admin panel" onClick={onAdminClick}>
          <span className="admin__label">Admin</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
