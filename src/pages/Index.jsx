import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TableMap } from '@/components/TableMap';
import { WaitlistPanel } from '@/components/WaitlistPanel';
import { Navbar } from '@/components/Navbar';
import { toast } from '@/hooks/use-toast';
import { ChefHat, Zap, Bell, Users, LayoutGrid, ArrowRight, Check, Star } from 'lucide-react';
// Demo data
const demoTables = [
    { id: '1', table_number: 1, seats: 4, status: 'free', zone: 'main', position_x: 50, position_y: 50, party_name: null, party_size: null, seated_at: null, created_at: '', updated_at: '' },
    { id: '2', table_number: 2, seats: 2, status: 'occupied', zone: 'main', position_x: 200, position_y: 50, party_name: 'Smith', party_size: 2, seated_at: new Date().toISOString(), created_at: '', updated_at: '' },
    { id: '3', table_number: 3, seats: 6, status: 'cleaning', zone: 'main', position_x: 350, position_y: 50, party_name: null, party_size: null, seated_at: null, created_at: '', updated_at: '' },
    { id: '4', table_number: 4, seats: 4, status: 'reserved', zone: 'patio', position_x: 50, position_y: 200, party_name: null, party_size: null, seated_at: null, created_at: '', updated_at: '' },
    { id: '5', table_number: 5, seats: 8, status: 'free', zone: 'vip', position_x: 200, position_y: 200, party_name: null, party_size: null, seated_at: null, created_at: '', updated_at: '' },
];
const demoWaitlist = [
    { id: 'w1', guest_name: 'Johnson Family', party_size: 4, phone: '+1 555-0123', notes: null, status: 'waiting', estimated_wait_minutes: 15, created_at: new Date(Date.now() - 600000).toISOString(), notified_at: null, seated_at: null },
    { id: 'w2', guest_name: 'Maria Garcia', party_size: 2, phone: '+1 555-0456', notes: 'Anniversary', status: 'waiting', estimated_wait_minutes: 10, created_at: new Date(Date.now() - 300000).toISOString(), notified_at: null, seated_at: null },
];
const features = [
    { icon: Zap, title: 'Real-Time Updates', description: 'See table status changes instantly across all devices with WebSocket sync.' },
    { icon: LayoutGrid, title: 'Visual Floor Plan', description: 'Interactive drag-and-drop table map with color-coded status indicators.' },
    { icon: Users, title: 'Smart Waitlist', description: 'Manage queues efficiently with estimated wait times and notifications.' },
    { icon: Bell, title: 'Instant Notifications', description: 'Alert guests via SMS when their table is ready.' },
];
const steps = [
    { number: '01', title: 'Add Guest to Waitlist', description: 'Front desk enters guest name, party size, and phone number.' },
    { number: '02', title: 'Track Table Availability', description: 'Staff monitors live table statuses on the dashboard in real-time.' },
    { number: '03', title: 'Seat & Notify Guests', description: 'Drag guests to tables or send automatic notifications when ready.' },
];
const benefits = [
    'Reduce wait times by 40%',
    'Improve staff efficiency',
    'Avoid lost customers',
    'Works on all devices',
];
const plans = [
    { name: 'Starter', price: 'Free', description: 'Perfect for trying out', features: ['Up to 10 tables', 'Basic waitlist', 'Email notifications'] },
    { name: 'Pro', price: '$49/mo', description: 'For busy restaurants', features: ['Unlimited tables', 'SMS notifications', 'Analytics dashboard', 'Priority support'], popular: true },
    { name: 'Enterprise', price: 'Custom', description: 'For chains & franchises', features: ['Multi-location', 'Custom integrations', 'Dedicated support', 'API access'] },
];
export default function Index() {
    const [tables, setTables] = useState(demoTables);
    const [waitlist, setWaitlist] = useState(demoWaitlist);
    const handleTableClick = (table) => {
        const statuses = ['free', 'occupied', 'cleaning', 'reserved'];
        const currentIndex = statuses.indexOf(table.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        setTables(tables.map(t => t.id === table.id ? { ...t, status: nextStatus } : t));
        toast({
            title: 'Table Updated',
            description: `Table ${table.table_number} is now ${nextStatus}`,
        });
    };
    const handleDropGuest = (waitlistId, tableId) => {
        const guest = waitlist.find(w => w.id === waitlistId);
        if (!guest)
            return;
        setTables(tables.map(t => t.id === tableId ? { ...t, status: 'occupied', party_name: guest.guest_name, party_size: guest.party_size } : t));
        setWaitlist(waitlist.filter(w => w.id !== waitlistId));
        toast({
            title: 'Guest Seated',
            description: `${guest.guest_name} has been seated`,
        });
    };
    const handleAddGuest = async (name, partySize, phone) => {
        const newEntry = {
            id: `w${Date.now()}`,
            guest_name: name,
            party_size: partySize,
            phone: phone || null,
            notes: null,
            status: 'waiting',
            estimated_wait_minutes: 15,
            created_at: new Date().toISOString(),
            notified_at: null,
            seated_at: null,
        };
        setWaitlist([...waitlist, newEntry]);
        return true;
    };
    const handleNotify = async (id) => {
        setWaitlist(waitlist.map(w => w.id === id ? { ...w, notified_at: new Date().toISOString() } : w));
        toast({
            title: 'Notification Sent',
            description: 'Guest has been notified their table is ready',
        });
        return true;
    };
    const handleRemove = async (id) => {
        setWaitlist(waitlist.filter(w => w.id !== id));
        return true;
    };
    return (<div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-hero text-primary-foreground overflow-hidden min-h-[85vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.jpg" alt="Restaurant Ambiance" className="w-full h-full object-cover opacity-40 blur-[2px]"/>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60"/>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,hsl(var(--background))_100%)]"/>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(25_95%_53%/0.15),transparent_50%)] z-0 pointer-events-none"/>
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/30">
              <Star className="w-4 h-4"/>
              <span className="text-sm font-medium">Restaurant Management Reimagined</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
              Real-Time Table & Waitlist Management{' '}
              <span className="text-gradient">Made Easy</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto">
              Optimize seating, reduce customer wait times, and streamline restaurant operations—all in one smart dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="gap-2 text-lg px-8 animate-pulse-glow">
                  Get Started Free
                  <ArrowRight className="w-5 h-5"/>
                </Button>
              </Link>
              <Link to="#demo">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  View Live Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"/>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Key Features
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to manage your restaurant floor efficiently
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (<Card key={feature.title} className="shadow-card border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary"/>
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Interactive Demo
            </h2>
            <p className="text-muted-foreground text-lg">
              Click tables to change status or drag guests from the waitlist to seat them
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <TableMap tables={tables} waitlist={waitlist} onTableClick={handleTableClick} onDropGuest={handleDropGuest}/>
                </CardContent>
              </Card>
            </div>
            <div>
              <WaitlistPanel waitlist={waitlist} onAddGuest={handleAddGuest} onNotify={handleNotify} onRemove={handleRemove}/>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              How DineFlow Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to streamline your restaurant operations
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (<div key={step.number} className="relative animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="text-8xl font-display font-bold text-primary/10 absolute -top-8 left-0">
                  {step.number}
                </div>
                <div className="relative pt-12 pl-4">
                  <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (<div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border"/>)}
              </div>))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28 bg-hero text-primary-foreground">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Why Choose DineFlow?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (<div key={benefit} className="flex items-center gap-3 animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary-foreground"/>
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </div>))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl"/>
              <Card className="relative shadow-2xl">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Average Wait Time</span>
                      <span className="font-bold text-2xl text-status-free">-40%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-3/5 bg-gradient-to-r from-primary to-amber-glow rounded-full"/>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-muted-foreground">Table Turnover</span>
                      <span className="font-bold text-2xl text-status-free">+25%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-4/5 bg-gradient-to-r from-primary to-amber-glow rounded-full"/>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose the plan that fits your restaurant's needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (<Card key={plan.name} className={`shadow-card relative overflow-hidden animate-fade-in ${plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'}`} style={{ animationDelay: `${index * 100}ms` }}>
                {plan.popular && (<div className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Most Popular
                  </div>)}
                <CardContent className="p-6">
                  <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                  <div className="my-6">
                    <span className="font-display text-4xl font-bold">{plan.price}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (<li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary"/>
                        {feature}
                      </li>))}
                  </ul>
                  <Link to="/auth">
                    <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-primary"/>
              <span className="font-display text-xl font-bold">DineFlow</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </nav>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DineFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>);
}
