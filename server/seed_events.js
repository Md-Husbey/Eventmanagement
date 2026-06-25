require('dotenv').config();
const sequelize = require('./config/database');
const { User, Event, Ticket } = require('./models');

const MANAGER_EMAIL = 'manager@seafest.com';

const events = [
  // DJ PARTY
  { title: 'Sunset DJ Blast Cox\'s Bazar', category: 'dj_party', location: 'Laboni Beach, Cox\'s Bazar', date: '2026-07-15 20:00:00', endDate: '2026-07-16 02:00:00', description: 'The biggest DJ party on the longest sea beach in the world. International and local DJs, laser shows, and non-stop music till dawn.', totalCapacity: 2000, basePrice: 500, isFeatured: true, tags: ['dj', 'beach', 'nightlife', 'coxsbazar'], tickets: [{ type: 'General', price: 500, quantity: 1500 }, { type: 'VIP', price: 1500, quantity: 500 }] },
  { title: 'Neon Rave Night Dhaka', category: 'dj_party', location: 'International Convention City Bashundhara, Dhaka', date: '2026-08-05 21:00:00', endDate: '2026-08-06 03:00:00', description: 'Dhaka\'s most anticipated neon rave party. UV lights, glow accessories, and world-class DJ lineup.', totalCapacity: 1500, basePrice: 600, isFeatured: false, tags: ['rave', 'neon', 'dhaka', 'nightlife'], tickets: [{ type: 'Standard', price: 600, quantity: 1000 }, { type: 'Premium', price: 1800, quantity: 500 }] },
  { title: 'Beach Drop Festival Inani', category: 'dj_party', location: 'Inani Beach, Cox\'s Bazar', date: '2026-09-20 19:00:00', endDate: '2026-09-21 01:00:00', description: 'Open-air DJ festival at the scenic Inani beach. Sunset views, ocean breeze, and epic drops.', totalCapacity: 1000, basePrice: 400, isFeatured: true, tags: ['festival', 'inani', 'dj', 'openair'], tickets: [{ type: 'Early Bird', price: 400, quantity: 400 }, { type: 'Regular', price: 700, quantity: 600 }] },

  // BEACH PARTY
  { title: 'SeaFest Mega Beach Carnival', category: 'beach_party', location: 'Sugandha Beach, Cox\'s Bazar', date: '2026-12-25 16:00:00', endDate: '2026-12-25 23:00:00', description: 'Annual SeaFest mega beach carnival with live music, fire dancing, water games, and food stalls on the shores of Cox\'s Bazar.', totalCapacity: 3000, basePrice: 300, isFeatured: true, tags: ['carnival', 'beach', 'coxsbazar', 'christmas'], tickets: [{ type: 'General', price: 300, quantity: 2500 }, { type: 'VIP Zone', price: 900, quantity: 500 }] },
  { title: 'New Year Eve Beach Bash', category: 'beach_party', location: 'Kolatoli Beach, Cox\'s Bazar', date: '2026-12-31 18:00:00', endDate: '2027-01-01 02:00:00', description: 'Welcome 2027 with your feet in the sand. Fireworks, live bands, bonfire, and countdown party at Kolatoli beach.', totalCapacity: 5000, basePrice: 500, isFeatured: true, tags: ['newyear', 'beach', 'fireworks', 'coxsbazar'], tickets: [{ type: 'Standard', price: 500, quantity: 4000 }, { type: 'Exclusive', price: 2000, quantity: 1000 }] },
  { title: 'Summer Splash Saint Martin', category: 'beach_party', location: 'Saint Martin Island, Bangladesh', date: '2026-11-10 14:00:00', endDate: '2026-11-10 22:00:00', description: 'Day-to-night beach party on the only coral island of Bangladesh. Snorkeling, beach volleyball, BBQ and live music.', totalCapacity: 500, basePrice: 1500, isFeatured: false, tags: ['saintmartin', 'island', 'coral', 'summer'], tickets: [{ type: 'Day Pass', price: 1500, quantity: 300 }, { type: 'All Inclusive', price: 3500, quantity: 200 }] },

  // FOOD FESTIVAL
  { title: 'Dhaka Street Food Festival', category: 'food_festival', location: 'Hatirjheel Amphitheatre, Dhaka', date: '2026-10-03 12:00:00', endDate: '2026-10-05 22:00:00', description: 'Three-day celebration of Bangladesh\'s street food culture. Over 100 vendors, cooking competitions, and food photography contests.', totalCapacity: 10000, basePrice: 100, isFeatured: true, tags: ['food', 'streetfood', 'dhaka', 'festival'], tickets: [{ type: 'Daily Pass', price: 100, quantity: 7000 }, { type: '3-Day Pass', price: 250, quantity: 3000 }] },
  { title: 'Cox\'s Bazar Seafood Carnival', category: 'food_festival', location: 'Beach Road, Cox\'s Bazar', date: '2026-11-20 11:00:00', endDate: '2026-11-22 21:00:00', description: 'Fresh seafood from the Bay of Bengal. Grilled hilsa, lobster, prawn and more — direct from the fishermen to your plate.', totalCapacity: 5000, basePrice: 200, isFeatured: true, tags: ['seafood', 'hilsa', 'coxsbazar', 'food'], tickets: [{ type: 'Entry', price: 200, quantity: 4000 }, { type: 'VIP Dining', price: 800, quantity: 1000 }] },
  { title: 'Sylhet Tea & Cuisine Festival', category: 'food_festival', location: 'Osmani International Stadium, Sylhet', date: '2026-09-12 10:00:00', endDate: '2026-09-14 20:00:00', description: 'Celebrate the flavors of Sylhet — tea gardens, Shatkora beef, seven-color tea, and traditional Sylheti cuisine.', totalCapacity: 8000, basePrice: 150, isFeatured: false, tags: ['sylhet', 'tea', 'cuisine', 'food'], tickets: [{ type: 'General', price: 150, quantity: 6500 }, { type: 'Premium', price: 500, quantity: 1500 }] },
  { title: 'Eid Food Festival Chittagong', category: 'food_festival', location: 'CRB Hill, Chittagong', date: '2026-07-01 11:00:00', endDate: '2026-07-03 22:00:00', description: 'Celebrate Eid with the finest traditional Bangladeshi cuisine. Mezban beef, kacchi biryani, special desserts and sweets.', totalCapacity: 6000, basePrice: 100, isFeatured: false, tags: ['eid', 'food', 'chittagong', 'biryani'], tickets: [{ type: 'General', price: 100, quantity: 5000 }, { type: 'Family Pack (4)', price: 350, quantity: 1000 }] },

  // MUSIC CONCERT
  { title: 'Dhaka Rock Summit 2026', category: 'music_concert', location: 'Bangladesh Army Stadium, Dhaka', date: '2026-08-22 17:00:00', endDate: '2026-08-22 23:00:00', description: 'Bangladesh\'s biggest rock music festival. 10 rock bands, pyrotechnics, and a night of pure energy.', totalCapacity: 20000, basePrice: 800, isFeatured: true, tags: ['rock', 'concert', 'dhaka', 'music'], tickets: [{ type: 'Standing', price: 800, quantity: 15000 }, { type: 'Seated', price: 1500, quantity: 4000 }, { type: 'Backstage', price: 5000, quantity: 1000 }] },
  { title: 'Acoustic Night by the River', category: 'music_concert', location: 'Buriganga Riverbank, Dhaka', date: '2026-07-25 18:30:00', endDate: '2026-07-25 22:00:00', description: 'A soulful evening of acoustic music by the Buriganga river. Intimate setting, local artists, and a stunning sunset backdrop.', totalCapacity: 500, basePrice: 300, isFeatured: false, tags: ['acoustic', 'music', 'buriganga', 'dhaka'], tickets: [{ type: 'General', price: 300, quantity: 400 }, { type: 'Riverside VIP', price: 800, quantity: 100 }] },
  { title: 'Baul Mela Kushtia', category: 'music_concert', location: 'Lalon Shah Mazar, Kushtia', date: '2026-10-17 16:00:00', endDate: '2026-10-19 00:00:00', description: 'The annual Baul music gathering at the shrine of Lalon Shah. Folk musicians from across Bengal performing traditional Baul songs.', totalCapacity: 15000, basePrice: 50, isFeatured: true, tags: ['baul', 'folk', 'kushtia', 'lalon'], tickets: [{ type: 'General', price: 50, quantity: 12000 }, { type: 'Premium Sitting', price: 300, quantity: 3000 }] },
  { title: 'Chittagong Jazz & Blues Night', category: 'music_concert', location: 'Radisson Blu Chittagong', date: '2026-09-05 19:00:00', endDate: '2026-09-05 23:30:00', description: 'An elegant evening of jazz and blues at Radisson Blu. International guest musicians alongside Bangladesh\'s finest jazz artists.', totalCapacity: 400, basePrice: 1500, isFeatured: false, tags: ['jazz', 'blues', 'chittagong', 'hotel'], tickets: [{ type: 'Standard', price: 1500, quantity: 300 }, { type: 'Table (2 persons)', price: 4000, quantity: 100 }] },

  // WEDDING EVENT
  { title: 'Royal Bengali Wedding Exhibition', category: 'wedding_event', location: 'Bashundhara Convention Hall, Dhaka', date: '2026-11-05 10:00:00', endDate: '2026-11-07 20:00:00', description: 'The largest wedding expo in Bangladesh. Vendors, decorators, caterers, photographers, and bridal fashion all under one roof.', totalCapacity: 20000, basePrice: 100, isFeatured: false, tags: ['wedding', 'expo', 'dhaka', 'bridal'], tickets: [{ type: 'Visitor Pass', price: 100, quantity: 18000 }, { type: 'Vendor Package', price: 500, quantity: 2000 }] },
  { title: 'Destination Wedding Gala Cox\'s Bazar', category: 'wedding_event', location: 'Long Beach Hotel, Cox\'s Bazar', date: '2026-12-12 16:00:00', endDate: '2026-12-12 23:00:00', description: 'Beachfront wedding gala experience. Live demonstration of wedding setups, cuisine tasting, and bridal fashion show.', totalCapacity: 600, basePrice: 500, isFeatured: true, tags: ['wedding', 'beachfront', 'coxsbazar', 'gala'], tickets: [{ type: 'Couple Ticket', price: 500, quantity: 400 }, { type: 'Premium Table', price: 2000, quantity: 200 }] },

  // CULTURAL PROGRAM
  { title: 'Pohela Boishakh Grand Festival', category: 'cultural_program', location: 'Ramna Park, Dhaka', date: '2026-04-14 06:00:00', endDate: '2026-04-14 21:00:00', description: 'Welcome the Bengali New Year 1433 with the grand Pohela Boishakh celebration. Mangal Shobhajatra procession, cultural performances, and traditional food.', totalCapacity: 50000, basePrice: 0, isFeatured: true, tags: ['boishakh', 'bengalinewyear', 'culture', 'dhaka'], tickets: [{ type: 'Free Entry', price: 0, quantity: 45000 }, { type: 'VIP Lounge', price: 1000, quantity: 5000 }] },
  { title: 'Ekushey Book Fair Cultural Night', category: 'cultural_program', location: 'Bangla Academy, Dhaka', date: '2026-02-21 17:00:00', endDate: '2026-02-21 22:00:00', description: 'International Mother Language Day cultural evening at Bangla Academy. Poetry recitals, folk songs, and tribute to language martyrs.', totalCapacity: 3000, basePrice: 0, isFeatured: false, tags: ['ekushey', 'languageday', 'culture', 'dhaka'], tickets: [{ type: 'General', price: 0, quantity: 3000 }] },
  { title: 'Nakshi Kantha Heritage Festival', category: 'cultural_program', location: 'Bangladesh National Museum, Dhaka', date: '2026-08-10 10:00:00', endDate: '2026-08-12 18:00:00', description: 'Celebrating the art of Nakshi Kantha — traditional Bengali embroidery. Live demonstrations, exhibitions, and cultural performances.', totalCapacity: 5000, basePrice: 50, isFeatured: false, tags: ['nakshikantha', 'heritage', 'art', 'culture'], tickets: [{ type: 'Entry', price: 50, quantity: 5000 }] },
  { title: 'Sundarbans Folk Festival', category: 'cultural_program', location: 'Mongla Port, Khulna', date: '2026-11-28 14:00:00', endDate: '2026-11-30 21:00:00', description: 'A celebration of Sundarbans folk culture. Bawali songs, Munda dance, boat races, and stories of the mangrove forest.', totalCapacity: 8000, basePrice: 100, isFeatured: true, tags: ['sundarbans', 'folk', 'khulna', 'mangrove'], tickets: [{ type: 'General', price: 100, quantity: 7000 }, { type: 'Premium', price: 400, quantity: 1000 }] },

  // TOURISM FESTIVAL
  { title: 'Visit Bangladesh Tourism Expo 2026', category: 'tourism_festival', location: 'Bangabandhu International Conference Center, Dhaka', date: '2026-10-15 09:00:00', endDate: '2026-10-17 18:00:00', description: 'Bangladesh\'s premier tourism expo. Travel agencies, hotel chains, airlines, and adventure sports companies showcase the best of Bangladesh tourism.', totalCapacity: 15000, basePrice: 200, isFeatured: true, tags: ['tourism', 'expo', 'travel', 'dhaka'], tickets: [{ type: 'Visitor', price: 200, quantity: 12000 }, { type: 'Industry Professional', price: 500, quantity: 3000 }] },
  { title: 'Rangamati Lake Festival', category: 'tourism_festival', location: 'Kaptai Lake, Rangamati', date: '2026-11-15 10:00:00', endDate: '2026-11-17 18:00:00', description: 'Three days on the beautiful Kaptai Lake. Boat tours, hill tribe cultural shows, indigenous food, and photography tours.', totalCapacity: 2000, basePrice: 500, isFeatured: true, tags: ['rangamati', 'lake', 'kaptai', 'tourism'], tickets: [{ type: 'Day Tour', price: 500, quantity: 1500 }, { type: 'Full Package', price: 1500, quantity: 500 }] },
  { title: 'Bandarban Adventure Festival', category: 'tourism_festival', location: 'Nilgiri Hills, Bandarban', date: '2026-12-05 08:00:00', endDate: '2026-12-07 17:00:00', description: 'Adventure tourism festival in the hills of Bandarban. Trekking, zip-lining, camping, and cultural exchange with indigenous communities.', totalCapacity: 1000, basePrice: 1000, isFeatured: false, tags: ['bandarban', 'adventure', 'hills', 'trekking'], tickets: [{ type: 'Adventure Pass', price: 1000, quantity: 800 }, { type: 'Premium Camp', price: 3000, quantity: 200 }] },
  { title: 'Sylhet Tea Garden Tour Festival', category: 'tourism_festival', location: 'Srimangal, Sylhet', date: '2026-10-25 09:00:00', endDate: '2026-10-27 17:00:00', description: 'Guided tours through the lush tea gardens of Srimangal. Tea tasting, garden walks, and traditional Manipuri dance performances.', totalCapacity: 3000, basePrice: 600, isFeatured: false, tags: ['sylhet', 'tea', 'srimangal', 'tourism'], tickets: [{ type: 'Day Tour', price: 600, quantity: 2500 }, { type: 'Weekend Package', price: 1800, quantity: 500 }] },

  // NEW YEAR
  { title: 'Dhaka New Year Countdown Gala', category: 'new_year', location: 'Pan Pacific Sonargaon Hotel, Dhaka', date: '2026-12-31 20:00:00', endDate: '2027-01-01 03:00:00', description: 'Ring in 2027 at Dhaka\'s most prestigious countdown gala. Gourmet dinner, live orchestra, DJ after-party, and midnight fireworks.', totalCapacity: 1000, basePrice: 3000, isFeatured: true, tags: ['newyear', 'gala', 'dhaka', 'countdown'], tickets: [{ type: 'Dinner & Party', price: 3000, quantity: 800 }, { type: 'Couple Package', price: 5500, quantity: 200 }] },
  { title: 'Chittagong Hilltop New Year Night', category: 'new_year', location: 'Foy\'s Lake, Chittagong', date: '2026-12-31 19:00:00', endDate: '2027-01-01 02:00:00', description: 'Welcome 2027 with panoramic views of Chittagong from the hilltop. Live music, bonfire, and fireworks at midnight.', totalCapacity: 2000, basePrice: 800, isFeatured: false, tags: ['newyear', 'hilltop', 'chittagong', 'fireworks'], tickets: [{ type: 'General', price: 800, quantity: 1500 }, { type: 'VIP', price: 2000, quantity: 500 }] },

  // CORPORATE EVENT
  { title: 'Bangladesh Tech Summit 2026', category: 'corporate_event', location: 'ICCB, Dhaka', date: '2026-09-18 09:00:00', endDate: '2026-09-19 18:00:00', description: 'Bangladesh\'s leading technology conference. Keynotes from tech leaders, startup pitches, AI workshops, and networking sessions.', totalCapacity: 5000, basePrice: 1000, isFeatured: true, tags: ['tech', 'summit', 'AI', 'startup'], tickets: [{ type: 'Professional', price: 1000, quantity: 3500 }, { type: 'Student', price: 300, quantity: 1000 }, { type: 'Corporate Table', price: 8000, quantity: 500 }] },
  { title: 'Bangladesh Business Awards Night', category: 'corporate_event', location: 'Le Méridien Dhaka', date: '2026-11-08 18:30:00', endDate: '2026-11-08 23:00:00', description: 'Annual gala celebrating Bangladesh\'s top businesses and entrepreneurs. Award ceremony, dinner, and networking.', totalCapacity: 800, basePrice: 2500, isFeatured: false, tags: ['awards', 'business', 'gala', 'networking'], tickets: [{ type: 'Individual Seat', price: 2500, quantity: 600 }, { type: 'Corporate Table (10)', price: 20000, quantity: 200 }] },
  { title: 'RMG Industry Forum Dhaka', category: 'corporate_event', location: 'BGMEA Complex, Dhaka', date: '2026-08-30 09:00:00', endDate: '2026-08-30 17:00:00', description: 'Ready-Made Garments industry forum discussing sustainability, compliance, and future of Bangladesh\'s garment sector.', totalCapacity: 2000, basePrice: 500, isFeatured: false, tags: ['rmg', 'garments', 'industry', 'forum'], tickets: [{ type: 'Delegate', price: 500, quantity: 1500 }, { type: 'VIP Delegate', price: 1500, quantity: 500 }] },

  // HOTEL EVENT
  { title: 'Seagull Hotel Beach Brunch', category: 'hotel_event', location: 'Hotel Seagull, Cox\'s Bazar', date: '2026-10-08 10:00:00', endDate: '2026-10-08 14:00:00', description: 'Luxurious beachfront brunch at Hotel Seagull. Live cooking stations, seafood spread, and live acoustic music.', totalCapacity: 300, basePrice: 1200, isFeatured: false, tags: ['brunch', 'hotel', 'seafood', 'coxsbazar'], tickets: [{ type: 'Adult', price: 1200, quantity: 250 }, { type: 'Child (under 12)', price: 600, quantity: 50 }] },
  { title: 'Westin Dhaka Rooftop Dinner', category: 'hotel_event', location: 'The Westin Dhaka, Gulshan', date: '2026-11-22 19:00:00', endDate: '2026-11-22 23:30:00', description: 'Exclusive rooftop fine dining experience with panoramic Dhaka skyline views. Chef\'s tasting menu and wine pairing.', totalCapacity: 150, basePrice: 4500, isFeatured: true, tags: ['finedining', 'rooftop', 'dhaka', 'westin'], tickets: [{ type: 'Per Person', price: 4500, quantity: 120 }, { type: 'Couple (2 pax)', price: 8000, quantity: 30 }] },
  { title: 'Cox\'s Bazar Hotel Spa & Wellness Day', category: 'hotel_event', location: 'Sayeman Beach Resort, Cox\'s Bazar', date: '2026-10-18 09:00:00', endDate: '2026-10-18 18:00:00', description: 'A full day of wellness, spa treatments, yoga, and healthy cuisine at the award-winning Sayeman Beach Resort.', totalCapacity: 100, basePrice: 3000, isFeatured: false, tags: ['spa', 'wellness', 'yoga', 'coxsbazar'], tickets: [{ type: 'Day Package', price: 3000, quantity: 100 }] },
];

