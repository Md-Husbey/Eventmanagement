import { Waves } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-xl mb-3">
            <Waves className="text-sand-300" size={24} />
            <span>SeaFest <span className="text-sand-300">BD</span></span>
          </div>
          <p className="text-primary-300 text-sm">Smart Tourism, Entertainment & Event Management Platform for Cox's Bazar.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sand-300">Quick Links</h4>
          <ul className="space-y-2 text-sm text-primary-300">
            <li><Link to="/events" className="hover:text-white">All Events</Link></li>
            <li><Link to="/register" className="hover:text-white">Register</Link></li>
            <li><Link to="/become-organizer" className="hover:text-white">Become Organizer</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sand-300">Event Types</h4>
          <ul className="space-y-2 text-sm text-primary-300">
            <li>DJ Party & Beach Party</li>
            <li>Food & Music Festivals</li>
            <li>Beach Weddings</li>
            <li>Cultural Programs</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sand-300">Contact</h4>
          <p className="text-sm text-primary-300">Cox's Bazar, Bangladesh</p>
          <p className="text-sm text-primary-300">info@seafestbd.com</p>
        </div>
      </div>
      <div className="border-t border-primary-800 py-4 text-center text-sm text-primary-400">
        © 2026 SeaFest BD. Developed by Husbey Hawlader.
      </div>
    </footer>
  );
}
