function Footer() {
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">About</h3>
            <p className="text-sm text-muted-foreground">
              Kham River Monitoring System provides real-time water quality data 
              and analysis for better environmental management.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/water-quality" className="text-muted-foreground hover:text-foreground">
                  Water Quality Data
                </a>
              </li>
              <li>
                <a href="/predictions" className="text-muted-foreground hover:text-foreground">
                  Data Analysis
                </a>
              </li>
              <li>
                <a href="/real-time" className="text-muted-foreground hover:text-foreground">
                  Real-time Monitoring
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Support
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Email: contact@example.com</li>
              <li className="text-muted-foreground">Phone: (123) 456-7890</li>
              <li className="text-muted-foreground">Address: Your Address Here</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Kham River Monitor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;