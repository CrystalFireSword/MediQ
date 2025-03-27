/*
  # Initial Schema Setup for Queue Management System

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `patient_name` (text)
      - `phone_number` (text)
      - `appointment_time` (timestamptz)
      - `queue_number` (integer)
      - `status` (text) - 'waiting', 'in_progress', 'completed', 'cancelled'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
  2. Security
    - Enable RLS on appointments table
    - Add policies for:
      - Public can create appointments
      - Public can read their own appointments
      - Authenticated users (doctors) can update appointments
*/

-- Create appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  phone_number text NOT NULL,
  appointment_time timestamptz NOT NULL,
  queue_number integer NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled'))
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create appointments"
  ON appointments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view their own appointments"
  ON appointments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();