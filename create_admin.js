const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ahzpbqjtarzxxtanqdoa.supabase.co';
const supabaseAnonKey = 'sb_publishable_JkeYEFOFRGrC96jbgRsSZQ_ii1qa-s3';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
  console.log("Signing up admin user...");
  const { data, error } = await supabase.auth.signUp({
    email: 'bilgi.trpickle@gmail.com',
    password: 'TurkTursu.2580',
  });

  if (error) {
    console.error("Signup error:", error.message);
    return;
  }

  console.log("Signup successful. User ID:", data.user?.id);

  if (data.user) {
    console.log("Inserting into public.users...");
    const { error: insertError } = await supabase.from('users').insert({
      id: data.user.id,
      email: 'bilgi.trpickle@gmail.com',
      name: 'TRPickle Yönetim',
      username: 'trpickle',
      gender: 'male',
      city: 'İstanbul',
      birthdate: '2000-01-01',
      singles_rating: 2.5,
      doubles_rating: 2.5,
      role: 'admin'
    });

    if (insertError) {
      console.error("Insert error:", insertError.message);
      
      console.log("Trying to update instead...");
      const { error: updateError } = await supabase.from('users').update({
        name: 'TRPickle Yönetim',
        username: 'trpickle',
        role: 'admin'
      }).eq('id', data.user.id);
      
      if (updateError) {
         console.error("Update error:", updateError.message);
      } else {
         console.log("Update successful!");
      }
    } else {
      console.log("Insert successful!");
    }
  }
}

createAdmin();
