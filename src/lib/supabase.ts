import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

let globalChannel: any = null;
let isSubscribed = false;
let isSubscribing = false;

export const getGlobalChannel = () => {
  if (!globalChannel) {
    globalChannel = supabase.channel('global-notifications');
  }
  return globalChannel;
};

export const subscribeGlobalChannel = () => {
  const channel = getGlobalChannel();
  if (!isSubscribed && !isSubscribing) {
    isSubscribing = true;
    channel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        isSubscribed = true;
        isSubscribing = false;
      }
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        isSubscribed = false;
        isSubscribing = false;
      }
    });
  }
};

export const sendReliableBroadcast = async (payloadObj: any) => {
  const channel = getGlobalChannel();
  
  // Wait up to 2 seconds for subscription to complete if not ready
  let attempts = 0;
  while (!isSubscribed && attempts < 20) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }
  
  channel.send(payloadObj);
};
