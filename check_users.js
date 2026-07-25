const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ahzpbqjtarzxxtanqdoa.supabase.co';
const supabaseAnonKey = 'sb_publishable_JkeYEFOFRGrC96jbgRsSZQ_ii1qa-s3';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error("Error fetching users:", error);
  } else {
    console.log("Users in public.users:");
    console.log(JSON.stringify(data, null, 2));
  }
}

checkUsers();
