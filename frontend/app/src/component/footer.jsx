import './footer.css'

function Footer({ onAboutClick, onContactClick }) {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__brand">
          <h3>MediCare</h3>
          <p>Your trusted source for health and wellness essentials.</p>
        </div>

        <div className="footer__links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li>
              <a
                href="#about"
                onClick={(event) => {
                  event.preventDefault()
                  onAboutClick()
                }}
              >
                About
              </a>
            </li>
            <li><a href="#shop">Shop</a></li>
            <li>
              <a
                href="#contact"
                onClick={(event) => {
                  event.preventDefault()
                  onContactClick()
                }}
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div className="footer__links">
          <h4>Categories</h4>
          <ul>
            <li><a href="#fever">Fever</a></li>
            <li><a href="#cough">Cough</a></li>
            <li><a href="#general">General</a></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© 2026 MediCare. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer