import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cdpalrnckouanozfohcz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcGFscm5ja291YW5vemZvaGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MTQ4ODQsImV4cCI6MjA2MTA5MDg4NH0.kXEAzYsHJ6UuG2wdNKD4CUQWt-w6Mlw8ropk2j5F0po'
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey) 