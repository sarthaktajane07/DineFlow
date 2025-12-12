-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('manager', 'host', 'staff');

-- Create enum for table status
CREATE TYPE public.table_status AS ENUM ('free', 'occupied', 'cleaning', 'reserved');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create restaurant_tables table
CREATE TABLE public.restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL,
  seats INTEGER NOT NULL DEFAULT 4,
  status table_status NOT NULL DEFAULT 'free',
  zone TEXT DEFAULT 'main',
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  party_name TEXT,
  party_size INTEGER,
  seated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create waitlist_entries table
CREATE TABLE public.waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 2,
  phone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  estimated_wait_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  notified_at TIMESTAMP WITH TIME ZONE,
  seated_at TIMESTAMP WITH TIME ZONE
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Managers can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

-- Restaurant tables policies
CREATE POLICY "Authenticated users can view tables"
  ON public.restaurant_tables FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update tables"
  ON public.restaurant_tables FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tables"
  ON public.restaurant_tables FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Managers can delete tables"
  ON public.restaurant_tables FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

-- Waitlist policies
CREATE POLICY "Authenticated users can view waitlist"
  ON public.waitlist_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage waitlist"
  ON public.waitlist_entries FOR ALL
  TO authenticated
  USING (true);

-- Activity logs policies
CREATE POLICY "Authenticated users can view logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'staff')
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Timestamp triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurant_tables_updated_at
  BEFORE UPDATE ON public.restaurant_tables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for tables and waitlist
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.waitlist_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;

-- Ensure replica identity for realtime
ALTER TABLE public.restaurant_tables REPLICA IDENTITY FULL;
ALTER TABLE public.waitlist_entries REPLICA IDENTITY FULL;
ALTER TABLE public.activity_logs REPLICA IDENTITY FULL;

-- Insert default tables
INSERT INTO public.restaurant_tables (table_number, seats, status, zone, position_x, position_y) VALUES
  (1, 4, 'free', 'main', 50, 50),
  (2, 2, 'free', 'main', 200, 50),
  (3, 6, 'free', 'main', 350, 50),
  (4, 4, 'free', 'patio', 50, 200),
  (5, 8, 'free', 'vip', 200, 200),
  (6, 2, 'free', 'main', 350, 200),
  (7, 4, 'free', 'main', 50, 350),
  (8, 4, 'free', 'patio', 200, 350);