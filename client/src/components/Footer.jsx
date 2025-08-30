function Footer() {
  return (
    <footer className="bg-background/95 border-t mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">About</h3>
            <p className="text-sm text-muted-foreground leading-6">
              Kham River Monitoring System provides real-time water quality data
              and analysis for better environmental management.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/water-quality" className="text-muted-foreground hover:text-foreground transition-colors">
                  Water Quality Data
                </a>
              </li>
              <li>
                <a href="/predictions" className="text-muted-foreground hover:text-foreground transition-colors">
                  Data Analysis
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a
                  href="https://www.ijert.org/research/water-quality-assessment-of-kham-river-aurangabad-maharashtra-IJERTV3IS041692.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Standards (Open Online)
                </a>
              </li>
              <li>
                <a
                  href="/water-quality-assessment-of-kham-river-aurangabad-maharashtra-IJERTV3IS041692.pdf"
                  download
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Standards (Download PDF)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Email: contact@gmail.com</li>
              <li className="text-muted-foreground">Phone: xxxxxx0614</li>
              <li className="text-muted-foreground">Address: Mit college, Chh. Sambhajinagar</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Kham River Monitor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;