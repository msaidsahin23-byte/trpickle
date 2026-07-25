const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ahzpbqjtarzxxtanqdoa.supabase.co';
const supabaseAnonKey = 'sb_publishable_JkeYEFOFRGrC96jbgRsSZQ_ii1qa-s3';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixUsers() {
  // 1. Delete all users except bilgi.trpickle@gmail.com
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .neq('email', 'bilgi.trpickle@gmail.com');
  
  if (deleteError) {
    console.error("Delete error:", deleteError);
  } else {
    console.log("Deleted all other users successfully.");
  }

  // 2. Fix the admin account
  const { error: updateError } = await supabase
    .from('users')
    .update({
      name: 'TRPickle Yönetim',
      username: 'trpickle',
      role: 'admin',
      gender: 'male',
      city: 'İstanbul',
      birthdate: '2000-01-01',
      singles_rating: 2.5,
      doubles_rating: 2.5
    })
    .eq('email', 'bilgi.trpickle@gmail.com');

  if (updateError) {
    console.error("Update error:", updateError);
  } else {
    console.log("Admin account updated successfully.");
  }
}

fixUsers();
