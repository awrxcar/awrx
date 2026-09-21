import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mbfyvqtjzymfufemplva.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZnl2cXRqenltZnVmZW1wbHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1ODkwNDUsImV4cCI6MjEwMTE2NTA0NX0.hi8GFQJcoI-FBL_nM6pWXH-L7xTNtWTZQc8zpftuhzs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
