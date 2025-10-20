import { createClient } from '@supabase/supabase-js';
import { Contact, Project, Task, Location, Equipment, EquipmentBooking, CrewAvailability } from '../types';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sampleContacts: Omit<Contact, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Industries',
    role: 'Client',
    status: 'Active',
    notes: 'CEO, loves innovative video content. Prefers quick turnarounds.',
    tags: ['VIP', 'Tech', 'Repeat Client'],
  },
  {
    name: 'Michael Chen',
    email: 'michael@chen-productions.com',
    phone: '+1 (555) 234-5678',
    company: 'Chen Productions',
    role: 'Vendor',
    status: 'Active',
    notes: 'Sound design specialist. Excellent quality work.',
    tags: ['Audio', 'Post-Production'],
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.r@freelance.com',
    phone: '+1 (555) 345-6789',
    company: 'Independent',
    role: 'Freelancer',
    status: 'Active',
    notes: 'Cinematographer. Available for shoots on weekends.',
    tags: ['Camera', 'Cinematography'],
  },
  {
    name: 'David Park',
    email: 'dpark@creativestudio.com',
    phone: '+1 (555) 456-7890',
    company: 'Creative Studio',
    role: 'Partner',
    status: 'Active',
    notes: 'Animation and motion graphics partner studio.',
    tags: ['Animation', 'VFX', 'Partner'],
  },
  {
    name: 'Jessica Williams',
    email: 'jwilliams@fashionbrand.com',
    phone: '+1 (555) 567-8901',
    company: 'Fashion Brand Inc',
    role: 'Client',
    status: 'Prospect',
    notes: 'Interested in fashion campaign videos. Meeting scheduled next week.',
    tags: ['Fashion', 'Prospect', 'Commercial'],
  },
  {
    name: 'Robert Martinez',
    email: 'rmartinez@freelance.com',
    phone: '+1 (555) 678-9012',
    company: 'Independent',
    role: 'Freelancer',
    status: 'Active',
    notes: 'Video editor specializing in documentaries.',
    tags: ['Editing', 'Documentary'],
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa@musiclabel.com',
    phone: '+1 (555) 789-0123',
    company: 'Indie Music Label',
    role: 'Client',
    status: 'Active',
    notes: 'Music video client. 3 projects completed this year.',
    tags: ['Music', 'Repeat Client'],
  },
  {
    name: 'James Wilson',
    email: 'james@equipmentrental.com',
    phone: '+1 (555) 890-1234',
    company: 'Pro Equipment Rental',
    role: 'Vendor',
    status: 'Active',
    notes: 'Camera and lighting equipment rental. 10% discount for long-term.',
    tags: ['Equipment', 'Preferred Vendor'],
  },
];

export async function seedDatabase() {
  try {
    console.log('Starting database seed...');

    const insertedContacts: Contact[] = [];
    for (const contact of sampleContacts) {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contact])
        .select()
        .single();

      if (error) {
        console.error('Error inserting contact:', error);
        continue;
      }
      if (data) {
        insertedContacts.push(data);
        console.log(`✓ Inserted contact: ${data.name}`);
      }
    }

    console.log('');

    const clients = insertedContacts.filter((c) => c.role === 'Client');
    const freelancers = insertedContacts.filter((c) => c.role === 'Freelancer');

    const sampleProjects: Omit<Project, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        title: 'TechCorp Product Launch Video',
        description: 'High-end commercial for new AI product launch. 60-second spot for digital platforms.',
        type: 'Commercial',
        status: 'Active',
        phase: 'Production',
        client_id: clients[0]?.id,
        budget: 45000,
        start_date: '2025-10-01',
        end_date: '2025-11-15',
        team_members: [freelancers[0]?.id, freelancers[1]?.id].filter(Boolean),
      },
      {
        title: 'Fashion Brand SS25 Campaign',
        description: 'Series of 15-second social media spots for spring collection.',
        type: 'Social Media',
        status: 'Active',
        phase: 'Pre-production',
        client_id: clients[1]?.id,
        budget: 25000,
        start_date: '2025-11-01',
        end_date: '2025-12-20',
        team_members: [freelancers[0]?.id].filter(Boolean),
      },
      {
        title: '"Urban Stories" Music Video',
        description: 'Narrative music video for indie artist. Urban setting, performance and story elements.',
        type: 'Music Video',
        status: 'Active',
        phase: 'Post-production',
        client_id: clients[2]?.id,
        budget: 18000,
        start_date: '2025-09-15',
        end_date: '2025-10-30',
        team_members: [freelancers[1]?.id].filter(Boolean),
      },
      {
        title: 'Corporate Training Series',
        description: '5-part training video series for internal use. Professional, informative style.',
        type: 'Corporate',
        status: 'On Hold',
        phase: 'Pre-production',
        client_id: clients[0]?.id,
        budget: 32000,
        start_date: '2025-12-01',
        end_date: '2026-01-30',
        team_members: [],
      },
    ];

    const insertedProjects: Project[] = [];
    for (const project of sampleProjects) {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (error) {
        console.error('Error inserting project:', error);
        continue;
      }
      if (data) {
        insertedProjects.push(data);
        console.log(`✓ Inserted project: ${data.title}`);
      }
    }

    const sampleTasks: Omit<Task, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        title: 'Finalize script and storyboard',
        description: 'Complete script revisions based on client feedback and create detailed storyboard.',
        status: 'In Progress',
        project_id: insertedProjects[0]?.id,
        assigned_to: freelancers[0]?.id,
        due_date: '2025-10-20',
        priority: 'High',
        type: 'Creative',
      },
      {
        title: 'Scout filming locations',
        description: 'Find and secure 3 urban locations for shoot days.',
        status: 'To Do',
        project_id: insertedProjects[0]?.id,
        assigned_to: freelancers[1]?.id,
        due_date: '2025-10-22',
        priority: 'High',
        type: 'Administrative',
      },
      {
        title: 'Equipment rental booking',
        description: 'Book RED camera package and lighting equipment for 3-day shoot.',
        status: 'To Do',
        project_id: insertedProjects[0]?.id,
        assigned_to: freelancers[0]?.id,
        due_date: '2025-10-25',
        priority: 'Medium',
        type: 'Technical',
      },
      {
        title: 'Color grading session',
        description: 'Final color grading pass for all scenes. Client review scheduled.',
        status: 'In Review',
        project_id: insertedProjects[2]?.id,
        assigned_to: freelancers[1]?.id,
        due_date: '2025-10-25',
        priority: 'High',
        type: 'Technical',
      },
      {
        title: 'Sound mixing and mastering',
        description: 'Complete audio post-production including dialogue cleanup and music mix.',
        status: 'In Progress',
        project_id: insertedProjects[2]?.id,
        assigned_to: undefined,
        due_date: '2025-10-28',
        priority: 'High',
        type: 'Technical',
      },
      {
        title: 'Client mood board presentation',
        description: 'Create and present visual direction mood board for approval.',
        status: 'Completed',
        project_id: insertedProjects[1]?.id,
        assigned_to: freelancers[0]?.id,
        due_date: '2025-10-15',
        priority: 'Medium',
        type: 'Creative',
      },
      {
        title: 'Talent casting session',
        description: 'Review casting tapes and schedule callbacks for lead roles.',
        status: 'To Do',
        project_id: insertedProjects[1]?.id,
        assigned_to: undefined,
        due_date: '2025-10-30',
        priority: 'Medium',
        type: 'Administrative',
      },
      {
        title: 'Final deliverables export',
        description: 'Export final video in all required formats (4K, 1080p, social media formats).',
        status: 'To Do',
        project_id: insertedProjects[2]?.id,
        assigned_to: freelancers[1]?.id,
        due_date: '2025-10-30',
        priority: 'High',
        type: 'Technical',
      },
      {
        title: 'Insurance and permits',
        description: 'Secure production insurance and location filming permits.',
        status: 'In Progress',
        project_id: insertedProjects[0]?.id,
        assigned_to: undefined,
        due_date: '2025-10-23',
        priority: 'High',
        type: 'Administrative',
      },
      {
        title: 'Budget breakdown review',
        description: 'Review and finalize detailed budget breakdown for client approval.',
        status: 'To Do',
        project_id: insertedProjects[3]?.id,
        assigned_to: undefined,
        due_date: '2025-11-15',
        priority: 'Low',
        type: 'Administrative',
      },
    ];

    for (const task of sampleTasks) {
      const { data, error } = await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single();

      if (error) {
        console.error('Error inserting task:', error);
        continue;
      }
      if (data) {
        console.log(`✓ Inserted task: ${data.title}`);
      }
    }

    const sampleLocations: Omit<Location, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        name: 'Downtown Studio A',
        address: '123 Main Street, Los Angeles, CA 90012',
        type: 'Studio',
        contact_person: undefined,
        capacity: 25,
        amenities: ['Green Screen', 'Lighting Grid', 'Sound Dampening', 'Makeup Room', 'Props Storage'],
        hourly_rate: 250,
        notes: 'Full production studio with natural light option. Includes parking for 10 vehicles. Contact: Maria Santos',
        status: 'Available',
      },
      {
        name: 'Warehouse Loft - Arts District',
        address: '456 Industrial Way, Los Angeles, CA 90021',
        type: 'Indoor',
        contact_person: undefined,
        capacity: 50,
        amenities: ['High Ceilings', 'Exposed Brick', 'Large Windows', 'Freight Elevator'],
        hourly_rate: 180,
        notes: 'Raw industrial space perfect for urban aesthetic shoots. 3000 sq ft. Contact: Tom Richardson',
        status: 'Available',
      },
      {
        name: 'Beach Location - Malibu',
        address: 'Pacific Coast Highway, Malibu, CA 90265',
        type: 'Outdoor',
        contact_person: undefined,
        capacity: 30,
        amenities: ['Ocean View', 'Sandy Beach', 'Parking Area', 'Restroom Facilities'],
        hourly_rate: 400,
        notes: 'Private beach access with stunning sunset views. Permit required. Contact: Sarah Beach',
        status: 'Available',
      },
      {
        name: 'Modern Office Space - Century City',
        address: '789 Avenue of the Stars, Los Angeles, CA 90067',
        type: 'Indoor',
        contact_person: undefined,
        capacity: 15,
        amenities: ['Conference Rooms', 'City Views', 'Modern Furniture', 'WiFi', 'Kitchen'],
        hourly_rate: 200,
        notes: 'Sleek corporate setting ideal for commercial and corporate videos. Contact: David Chen',
        status: 'Available',
      },
      {
        name: 'Historic Theater - Downtown',
        address: '321 Broadway, Los Angeles, CA 90013',
        type: 'Indoor',
        contact_person: undefined,
        capacity: 100,
        amenities: ['Stage', 'Theater Seating', 'Vintage Architecture', 'Dressing Rooms', 'Lighting System'],
        hourly_rate: 350,
        notes: '1920s theater with ornate details. Perfect for music videos and performances. Contact: Linda Martinez',
        status: 'Available',
      },
      {
        name: 'Rooftop Garden - West Hollywood',
        address: '555 Sunset Boulevard, West Hollywood, CA 90069',
        type: 'Outdoor',
        contact_person: undefined,
        capacity: 40,
        amenities: ['City Skyline View', 'Garden Setting', 'Lounge Areas', 'Bar Setup'],
        hourly_rate: 300,
        notes: 'Stunning rooftop with downtown LA views. Evening shoots highly recommended. Contact: Jennifer Park',
        status: 'Available',
      },
      {
        name: 'Virtual Production Stage',
        address: '888 Tech Drive, Culver City, CA 90232',
        type: 'Studio',
        contact_person: undefined,
        capacity: 20,
        amenities: ['LED Volume Wall', 'Motion Capture', 'Real-time Rendering', 'Green Room', 'Tech Support'],
        hourly_rate: 500,
        notes: 'State-of-the-art virtual production facility with LED wall and Unreal Engine setup. Contact: Robert Kim',
        status: 'Available',
      },
    ];

    const insertedLocations: Location[] = [];
    for (const location of sampleLocations) {
      const { data, error } = await supabase
        .from('locations')
        .insert([location])
        .select()
        .single();

      if (error) {
        console.error('Error inserting location:', error);
        continue;
      }
      if (data) {
        insertedLocations.push(data);
        console.log(`✓ Inserted location: ${data.name}`);
      }
    }

    const sampleEquipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        name: 'RED Komodo 6K Camera',
        category: 'Camera',
        description: '6K cinema camera with global shutter. Includes V-mount battery kit.',
        status: 'Available',
        daily_rate: 450,
        notes: 'Popular for commercials and music videos. Book early.',
      },
      {
        name: 'Sony FX6 Full Frame Camera',
        category: 'Camera',
        description: 'Full-frame cinema camera with excellent low-light performance.',
        status: 'Available',
        daily_rate: 350,
        notes: 'Great for documentary and run-and-gun shooting.',
      },
      {
        name: 'Canon EOS C70 RF',
        category: 'Camera',
        description: 'Compact 4K Super 35mm cinema camera with RF mount.',
        status: 'Available',
        daily_rate: 300,
        notes: 'Perfect for indie productions and interviews.',
      },
      {
        name: 'ARRI SkyPanel S60-C LED',
        category: 'Lighting',
        description: 'Color-tunable LED softlight with wide color gamut.',
        status: 'Available',
        daily_rate: 200,
        notes: 'Industry standard for interviews and controlled lighting.',
      },
      {
        name: 'Aputure 600d Pro',
        category: 'Lighting',
        description: 'High-output daylight LED with wireless control.',
        status: 'Available',
        daily_rate: 180,
        notes: 'Powerful light for outdoor and large interior spaces.',
      },
      {
        name: 'Kino Flo 4-Bank System',
        category: 'Lighting',
        description: 'Classic fluorescent lighting system with soft, even output.',
        status: 'Available',
        daily_rate: 120,
        notes: 'Reliable choice for interview setups.',
      },
      {
        name: 'Sound Devices 833 Mixer',
        category: 'Audio',
        description: '12-input field mixer/recorder with timecode.',
        status: 'Available',
        daily_rate: 250,
        notes: 'Professional audio recording for narrative and documentary.',
      },
      {
        name: 'Sennheiser MKH 416 Shotgun Mic',
        category: 'Audio',
        description: 'Industry-standard shotgun microphone for film production.',
        status: 'Available',
        daily_rate: 50,
        notes: 'Essential for dialogue recording. Includes boom pole.',
      },
      {
        name: 'Wireless Lav Kit (4-channel)',
        category: 'Audio',
        description: 'Sennheiser G4 wireless lavalier system with 4 channels.',
        status: 'Available',
        daily_rate: 100,
        notes: 'Perfect for interviews and multi-person dialogue.',
      },
      {
        name: 'DJI Ronin 2 Gimbal',
        category: 'Grip',
        description: '3-axis gimbal stabilizer for cinema cameras up to 30lbs.',
        status: 'Available',
        daily_rate: 300,
        notes: 'Includes case, batteries, and ready rig support.',
      },
      {
        name: 'Dana Dolly Track System',
        category: 'Grip',
        description: 'Portable dolly system with 8ft rails.',
        status: 'Available',
        daily_rate: 150,
        notes: 'Smooth tracking shots. Quick setup and breakdown.',
      },
      {
        name: 'C-Stand Kit (6 stands)',
        category: 'Grip',
        description: 'Set of 6 professional C-stands with arms and flags.',
        status: 'Available',
        daily_rate: 60,
        notes: 'Essential grip equipment for any shoot.',
      },
      {
        name: 'DaVinci Resolve Studio License',
        category: 'Post-Production',
        description: 'Professional color grading and editing software.',
        status: 'Available',
        daily_rate: 0,
        notes: 'Available for in-house post-production projects.',
      },
      {
        name: 'Color Grading Suite',
        category: 'Post-Production',
        description: 'Dedicated room with calibrated monitor and color grading setup.',
        status: 'Available',
        daily_rate: 200,
        notes: 'Book for color grading sessions. Includes colorist consultation.',
      },
      {
        name: 'Audio Post Suite',
        category: 'Post-Production',
        description: 'Sound editing and mixing suite with Pro Tools.',
        status: 'Available',
        daily_rate: 180,
        notes: 'Full audio post-production facility with treated room.',
      },
    ];

    const insertedEquipment: Equipment[] = [];
    for (const equipment of sampleEquipment) {
      const { data, error } = await supabase
        .from('equipment')
        .insert([equipment])
        .select()
        .single();

      if (error) {
        console.error('Error inserting equipment:', error);
        continue;
      }
      if (data) {
        insertedEquipment.push(data);
        console.log(`✓ Inserted equipment: ${data.name}`);
      }
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const sampleBookings: Omit<EquipmentBooking, 'id' | 'created_at' | 'updated_at'>[] = [];
    if (insertedEquipment.length > 0) {
      sampleBookings.push(
        {
          equipment_id: insertedEquipment[0].id,
          start_time: tomorrow.toISOString(),
          end_time: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000).toISOString(),
          status: 'Reserved',
          notes: 'Commercial shoot - TechCorp project',
        },
        {
          equipment_id: insertedEquipment[3].id,
          start_time: tomorrow.toISOString(),
          end_time: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000).toISOString(),
          status: 'Reserved',
          notes: 'Commercial shoot - TechCorp project',
        }
      );
    }

    for (const booking of sampleBookings) {
      const { data, error } = await supabase
        .from('equipment_bookings')
        .insert([booking])
        .select()
        .single();

      if (error) {
        console.error('Error inserting booking:', error);
        continue;
      }
      if (data) {
        console.log(`✓ Inserted equipment booking`);
      }
    }

    const sampleCrewAvailability: Omit<CrewAvailability, 'id' | 'created_at' | 'updated_at'>[] = [];
    if (freelancers.length > 0) {
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        freelancers.forEach((freelancer, idx) => {
          let status: CrewAvailability['status'] = 'Available';
          if (i === 1 && idx === 0) {
            status = 'Booked';
          } else if (i === 2 && idx === 0) {
            status = 'Booked';
          } else if (i === 5 && idx === 1) {
            status = 'Tentative';
          } else if (i === 8 && idx === 0) {
            status = 'Unavailable';
          }

          sampleCrewAvailability.push({
            contact_id: freelancer.id,
            date: dateStr,
            status,
            notes: status === 'Booked' ? 'On another production' : '',
          });
        });
      }
    }

    for (const availability of sampleCrewAvailability) {
      const { data, error } = await supabase
        .from('crew_availability')
        .insert([availability])
        .select()
        .single();

      if (error) {
        console.error('Error inserting crew availability:', error);
        continue;
      }
      if (data) {
        console.log(`✓ Inserted crew availability`);
      }
    }

    console.log('\n✅ Database seed completed successfully!');
    console.log(`   - ${insertedContacts.length} contacts`);
    console.log(`   - ${insertedProjects.length} projects`);
    console.log(`   - ${sampleTasks.length} tasks`);
    console.log(`   - ${insertedLocations.length} locations`);
    console.log(`   - ${insertedEquipment.length} equipment items`);
    console.log(`   - ${sampleBookings.length} equipment bookings`);
    console.log(`   - ${sampleCrewAvailability.length} crew availability records`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seedDatabase();
