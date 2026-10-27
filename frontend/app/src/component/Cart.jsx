import { jsPDF } from 'jspdf'
import './Cart.css'

function Cart({ items = [] }) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.05
  const totalPrice = subtotal + tax

  const handleDownloadBill = () => {
    if (!items.length) return

    const doc = new jsPDF()
    const billDate = new Date().toLocaleDateString()
    const billNumber = `MED-${Math.floor(Math.random() * 9000 + 1000)}`

    doc.setFillColor(224, 242, 254)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setFontSize(20)
    doc.setTextColor(15, 23, 42)
    doc.text('MediCare Pharmacy', 14, 18)
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    doc.text(`Bill No: ${billNumber}`, 14, 28)
    doc.text(`Date: ${billDate}`, 14, 34)

    doc.setTextColor(15, 23, 42)
    doc.setFontSize(12)
    doc.text('Item Details', 14, 55)

    let y = 66
    items.forEach((item) => {
      const itemTotal = item.price * item.quantity
      doc.setFontSize(10)
      doc.setTextColor(15, 23, 42)
      doc.text(`${item.name} x ${item.quantity}`, 14, y)
      doc.text(`₹${itemTotal}`, 170, y, { align: 'right' })
      y += 8
    })

    doc.setDrawColor(203, 213, 225)
    doc.line(14, y + 4, 196, y + 4)

    y += 12
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    doc.text('Subtotal', 14, y)
    doc.text(`₹${subtotal}`, 170, y, { align: 'right' })

    y += 8
    doc.text('Tax (5%)', 14, y)
    doc.text(`₹${tax.toFixed(2)}`, 170, y, { align: 'right' })

    y += 10
    doc.setFontSize(12)
    doc.setTextColor(15, 23, 42)
    doc.text('Total', 14, y)
    doc.text(`₹${totalPrice.toFixed(2)}`, 170, y, { align: 'right' })

    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    doc.text('Thank you for shopping with MediCare.', 14, 260)

    doc.save('MediCare-Bill.pdf')
  }

  return (
    <aside className="cart-panel">
      <div className="cart-header">
        <h3>Cart</h3>
        <span className="cart-count">{totalItems}</span>
      </div>

      {items.length === 0 ? (
        <p className="empty-cart">Your cart is empty</p>
      ) : (
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div>
                <p className="cart-item-name">{item.name}</p>
                <span className="cart-item-qty">Qty: {item.quantity}</span>
              </div>
              <strong>₹{item.price * item.quantity}</strong>
            </div>
          ))}
        </div>
      )}

      <div className="cart-summary">
        <div className="cart-row">
          <span>Subtotal</span>
          <strong>₹{subtotal}</strong>
        </div>
        <div className="cart-row">
          <span>Tax (5%)</span>
          <strong>₹{tax.toFixed(2)}</strong>
        </div>
        <div className="cart-footer">
          <span>Total</span>
          <strong>₹{totalPrice.toFixed(2)}</strong>
        </div>
      </div>

      <button
        type="button"
        className="download-bill-button"
        onClick={handleDownloadBill}
        disabled={!items.length}
      >
        Generate PDF Bill
      </button>
    </aside>
  )
}

export default Cart