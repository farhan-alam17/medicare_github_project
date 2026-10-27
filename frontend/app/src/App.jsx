import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './component/Navbar'
import Cart from './component/Cart'
import Footer from './component/footer'
import Admin from './pages/Admin'
import About from './pages/About'
import Contact from './pages/Contact'
import API_BASE_URL from './api'

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [cartItems, setCartItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activePage, setActivePage] = useState('home')
  const [adminView, setAdminView] = useState('home')
  const [products, setProducts] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')

  useEffect(() => {
    if (adminView !== 'home') return undefined

    let isCurrent = true
    fetch(`${API_BASE_URL}/api/products`)
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'Could not load products.')
        }
        return data
      })
      .then((data) => {
        if (!isCurrent) return
        setProducts(data.map((product) => ({ ...product, id: product._id })))
        setCatalogError('')
      })
      .catch((requestError) => {
        if (isCurrent) setCatalogError(requestError.message)
      })
      .finally(() => {
        if (isCurrent) setCatalogLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [adminView])

  const handleAddToCart = (item) => {
    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id)

      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        )
      }

      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const categories = [...new Set(products.map((product) => product.category))]
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch = !query
      || product.name.toLowerCase().includes(query)
      || product.category.toLowerCase().includes(query)

    return matchesCategory && matchesSearch
  })

  const handleThemeToggle = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', nextTheme)
      return nextTheme
    })
  }

  const handlePageNavigate = (page) => {
    setAdminView('home')
    setActivePage(page)
  }
  const handleAboutNavigate = () => handlePageNavigate('about')
  const handleContactNavigate = () => handlePageNavigate('contact')

  return (
    <div className="app-shell" data-theme={theme}>
      <Navbar
        theme={theme}
        activePage={activePage}
        onNavigate={handlePageNavigate}
        onThemeToggle={handleThemeToggle}
        onAdminClick={() => setAdminView('admin-login')}
      />

      {adminView === 'home' && activePage === 'home' && (
        <>
          <main className="page-content">
            <section className="hero-banner">
              <div className="hero-copy">
                <p className="hero-badge"><span aria-hidden="true">✦</span> Your wellness, delivered</p>
                <h1>Everyday care,<br />made a little easier.</h1>
                <p className="hero-text">
                  Find trusted essentials for the whole family, all in one place.
                </p>
                <a className="hero-cta" href="#shop">Explore the shop <span aria-hidden="true">→</span></a>
                <div className="hero-assurance">
                  <span><span aria-hidden="true">✓</span> Carefully selected</span>
                  <span><span aria-hidden="true">✓</span> Simple, secure shopping</span>
                </div>
              </div>
              <div className="hero-visual" aria-hidden="true">
                <div className="hero-visual__orb" />
                <div className="hero-visual__plus">+</div>
                <div className="hero-visual__card">
                  <span className="hero-visual__icon">✚</span>
                  <span>Care for<br />every day</span>
                </div>
                <span className="hero-visual__spark hero-visual__spark--one">✳</span>
                <span className="hero-visual__spark hero-visual__spark--two">✦</span>
              </div>
            </section>

            {catalogError && <p className="catalog-message" role="alert">{catalogError}</p>}
            {catalogLoading ? (
              <p className="catalog-message" role="status">Loading products...</p>
            ) : products.length ? (
              <>
                <section className="shop-section" id="shop">
                  <div className="shop-heading">
                    <div>
                      <p className="shop-kicker">THE MEDICARE SHOP</p>
                      <h2>Care essentials</h2>
                      <p>Thoughtful picks for feeling your best.</p>
                    </div>
                    <label className="product-search">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="10.8" cy="10.8" r="6.3" />
                        <path d="m16 16 4 4" />
                      </svg>
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search products..."
                        aria-label="Search products"
                      />
                    </label>
                  </div>

                  <div className="shop-toolbar" id="categories">
                    <div className="category-tabs" aria-label="Product categories">
                      {['All', ...categories].map((category) => (
                        <button
                          key={category}
                          type="button"
                          className={category === activeCategory ? 'tab-button active' : 'tab-button'}
                          onClick={() => setActiveCategory(category)}
                          aria-pressed={category === activeCategory}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <span className="product-count">
                      {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                    </span>
                  </div>

                  <div className="content-layout">
                    <div className="product-sections">
                      {filteredProducts.length ? (
                        <div className="medicine-grid">
                          {filteredProducts.map((item) => (
                            <article key={item.id} className="medicine-card">
                              <div className="medicine-image-wrap">
                                <img src={item.image} alt={item.name} className="medicine-image" loading="lazy" />
                                <span className="medicine-category">{item.category}</span>
                              </div>
                              <div className="medicine-info">
                                <h3>{item.name}</h3>
                                <div className="medicine-stock">
                                  <span className={item.stock > 0 ? 'stock-dot' : 'stock-dot stock-dot--empty'} />
                                  {item.stock > 0 ? 'In stock' : 'Currently unavailable'}
                                </div>
                                <div className="medicine-meta">
                                  <span className="price">₹{item.price}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(item)}
                                    disabled={item.stock <= 0}
                                  >
                                    {item.stock <= 0 ? 'Unavailable' : 'Add to cart'}
                                  </button>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-products">
                          <span aria-hidden="true">⌕</span>
                          <h3>No products found</h3>
                          <p>Try another search or choose a different category.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('')
                              setActiveCategory('All')
                            }}
                          >
                            Clear filters
                          </button>
                        </div>
                      )}
                    </div>

                    <Cart items={cartItems} />
                  </div>
                </section>
              </>
            ) : (
              <p className="catalog-message">No products are currently available.</p>
            )}
          </main>

          <Footer onAboutClick={handleAboutNavigate} onContactClick={handleContactNavigate} />
        </>
      )}

      {adminView === 'home' && activePage === 'about' && (
        <>
          <About onBrowseShop={() => setActivePage('home')} />
          <Footer onAboutClick={handleAboutNavigate} onContactClick={handleContactNavigate} />
        </>
      )}

      {adminView === 'home' && activePage === 'contact' && (
        <>
          <Contact onBrowseShop={() => setActivePage('home')} />
          <Footer onAboutClick={handleAboutNavigate} onContactClick={handleContactNavigate} />
        </>
      )}

      {(adminView === 'admin-login' || adminView === 'admin-panel') && (
        <>
          <Admin
            view={adminView}
            onLogin={() => setAdminView('admin-panel')}
            onBackToHome={() => {
              setAdminView('home')
              setActivePage('home')
            }}
          />
          <Footer onAboutClick={handleAboutNavigate} onContactClick={handleContactNavigate} />
        </>
      )}
    </div>
  )
}

export default App
