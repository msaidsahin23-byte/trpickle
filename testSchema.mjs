import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
   // Try inserting temp id to see if it gives uuid error
   const { error } = await supabase.from('messages').insert({
      id: 'temp-12345',
      sender_id: '362239f5-c274-4514-aea0-680723c6a4e9', // using the fake user id
      receiver_id: '362239f5-c274-4514-aea0-680723c6a4e9',
      content: 'test',
      is_read: false
   });
   console.log("Error inserting temp-12345:", error);
}
checkSchema();
