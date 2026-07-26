import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotifUpdate() {
  const { data, error } = await supabase.from('notifications')
    .update({ read: true })
    .eq('user_id', '362239f5-c274-4514-aea0-680723c6a4e9')
    .select();
    
  if (error) {
    console.log("Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success updated:", data);
  }
}

testNotifUpdate();
