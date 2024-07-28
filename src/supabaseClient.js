import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jnvqhxnjhgvmsxkauiwh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudnFoeG5qaGd2bXN4a2F1aXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA5NzE4NjYsImV4cCI6MjAzNjU0Nzg2Nn0.b9L-IIbdPUqxmDat1AO2UsKOaCw9jUN23F_6DvDY7qY';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

