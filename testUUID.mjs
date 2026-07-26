import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data: users } = await supabase.from('users').select('id').limit(2);
  if (!users || users.length < 2) return;
  
  const senderUUID = users[0].id;
  const receiverUUID = users[1].id;
  
  const { data, error } = await supabase.from('messages').insert({
    id: "not-a-uuid", 
    sender_id: senderUUID,
    receiver_id: receiverUUID,
    content: 'Test message with ID',
    is_read: false
  });
  
  if (error) {
    console.log("Error inserting message:", JSON.stringify(error, null, 2));
  } else {
    console.log("Insert success!");
  }
}

testInsert();
