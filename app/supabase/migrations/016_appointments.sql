-- Migration 016: Appointment / RDV system
-- Availability slots and appointments with full booking flow

-- 1. Availability slots (recurring weekly schedule)
CREATE TABLE IF NOT EXISTS ivoireio_availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Dimanche, 6=Samedi
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_avail_slots_profile ON ivoireio_availability_slots(profile_id);

-- 2. Appointments
CREATE TABLE IF NOT EXISTS ivoireio_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  guest_profile_id UUID REFERENCES ivoireio_profiles(id) ON DELETE SET NULL,
  guest_name VARCHAR(100) NOT NULL,
  guest_email VARCHAR(200) NOT NULL,
  guest_phone VARCHAR(20),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status VARCHAR(20) DEFAULT 'confirmed'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  cancellation_reason TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_host ON ivoireio_appointments(host_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON ivoireio_appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_guest ON ivoireio_appointments(guest_profile_id);

-- 3. RLS
ALTER TABLE ivoireio_availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ivoireio_appointments ENABLE ROW LEVEL SECURITY;

-- Availability: public read (for booking page), owner write
CREATE POLICY avail_public_read ON ivoireio_availability_slots
  FOR SELECT USING (true);
CREATE POLICY avail_owner_all ON ivoireio_availability_slots
  FOR ALL USING (profile_id = auth.uid());

-- Appointments: host can manage, guest can see own, public can insert (booking)
CREATE POLICY appts_host_all ON ivoireio_appointments
  FOR ALL USING (host_id = auth.uid());
CREATE POLICY appts_guest_select ON ivoireio_appointments
  FOR SELECT USING (guest_profile_id = auth.uid());
CREATE POLICY appts_public_insert ON ivoireio_appointments
  FOR INSERT WITH CHECK (true); -- Anyone can book via public booking page
CREATE POLICY appts_admin ON ivoireio_appointments
  FOR ALL USING (EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
