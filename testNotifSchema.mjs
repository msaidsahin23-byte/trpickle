import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotifSchema() {
  const { data, error } = await supabase.from('notifications')
    .update({ read: true })
    .eq('user_id', '1')
    .select();
    
  if (error) {
    console.log("Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success with '1'!", data);
  }
}

testNotifSchema();
