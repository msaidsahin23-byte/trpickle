const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ahzpbqjtarzxxtanqdoa.supabase.co',
  'sb_publishable_JkeYEFOFRGrC96jbgRsSZQ_ii1qa-s3'
);

console.log("Connecting to Supabase Realtime...");

const channel = supabase.channel('global-notifications');

channel.on('broadcast', { event: 'new_message' }, (payload) => {
  console.log("Received new_message:", payload);
});

channel.on('broadcast', { event: 'update_follow' }, (payload) => {
  console.log("Received update_follow:", payload);
});

channel.on('broadcast', { event: 'new_notification' }, (payload) => {
  console.log("Received new_notification:", payload);
});

channel.subscribe((status) => {
  console.log("Channel status:", status);
  if (status === 'SUBSCRIBED') {
     console.log("Successfully subscribed. Sending test broadcast...");
     channel.send({
       type: 'broadcast',
       event: 'test_event',
       payload: { hello: 'world' }
     }).then(res => {
        console.log("Send result:", res);
     }).catch(err => {
        console.error("Send error:", err);
     });
  }
});

// Keep process alive for 10 seconds
setTimeout(() => {
  console.log("Test finished.");
  process.exit(0);
}, 10000);
