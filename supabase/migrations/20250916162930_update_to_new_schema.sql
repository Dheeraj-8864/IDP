-- Migration to update schema to new requirements
-- This migration transforms the existing UUID-based schema to serial-based schema with new table structure

-- First, drop existing policies and triggers to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view drones" ON public.drones;
DROP POLICY IF EXISTS "Admins can manage drones" ON public.drones;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.borrow_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.borrow_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.borrow_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.borrow_requests;
DROP POLICY IF EXISTS "Admins can view logs" ON public.logs;
DROP POLICY IF EXISTS "Users can create logs" ON public.logs;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_drones_updated_at ON public.drones;
DROP TRIGGER IF EXISTS update_borrow_requests_updated_at ON public.borrow_requests;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing tables (in correct order to handle foreign key constraints)
DROP TABLE IF EXISTS public.borrow_requests CASCADE;
DROP TABLE IF EXISTS public.logs CASCADE;
DROP TABLE IF EXISTS public.drones CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create new profiles table with serial ID and additional fields
CREATE TABLE public.profiles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    password TEXT NOT NULL, -- ⚠️ Plain text not recommended; ideally hash it
    role TEXT NOT NULL CHECK (role IN ('user','admin','superadmin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drone_models table
CREATE TABLE public.drone_models (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    manufacturer TEXT,
    specs JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create new drones table with reference to drone_models
CREATE TABLE public.drones (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    model_id INT REFERENCES public.drone_models(id) ON DELETE SET NULL,
    image_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('available','borrowed','damaged','maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create new borrow_requests table
CREATE TABLE public.borrow_requests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.profiles(id) ON DELETE CASCADE,
    drone_id INT REFERENCES public.drones(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','returned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create borrow_history table
CREATE TABLE public.borrow_history (
    id SERIAL PRIMARY KEY,
    request_id INT REFERENCES public.borrow_requests(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('approved','rejected','returned')),
    performed_by INT REFERENCES public.profiles(id) ON DELETE SET NULL,
    condition_report TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_logs table
CREATE TABLE public.maintenance_logs (
    id SERIAL PRIMARY KEY,
    drone_id INT REFERENCES public.drones(id) ON DELETE CASCADE,
    performed_by INT REFERENCES public.profiles(id) ON DELETE SET NULL,
    condition TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table (renamed from logs)
CREATE TABLE public.activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drone_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = (current_setting('app.current_user_id', true))::int);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = (current_setting('app.current_user_id', true))::int);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (current_setting('app.current_user_id', true))::int
    AND role IN ('admin', 'superadmin')
  )
);

-- Create policies for drone_models
CREATE POLICY "Everyone can view drone models" 
ON public.drone_models 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage drone models" 
ON public.drone_models 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (current_setting('app.current_user_id', true))::int
    AND role IN ('admin', 'superadmin')
  )
);

-- Create policies for drones
CREATE POLICY "Everyone can view drones" 
ON public.drones 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage drones" 
ON public.drones 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (current_setting('app.current_user_id', true))::int
    AND role IN ('admin', 'superadmin')
  )
);

-- Create policies for borrow_requests
CREATE POLICY "Users can view their own requests" 
ON public.borrow_requests 
FOR SELECT 
USING (user_id = (current_setting('app.current_user_id', true))::int);

CREATE POLICY "Users can create requests" 
ON public.borrow_requests 
FOR INSERT 
WITH CHECK (user_id = (current_setting('app.current_user_id', true))::int);

CREATE POLICY "Admins can view all requests" 
ON public.borrow_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (current_setting('app.current_user_id', true))::int
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can update requests" 
ON public.borrow_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (current_setting('app.current_user_id', true))::int
    AND role IN ('admin', 'superadmin')
  )
);

-- Create policies for borrow_history
CREATE POLICY "Admins can view borrow history" 
ON public.borrow_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (current_setting('app.current_user_id', true))::int
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can create borrow history" 
ON public.borrow_history 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (current_setting('app.current_user_id', true))::int
    AND role IN ('admin', 'superadmin')
  )
);

-- Create policies for maintenance_logs
CREATE POLICY "Admins can view maintenance logs" 
ON public.maintenance_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (current_setting('app.current_user_id', true))::int
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can create maintenance logs" 
ON public.maintenance_logs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (current_setting('app.current_user_id', true))::int
    AND role IN ('admin', 'superadmin')
  )
);

-- Create policies for activity_logs
CREATE POLICY "Admins can view activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (current_setting('app.current_user_id', true))::int
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can create activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (user_id = (current_setting('app.current_user_id', true))::int);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drones_updated_at
  BEFORE UPDATE ON public.drones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_borrow_requests_updated_at
  BEFORE UPDATE ON public.borrow_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample drone models
INSERT INTO public.drone_models (name, manufacturer, specs) VALUES
('Mavic 3 Classic', 'DJI', '{"camera": "4K/120fps", "flight_time": "46 minutes", "range": "15 km"}'),
('Mini 4 Pro', 'DJI', '{"camera": "4K/60fps", "flight_time": "34 minutes", "range": "20 km"}'),
('EVO Lite Plus', 'Autel', '{"camera": "6K", "flight_time": "40 minutes", "range": "12 km"}'),
('Air 3', 'DJI', '{"camera": "4K/100fps", "flight_time": "46 minutes", "range": "20 km"}'),
('Skydio 2 Plus', 'Skydio', '{"camera": "4K/60fps", "flight_time": "27 minutes", "range": "6 km"}');

-- Insert sample drones with references to drone models
INSERT INTO public.drones (name, model_id, status, image_url) VALUES
('DJI Mavic 3', 1, 'available', null),
('DJI Mini 4 Pro', 2, 'available', null),
('Autel EVO Lite+', 3, 'available', null),
('DJI Air 3', 4, 'maintenance', null),
('Skydio 2+', 5, 'available', null);

-- Create function to set current user ID for RLS
CREATE OR REPLACE FUNCTION set_current_user_id(user_id INT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample admin user
INSERT INTO public.profiles (name, email, password, role) VALUES
('Admin User', 'admin@example.com', 'admin123', 'admin'),
('Super Admin', 'superadmin@example.com', 'superadmin123', 'superadmin'),
('Test User', 'user@example.com', 'user123', 'user');