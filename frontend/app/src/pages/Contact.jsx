import { useState } from 'react'
import './Contact.css'
import API_BASE_URL from '../api'

const contactEmail = 'alamfarhan3304@gmail.com'

function Contact({ onBrowseShop }) {
  const [isSending, setIsSending] = useState(false)
  const [submissionMessage, setSubmissionMessage] = useState('')
  const [submissionError, setSubmissionError] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setIsSending(true)
    setSubmissionMessage('')
    setSubmissionError(false)

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Your message could not be sent.')
      }

      form.reset()
      setSubmissionMessage(result.message)
    } catch (error) {
      setSubmissionError(true)
      setSubmissionMessage(error.message || 'Your message could not be sent. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero__copy">
          <span className="contact-eyebrow">
            <span className="contact-eyebrow__dot" />
            We’re here to help
          </span>
          <h1>Let’s talk about what you need.</h1>
          <p>
            Have a question about MediCare or need help finding your way around?
            Send us a note and we’ll be glad to hear from you.
          </p>
          <button type="button" className="contact-shop-link" onClick={onBrowseShop}>
            Browse the shop <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="contact-hero__art" aria-hidden="true">
          <div className="contact-art__ring contact-art__ring--outer" />
          <div className="contact-art__ring contact-art__ring--inner" />
          <div className="contact-art__bubble contact-art__bubble--one">hello!</div>
          <div className="contact-art__bubble contact-art__bubble--two">✦</div>
          <div className="contact-art__message">
            <div className="contact-art__message-top">
              <span />
              <span />
              <span />
            </div>
            <div className="contact-art__message-icon">
              <svg viewBox="0 0 48 48">
                <path d="M7 12h34v24H7z" />
                <path d="m8 14 16 13 16-13" />
              </svg>
            </div>
            <div className="contact-art__line contact-art__line--long" />
            <div className="contact-art__line" />
          </div>
        </div>
      </section>

      <section className="contact-main" aria-label="Contact MediCare">
        <div className="contact-details">
          <p className="contact-kicker">Get in touch</p>
          <h2>A real conversation starts with a simple hello.</h2>
          <p className="contact-details__intro">
            Write to us with your question or feedback. Your message will be sent
            directly to our team.
          </p>

          <a className="contact-email-card" href={`mailto:${contactEmail}`}>
            <span className="contact-email-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </span>
            <span className="contact-email-card__text">
              <span className="contact-email-card__label">Email us</span>
              <strong>{contactEmail}</strong>
            </span>
            <span className="contact-email-card__arrow" aria-hidden="true">↗</span>
          </a>

          <div className="contact-note">
            <span className="contact-note__icon" aria-hidden="true">i</span>
            <p>
              For urgent medical concerns, please contact a qualified healthcare
              professional or your local emergency service.
            </p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form__heading">
            <span className="contact-form__kicker">Send a message</span>
            <h2>How can we help?</h2>
            <p>Fill out the details below and we’ll send your message to our team.</p>
          </div>

          <div className="contact-form__row">
            <label>
              Your name
              <input type="text" name="name" placeholder="e.g. Alex Morgan" autoComplete="name" required />
            </label>
            <label>
              Email address
              <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
            </label>
          </div>

          <label>
            What’s this about?
            <select name="topic" defaultValue="" required>
              <option value="" disabled>Select a topic</option>
              <option value="Product question">Product question</option>
              <option value="Order or shopping help">Order or shopping help</option>
              <option value="Website feedback">Website feedback</option>
              <option value="Something else">Something else</option>
            </select>
          </label>

          <label>
            Your message
            <textarea
              name="message"
              rows="5"
              placeholder="Tell us a little more about how we can help..."
              required
            />
          </label>

          <button className="contact-form__submit" type="submit" disabled={isSending}>
            {isSending ? 'Sending...' : 'Send message'} <span aria-hidden="true">→</span>
          </button>
          {submissionMessage && (
            <p
              className={`contact-form__feedback${submissionError ? ' contact-form__feedback--error' : ''}`}
              role={submissionError ? 'alert' : 'status'}
            >
              {submissionMessage}
            </p>
          )}
          <p className="contact-form__fine-print">
            Your details are used only to respond to your message.
          </p>
        </form>
      </section>
    </main>
  )
}

export default Contact