async function seed() {
  await sequelize.authenticate();
  const { User, Event, Ticket } = require('./models');
  await sequelize.sync();

  const manager = await User.findOne({ where: { email: MANAGER_EMAIL } });
  if (!manager) { console.error('Manager user not found. Run seed.js first.'); process.exit(1); }

  let created = 0;
  for (const ev of events) {
    const { tickets, ...eventData } = ev;
    const availableSeats = eventData.totalCapacity;

    const [event, wasCreated] = await Event.findOrCreate({
      where: { title: eventData.title },
      defaults: {
        ...eventData,
        availableSeats,
        status: 'approved',
        organizerId: manager.id,
        latitude: getLatLng(eventData.location).lat,
        longitude: getLatLng(eventData.location).lng,
        coverImage: `https://picsum.photos/seed/${encodeURIComponent(eventData.title)}/800/450`,
      },
    });

    if (wasCreated) {
      for (const t of tickets) {
        await Ticket.create({ ...t, eventId: event.id });
      }
      created++;
      console.log(`✓ ${event.title}`);
    } else {
      console.log(`— already exists: ${event.title}`);
    }
  }

  console.log(`\nDone! ${created} new events created. Total: ${events.length}`);
  await sequelize.close();
}

function getLatLng(location) {
  const coords = {
    "Cox's Bazar": { lat: 21.4272, lng: 92.0058 },
    'Dhaka': { lat: 23.8103, lng: 90.4125 },
    'Chittagong': { lat: 22.3569, lng: 91.7832 },
    'Sylhet': { lat: 24.8949, lng: 91.8687 },
    'Khulna': { lat: 22.8456, lng: 89.5403 },
    'Rangamati': { lat: 22.6483, lng: 92.2004 },
    'Bandarban': { lat: 22.1953, lng: 92.2184 },
    'Kushtia': { lat: 23.9009, lng: 89.1201 },
    'Mongla': { lat: 22.4722, lng: 89.5991 },
    'Srimangal': { lat: 24.3062, lng: 91.7301 },
  };
  for (const [city, c] of Object.entries(coords)) {
    if (location.includes(city) || location.includes(city.replace("'", ''))) return c;
  }
  return { lat: 23.8103, lng: 90.4125 };
}

seed().catch(err => { console.error(err); process.exit(1); });
