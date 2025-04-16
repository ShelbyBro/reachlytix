
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Integrations</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Case Studies</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">About</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Team</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Press</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Knowledge Base</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Webinars</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">API Docs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Contact Us</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Help Center</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="font-bold text-lg bg-gradient-primary text-transparent bg-clip-text">Reachlytix</Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Reachlytix Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
