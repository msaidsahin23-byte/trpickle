import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.log("No Supabase credentials found in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase.from('messages').insert({
    sender_id: '1',
    receiver_id: '2',
    content: 'Test message',
    is_read: false
  });
  
  if (error) {
    console.log("Error inserting message:", JSON.stringify(error, null, 2));
  } else {
    console.log("Insert success:", data);
  }
}

testInsert();
