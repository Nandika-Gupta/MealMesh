import Navbar from "@/components/Navbar";


const features = [
  {
    icon: "🥗",
    title: "Share Surplus Food",
    description:
      "Providers can list excess meals and fresh food instead of letting perfectly good food go to waste.",
  },
  {
    icon: "🤝",
    title: "Connect Communities",
    description:
      "Bring food providers and people who need it together through one simple platform.",
  },
  {
    icon: "🌍",
    title: "Reduce Food Waste",
    description:
      "Make a meaningful difference by giving surplus food a second chance and building a sustainable future.",
  },
];

const steps = [
  {
    number: "01",
    title: "Discover",
    description: "Browse available food listings in your community.",
  },
  {
    number: "02",
    title: "Claim",
    description: "Find what you need and reserve a suitable listing.",
  },
  {
    number: "03",
    title: "Connect",
    description: "Coordinate with the provider and collect your food.",
  },
];

export default function Home() {
  return (
    <main>
      <Navbar
        variant="home"
        sectionLinks={
          <>
            <a href="#about">About</a>
            <a href="#how-it-works">How it works</a>
            <a href="#impact">Our impact</a>
          </>
        }
      />

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="live-dot"></span>
            FOOD SHARING. COMMUNITY CARING.
          </div>

          <h1>
            Good food deserves
            <br />
            <span>a second chance.</span>
          </h1>

          <p className="hero-description">
            Connecting surplus food with the people who need it.
            Together, let's reduce food waste and create a community
            where no good meal goes to waste.
          </p>

          <div className="hero-actions">
            <a href="/listings" className="primary-button">
              Explore food listings <span>→</span>
            </a>
            <a href="/signup" className="secondary-button">
              Become a provider
            </a>
          </div>

          <div className="hero-note">
            <span>🌱</span>
            Every meal shared makes a difference.
          </div>
        </div>

        <div className="hero-visual">
          <div className="food-photo">
            <div className="photo-label">
              <span className="photo-dot"></span>
              GOOD FOOD, SHARED GOOD
            </div>
          </div>

          <div className="floating-card floating-top">
            <span className="floating-icon">🥑</span>
            <div>
              <strong>Fresh food</strong>
              <small>Ready to be shared</small>
            </div>
          </div>

          <div className="floating-card floating-bottom">
            <span className="floating-icon">💚</span>
            <div>
              <strong>Small actions.</strong>
              <small>Meaningful impact.</small>
            </div>
          </div>

          <div className="visual-decoration"></div>
        </div>
      </section>

      <section className="impact-strip" id="impact">
        <div>
          <span className="impact-number">01</span>
          <span className="impact-label">A community-driven initiative</span>
        </div>
        <div>
          <span className="impact-number">02</span>
          <span className="impact-label">Food that finds a purpose</span>
        </div>
        <div>
          <span className="impact-number">03</span>
          <span className="impact-label">A more sustainable tomorrow</span>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="section-heading">
          <span className="section-tag">WHY MEALMESH?</span>
          <h2>
            More than food.
            <br />
            <span>A connection that matters.</span>
          </h2>
          <p>
            We believe that access to food and reducing food waste
            should go hand in hand. MealMesh makes sharing easier,
            smarter and more meaningful.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="feature-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="steps-section" id="how-it-works">
        <div className="steps-heading">
          <span className="section-tag">SIMPLE BY DESIGN</span>
          <h2>How MealMesh works</h2>
          <p>Three simple steps to make food sharing happen.</p>
        </div>

        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div>
          <span className="section-tag cta-tag">BE PART OF THE CHANGE</span>
          <h2>Let's make every meal count.</h2>
          <p>
            Join a community that believes good food should never go to waste.
          </p>
        </div>
        <a href="/signup" className="cta-button">
          Join MealMesh <span>→</span>
        </a>
      </section>

      <footer className="footer">
        <a href="/" className="brand footer-brand">
          <span className="brand-icon">🥬</span>
          <span>
            Meal<span className="brand-highlight">Mesh</span>
          </span>
        </a>
        <p>Connecting food. Empowering communities. Reducing waste.</p>
        <span className="copyright">
          © 2026 MealMesh. Made for a better tomorrow.
        </span>
      </footer>
    </main>
  );
}
