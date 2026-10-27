import { useState } from 'react'
import './Admin.css'
import API_BASE_URL from '../api'

function Admin({ view, onLogin, onBackToHome }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Fever',
    price: '',
    stock: '',
  })

  const apiRequest = async (path, options = {}, authToken = token) => {
    const response = await fetch(`${API_BASE_URL}/api${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    })

    const data = response.status === 204 ? null : await response.json()
    if (!response.ok) {
      throw new Error(data?.message || 'The request could not be completed.')
    }

    return data
  }

  const loadProducts = async (authToken = token) => {
    setIsLoading(true)
    setError('')
    try {
      setProducts(await apiRequest('/admin/products', { cache: 'no-store' }, authToken))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Login failed.')
      }
      setToken(data.token)
      onLogin()
      await loadProducts(data.token)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePriceUpdate = async (id, newPrice, originalPrice) => {
    const price = Number(newPrice)
    if (!Number.isFinite(price) || price < 0) {
      setError('Price must be zero or greater.')
      setProducts((previous) => previous.map((product) =>
        product._id === id ? { ...product, price: originalPrice } : product,
      ))
      return
    }

    try {
      const updatedProduct = await apiRequest(`/admin/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ price }),
      })
      setProducts((previous) => previous.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product,
      ))
      setError('')
    } catch (requestError) {
      setError(requestError.message)
      setProducts((previous) => previous.map((product) =>
        product._id === id ? { ...product, price: originalPrice } : product,
      ))
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()

    if (!newProduct.name.trim() || newProduct.price === '' || newProduct.stock === '') {
      setError('Complete all product fields before adding a product.')
      return
    }

    try {
      const product = await apiRequest('/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          ...newProduct,
          name: newProduct.name.trim(),
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
        }),
      })
      setProducts((previous) => [product, ...previous])
      setNewProduct({ name: '', category: 'Fever', price: '', stock: '' })
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleDeleteProduct = async (id) => {
    try {
      await apiRequest(`/admin/products/${id}`, { method: 'DELETE' })
      setProducts((previous) => previous.filter((product) => product._id !== id))
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const stockColors = ['#248277', '#e3a23b', '#527ca5', '#c86c52', '#8064a2']
  const stockByCategory = Object.values(products.reduce((categories, product) => {
    const category = categories[product.category] || {
      name: product.category,
      productCount: 0,
      stock: 0,
    }
    category.productCount += 1
    category.stock += Number(product.stock)
    categories[product.category] = category
    return categories
  }, {}))
  const totalStock = stockByCategory.reduce((total, category) => total + category.stock, 0)
  let currentAngle = 0
  const pieSlices = stockByCategory.map((category, index) => {
    const nextAngle = totalStock
      ? currentAngle + (category.stock / totalStock) * 360
      : currentAngle
    const slice = `${stockColors[index % stockColors.length]} ${currentAngle}deg ${nextAngle}deg`
    currentAngle = nextAngle
    return slice
  })
  const stockPieBackground = totalStock
    ? `conic-gradient(${pieSlices.join(', ')})`
    : '#e2e8f0'

  if (view === 'admin-login') {
    return (
      <div className="admin-page">
        <div className="admin-login-box">
          <div className="login-header">
            <h2>Admin Login</h2>
            <p>Welcome back! Please login to continue.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </label>

            <div className="login-actions">
              <button type="submit" className="primary-btn" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <button type="button" className="secondary-btn" onClick={onBackToHome}>
                Back to Home
              </button>
            </div>
            {error && <p className="admin-error" role="alert">{error}</p>}
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page admin-panel-page">
      <div className="admin-panel-header">
        <div>
          <p className="panel-tag">Admin Panel</p>
          <h2>MediCare Dashboard</h2>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="secondary-btn" onClick={() => loadProducts()} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button type="button" className="secondary-btn" onClick={onBackToHome}>
            Logout
          </button>
        </div>
      </div>

      <section className="admin-overview" aria-label="Inventory overview">
        <div className="admin-stat-grid">
          <div className="stat-card">
            <span>Low Stock</span>
            <strong>{products.filter((product) => product.stock <= 20).length}</strong>
          </div>
          <div className="stat-card">
            <span>Avg Price</span>
            <strong>
              ₹{products.length
                ? Math.round(products.reduce((sum, product) => sum + Number(product.price), 0) / products.length)
                : 0}
            </strong>
          </div>
        </div>

        <section className="panel-box stock-chart-panel" aria-labelledby="stock-chart-title">
          <div className="box-header">
            <h3 id="stock-chart-title">Stock by Category</h3>
          </div>
          <div className="stock-chart-layout">
            <div
              className="stock-pie"
              role="img"
              aria-label={stockByCategory.map((category) =>
                `${category.name}: ${category.stock} units across ${category.productCount} products`,
              ).join('. ') || 'No stock data available'}
              style={{ background: stockPieBackground }}
            />
            <div className="stock-chart-details">
              <div className="stock-chart-totals">
                <div>
                  <strong>{products.length}</strong>
                  <span>Total products</span>
                </div>
                <div>
                  <strong>{totalStock}</strong>
                  <span>Stock units</span>
                </div>
              </div>
              <ul className="stock-chart-legend">
                {stockByCategory.map((category, index) => (
                  <li key={category.name}>
                    <span
                      className="stock-chart-swatch"
                      style={{ backgroundColor: stockColors[index % stockColors.length] }}
                    />
                    <span className="stock-chart-category">{category.name}</span>
                    <span>{category.productCount} products</span>
                    <strong>{category.stock} units</strong>
                  </li>
                ))}
                {!stockByCategory.length && <li>No stock data available.</li>}
              </ul>
            </div>
          </div>
        </section>
      </section>

      {error && <p className="admin-error" role="alert">{error}</p>}

      <div className="admin-content-grid">
        <div className="panel-box">
          <div className="box-header">
            <h3>Add New Product</h3>
          </div>

          <form className="product-form" onSubmit={handleAddProduct}>
            <label>
              Product Name
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Enter product name"
              />
            </label>

            <label>
              Category
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              >
                <option value="Fever">Fever</option>
                <option value="Cough">Cough</option>
                <option value="General">General</option>
              </select>
            </label>

            <label>
              Price
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="Enter price"
              />
            </label>

            <label>
              Stock
              <input
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                placeholder="Enter stock"
              />
            </label>

            <button type="submit" className="primary-btn full-width" disabled={isLoading}>
              Add Product
            </button>
          </form>
        </div>

        <div className="panel-box">
          <div className="box-header">
            <h3>Manage Products</h3>
          </div>

          <div className="product-table-wrap">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>
                      <input
                        type="number"
                        value={product.price}
                        min="0"
                        onFocus={(e) => {
                          e.currentTarget.dataset.originalPrice = String(product.price)
                        }}
                        onBlur={(e) => {
                          const originalPrice = Number(e.currentTarget.dataset.originalPrice)
                          if (Number(e.target.value) !== originalPrice) {
                            handlePriceUpdate(product._id, e.target.value, originalPrice)
                          }
                        }}
                        onChange={(e) => setProducts((previous) => previous.map((item) =>
                          item._id === product._id ? { ...item, price: e.target.value } : item,
                        ))}
                      />
                    </td>
                    <td>{product.stock}</td>
                    <td>
                      <button
                        type="button"
                        className="delete-product-btn"
                        onClick={() => handleDeleteProduct(product._id)}
                        aria-label={`Delete ${product.name}`}
                        title="Delete product"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!isLoading && products.length === 0 && (
                  <tr><td colSpan="5">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin