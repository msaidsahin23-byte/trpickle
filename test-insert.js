const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ahzpbqjtarzxxtanqdoa.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_JkeYEFOFRGrC96jbgRsSZQ_ii1qa-s3';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase.from('users').insert({
    id: 'test-uuid-1234',
    email: 'test@example.com',
    name: 'Test User',
    username: 'testuser123',
    city: 'Istanbul',
    gender: 'male',
    birthdate: '2000-01-01',
    singles_rating: 2.5,
    doubles_rating: 2.5,
    role: "user"
  });
  console.log("Insert result:", { data, error });
}

testInsert();
