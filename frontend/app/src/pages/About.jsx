import { useEffect, useRef } from 'react'
import './About.css'

const steps = [
  {
    number: '01',
    title: 'Explore',
    description: 'Browse categories or search the shop to find the essentials you need.',
  },
  {
    number: '02',
    title: 'Choose',
    description: 'Check product details, prices, and stock availability as you compare.',
  },
  {
    number: '03',
    title: 'Keep it together',
    description: 'Add your picks to the cart and review your selections in one place.',
  },
]

function About({ onBrowseShop }) {
  const pageRef = useRef(null)

  useEffect(() => {
    const page = pageRef.current
    if (!page || !('IntersectionObserver' in window)) return undefined

    const targets = page.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15 })

    targets.forEach((target) => observer.observe(target))
    page.classList.add('about-page--animated')

    return () => observer.disconnect()
  }, [])

  return (
    <main className="about-page" ref={pageRef}>
      <section className="about-hero" data-reveal>
        <div className="about-hero__content">
          <span className="about-eyebrow">
            <span className="about-eyebrow__dot" />
            YOUR EVERYDAY WELLNESS SHOP
          </span>
          <h1>Small steps toward <span>feeling better.</span></h1>
          <p>
            Find everyday healthcare essentials in one calm, easy-to-use place.
            Explore the catalog at your pace and keep the things you need close at hand.
          </p>
          <button type="button" className="about-primary-button" onClick={onBrowseShop}>
            Find your essentials
            <span aria-hidden="true">→</span>
          </button>
          <div className="about-hero__note">
            <span aria-hidden="true">✦</span>
            Clear choices for everyday care
          </div>
        </div>

        <div className="about-hero__visual" aria-hidden="true">
          <div className="about-hero__glow" />
          <div className="about-orbit about-orbit--outer" />
          <div className="about-orbit about-orbit--inner" />
          <div className="about-product-card">
            <span className="about-product-card__label">A little care</span>
            <div className="about-product-card__icon">
              <span />
              <span />
            </div>
            <strong>Everyday<br />essentials</strong>
            <div className="about-product-card__dots"><i /><i /><i /></div>
          </div>
          <div className="about-float about-float--top"><span>✓</span> Easy to explore</div>
          <div className="about-float about-float--bottom"><span>＋</span> Your care, together</div>
          <div className="about-hero__spark about-hero__spark--one">✳</div>
          <div className="about-hero__spark about-hero__spark--two">✦</div>
        </div>
      </section>

      <section className="about-intro" aria-labelledby="about-intro-title" data-reveal>
        <div className="about-intro__heading">
          <p className="about-section-kicker">A more thoughtful way to shop</p>
          <h2 id="about-intro-title">Care should feel simple from the very start.</h2>
        </div>
        <p className="about-intro__text">
          That’s why MediCare brings helpful product information and everyday
          essentials together in a straightforward shopping experience. No fuss —
          just a clearer way to find what fits your routine.
        </p>
      </section>

      <section className="about-values" aria-label="How MediCare works">
        <div className="about-values__heading">
          <p className="about-section-kicker">Three simple steps</p>
          <h2>From looking to feeling prepared.</h2>
        </div>
        {steps.map((step) => (
          <article className="about-value-card" key={step.number} data-reveal>
            <span className="about-value-card__number">{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </section>

      <section className="about-cta" data-reveal>
        <div>
          <p className="about-section-kicker">A good place to begin</p>
          <h2>Your everyday essentials are just a browse away.</h2>
        </div>
        <button type="button" className="about-cta__button" onClick={onBrowseShop}>
          Visit the shop <span aria-hidden="true">→</span>
        </button>
      </section>
    </main>
  )
}

export default About