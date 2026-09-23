export default function Footer() {
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">

      {/* Background video */}
      <div className="footer-media" aria-hidden="true">
        <video
          className="footer-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/4f690bd1-881a-4192-82f2-d714d34c8fb9.png"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260901_122529_931c22c8-8d2d-47c0-ad51-b97f56a91e42.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className="footer-inner">
        <div className="footer-grid">

          {/* ===== BRAND ===== */}
          <div className="brand">
            <div className="brand-lockup">
              <svg
                className="brand-mark"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                {/* Mountain Silhouette */}
                <path
                  d="M5 24L12 12L17 19L21 14L27 24H5Z"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12L15 17L12 24"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeOpacity="0.6"
                />
                {/* Early Warning Signal Pulse */}
                <circle cx="12" cy="8" r="1.5" fill="currentColor" />
                <path
                  d="M8.5 7C9.5 5.5 10.7 5 12 5C13.3 5 14.5 5.5 15.5 7"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <p className="brand-name">ResQAI</p>
            </div>
            <p className="brand-blurb">
              AI-powered Landslide Early Warning &amp; Risk Monitoring System for the North Eastern Region of India. Nature warns. We act.
            </p>
            <ul className="contact-list">
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2-8 5-8-5h16Zm0 12H4V8l8 5 8-5v10Z" />
                </svg>
                <a href="mailto:control@resqai.gov.in">control@resqai.gov.in</a>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
                </svg>
                <a href="tel:1070">1070 (Disaster Toll-Free) / +91 361 223 7000</a>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
                </svg>
                <span>NER Disaster Operations Hub, Guwahati, India</span>
              </li>
            </ul>
          </div>

          {/* ===== PLATFORM ===== */}
          <nav className="col" aria-label="Platform">
            <h3 className="col-title">Platform</h3>
            <ul className="link-list">
              <li><button type="button" onClick={() => navigateTo('/live-map')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">Live Risk Map</button></li>
              <li><button type="button" onClick={() => navigateTo('/risk-monitoring')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">Risk Monitoring</button></li>
              <li><button type="button" onClick={() => navigateTo('/alerts')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">Active Alerts</button></li>
              <li><button type="button" onClick={() => navigateTo('/rescue-team')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">Rescue Team</button></li>
              <li><button type="button" onClick={() => navigateTo('/analysis')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">YOLO11 Vision Analysis</button></li>
              <li><button type="button" onClick={() => navigateTo('/assistant')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">AI Emergency Assistant</button></li>
              <li><button type="button" onClick={() => navigateTo('/about')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">About ResQAI</button></li>
            </ul>
          </nav>

          {/* ===== HILL SECTORS ===== */}
          <nav className="col" aria-label="Hill Sectors">
            <h3 className="col-title">Hill Sectors</h3>
            <ul className="link-list">
              <li><button type="button" onClick={() => navigateTo('/risk-monitoring?location=gangtok')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">Gangtok (NH-10, Sikkim)</button></li>
              <li><button type="button" onClick={() => navigateTo('/risk-monitoring?location=aizawl')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">Aizawl (Mizoram Scarp)</button></li>
              <li><button type="button" onClick={() => navigateTo('/risk-monitoring?location=kohima')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">Kohima (NH-29, Nagaland)</button></li>
              <li><button type="button" onClick={() => navigateTo('/risk-monitoring?location=guwahati')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">Guwahati (Assam Urban)</button></li>
              <li><button type="button" onClick={() => navigateTo('/risk-monitoring?location=itanagar')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">Itanagar (Arunachal)</button></li>
              <li><button type="button" onClick={() => navigateTo('/risk-monitoring?location=shillong')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">Shillong (Meghalaya)</button></li>
            </ul>
          </nav>

          {/* ===== ECOSYSTEM & RESEARCH ===== */}
          <nav className="col" aria-label="Ecosystem and Research">
            <h3 className="col-title">Ecosystem</h3>
            <ul className="link-list">
              <li><a href="https://www.gsi.gov.in" target="_blank" rel="noopener noreferrer">Geological Survey of India</a></li>
              <li><a href="https://ndma.gov.in" target="_blank" rel="noopener noreferrer">NDMA Guidelines</a></li>
              <li><button type="button" onClick={() => navigateTo('/analysis')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">YOLO11 Model Backbone</button></li>
              <li><button type="button" onClick={() => navigateTo('/risk-monitoring')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">InSAR Displacement Radar</button></li>
              <li><button type="button" onClick={() => navigateTo('/alerts')} className="text-left bg-transparent p-0 border-0 cursor-pointer font-inherit">Emergency Dispatch SOP</button></li>
            </ul>
          </nav>

          {/* ===== ALERT BULLETIN SUBSCRIPTION ===== */}
          <div className="newsletter">
            <h3 className="col-title">Alert Bulletins</h3>
            <p>Subscribe for immediate rainfall surge notices, slope displacement bulletins &amp; disaster warnings.</p>
            <form className="subscribe" action="#" method="post" onSubmit={e => { e.preventDefault(); alert('Subscribed to ResQAI Early Warning Bulletins.'); }}>
              <label htmlFor="nl-email" className="sr-only">Official email address</label>
              <input
                id="nl-email"
                type="email"
                name="email"
                placeholder="Enter official email"
                autoComplete="email"
                required
              />
              <button type="submit" aria-label="Subscribe to alerts">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          </div>

        </div>{/* /.footer-grid */}

        {/* ===== BOTTOM BAR ===== */}
        <div className="footer-bottom">
          <div className="socials">
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14Zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79ZM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68Zm1.39 9.94v-8.37H5.5v8.37h2.77Z" />
              </svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
          <nav className="legal" aria-label="Legal">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('ResQAI Telemetry & Data Privacy Policy (NER Geospatial Protocol)'); }}>Data Privacy Policy</a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert('ResQAI Terms of Service & Standard Operating Procedures'); }}>Standard Operating Procedures</a>
            <a href="#disclaimer" onClick={(e) => { e.preventDefault(); alert('Disclaimer: Prototype AI Early Warning Decision Support System'); }}>Prototype Disclaimer</a>
          </nav>
        </div>{/* /.footer-bottom */}

      </div>{/* /.footer-inner */}

    </footer>
  );
}
