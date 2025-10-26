-- Create table for tracking page visits with UTM parameters
CREATE TABLE public.page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  page_path TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer TEXT,
  user_agent TEXT,
  session_id TEXT
);

-- Create table for tracking click events
CREATE TABLE public.click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  button_id TEXT NOT NULL,
  button_text TEXT,
  page_path TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  session_id TEXT,
  user_agent TEXT
);

-- Enable RLS (making tables publicly accessible for tracking)
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert tracking data (public tracking)
CREATE POLICY "Allow public insert on page_visits"
  ON public.page_visits
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public insert on click_events"
  ON public.click_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to view all analytics data
CREATE POLICY "Allow authenticated users to view page_visits"
  ON public.page_visits
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to view click_events"
  ON public.click_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_page_visits_created_at ON public.page_visits(created_at DESC);
CREATE INDEX idx_page_visits_utm_source ON public.page_visits(utm_source);
CREATE INDEX idx_click_events_created_at ON public.click_events(created_at DESC);
CREATE INDEX idx_click_events_button_id ON public.click_events(button_id);