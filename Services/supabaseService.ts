
import { createClient } from '@supabase/supabase-js';
import { Profile } from '../types';

const SUPABASE_URL: string = "https://fwapuuydshhhetwpzspb.supabase.co";
const SUPABASE_ANON_KEY: string = "sb_publishable_aFO3_Gpss4DpbFAkT4c1KQ_AprA9Hfy";

export const isConfigured = () => SUPABASE_URL && SUPABASE_URL.includes("supabase.co");

export const supabase = createClient(
  SUPABASE_URL, 
  SUPABASE_ANON_KEY
);

const handleSupabaseError = (error: any) => {
  if (!error) return null;
  console.debug("[Protocol_Security_Audit]", {
    code: error.code,
    msg: error.message,
    hint: error.hint,
    ts: new Date().toISOString()
  });
  return error.message || "Database connection issue.";
};

export const registerUser = async (name: string, email: string, password: string) => {
  if (!isConfigured()) return { success: false, error: "Cloud not configured." };

  try {
    const { data: authData, error: authError } = await supabase
      .from('auth_users')
      .insert({
        name,
        email: email.toLowerCase().trim(),
        password_hash: password 
      })
      .select()
      .single();

    if (authError) return { success: false, error: handleSupabaseError(authError) };

    await supabase.from('profiles').insert({
      id: authData.id,
      name,
      image_url: `https://picsum.photos/seed/${authData.id}/600/800`,
      interests: []
    });

    return { success: true, data: authData };
  } catch (e) {
    return { success: false, error: "Critical auth failure." };
  }
};

export const authenticateUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase
      .from('auth_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('password_hash', password)
      .maybeSingle();

    if (error) return { success: false, error: handleSupabaseError(error) };
    if (!data) return { success: false, error: "Invalid identity credentials." };

    return { success: true, data };
  } catch (e) {
    return { success: false, error: "Network encryption timeout." };
  }
};

/**
 * Initiates the password recovery protocol.
 * Generates a 6-digit token and sets expiry.
 */
export const initiatePasswordReset = async (email: string) => {
  try {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    const { data, error } = await supabase
      .from('auth_users')
      .update({ reset_token: token, token_expiry: expiry })
      .eq('email', email.toLowerCase().trim())
      .select()
      .maybeSingle();

    if (error) return { success: false, error: handleSupabaseError(error) };
    if (!data) return { success: false, error: "Identity not found in archive." };

    // In a real-world scenario, this token would be emailed.
    // For V1 Genesis, we log it to the console for the Architect to test.
    console.debug(`[RECOVERY_NODE] Security Code for ${email}: ${token}`);

    return { success: true, token }; // Returning token for easy demo/testing
  } catch (e) {
    return { success: false, error: "Recovery broadcast failed." };
  }
};

/**
 * Validates the token and updates the password.
 */
export const verifyAndResetPassword = async (email: string, token: string, newPassword: string) => {
  try {
    const { data, error } = await supabase
      .from('auth_users')
      .select('id, reset_token, token_expiry')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) return { success: false, error: handleSupabaseError(error) };
    if (!data) return { success: false, error: "Identity not found." };

    if (data.reset_token !== token) return { success: false, error: "Invalid security token." };
    if (new Date(data.token_expiry) < new Date()) return { success: false, error: "Token expired." };

    const { error: updateError } = await supabase
      .from('auth_users')
      .update({ 
        password_hash: newPassword,
        reset_token: null,
        token_expiry: null
      })
      .eq('id', data.id);

    if (updateError) return { success: false, error: handleSupabaseError(updateError) };

    return { success: true };
  } catch (e) {
    return { success: false, error: "Credential override failed." };
  }
};

export const resetPassword = async (email: string, newPassword: string) => {
  // Legacy function - redirected to the new secure flow if needed, 
  // but we prefer initiatePasswordReset -> verifyAndResetPassword
  return verifyAndResetPassword(email, "OVERRIDE", newPassword);
};

export const syncProfileToCloud = async (userId: string, profile: any) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name: profile.name,
        age: profile.age,
        bio: profile.bio,
        interests: profile.interests,
        public_key: typeof profile.publicKey === 'string' ? profile.publicKey : JSON.stringify(profile.publicKey),
        image_url: profile.userImageUrl,
        is_verified: profile.isVerified
      });
      
    return { success: !error, error: handleSupabaseError(error) };
  } catch (e) {
    return { success: false, error: "Sync handshake failed." };
  }
};

export const fetchCloudProfiles = async (excludeId?: string): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(50);

    if (error || !data) return [];

    return data
      .filter(p => p.id !== excludeId)
      .map(p => ({
        id: p.id,
        name: p.name || 'Anonymous User',
        age: p.age || 24,
        gender: p.gender || 'non-binary',
        bio: p.bio || '',
        interests: p.interests || [],
        imageUrl: p.image_url || `https://picsum.photos/seed/${p.id}/600/800`,
        distance: 'Nearby',
        isVerified: p.is_verified,
        publicKey: p.public_key,
        isAi: p.is_ai || false
      }));
  } catch (e) {
    return [];
  }
};

export const recordSwipe = async (senderId: string, recipientId: string, isLike: boolean) => {
  try {
    const { error } = await supabase.from('swipes').insert({
      sender_id: senderId,
      recipient_id: recipientId,
      is_like: isLike
    });

    if (error || !isLike) return { isMatch: false };

    const { data: mutual } = await supabase
      .from('swipes')
      .select('id')
      .eq('sender_id', recipientId)
      .eq('recipient_id', senderId)
      .eq('is_like', true)
      .maybeSingle();

    if (mutual) {
      await supabase.from('matches').insert({ user1_id: senderId, user2_id: recipientId });
      return { isMatch: true };
    }
    return { isMatch: false };
  } catch (e) {
    return { isMatch: false };
  }
};

export const fetchMatches = async (userId: string): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        id,
        user1:profiles!matches_user1_id_fkey(*),
        user2:profiles!matches_user2_id_fkey(*)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error || !data) return [];

    return data.map((m: any) => {
      const other = m.user1?.id === userId ? m.user2 : m.user1;
      return other ? {
        id: other.id,
        name: other.name,
        age: other.age,
        bio: other.bio,
        interests: other.interests,
        imageUrl: other.image_url,
        distance: 'Connected',
        isVerified: other.is_verified,
        publicKey: other.public_key,
        isAi: other.is_ai
      } : null;
    }).filter(Boolean) as Profile[];
  } catch (e) {
    return [];
  }
};

export const sendEncryptedMessage = async (senderId: string, recipientId: string, payload: any) => {
  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        encrypted_data: payload.data,
        iv: payload.iv,
        wrapped_key: payload.key
      });
    return { success: !error };
  } catch (e) {
    return { success: false };
  }
};

export const fetchMessages = async (userId: string, matchId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${matchId}),and(sender_id.eq.${matchId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    return error ? [] : data;
  } catch (e) {
    return [];
  }
};

export const subscribeToMessages = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('messages_realtime_v2')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userId}` }, 
    payload => callback(payload.new))
    .subscribe();
};

export const createCall = async (callerId: string, receiverId: string, offer: any) => {
  return supabase.from('calls').insert({ caller_id: callerId, receiver_id: receiverId, offer, status: 'ringing' }).select().single();
};

export const respondToCall = async (callId: string, answer: any) => {
  return supabase.from('calls').update({ answer, status: 'connected' }).eq('id', callId);
};

export const sendIceCandidate = async (callId: string, senderId: string, candidate: any) => {
  return supabase.from('ice_candidates').insert({ call_id: callId, sender_id: senderId, candidate });
};

export const subscribeToCallSignals = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`calls_v2_${userId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls', filter: `caller_id=eq.${userId}` }, p => callback(p))
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calls', filter: `receiver_id=eq.${userId}` }, p => callback(p))
    .subscribe();
};

export const subscribeToIceCandidates = (callId: string, userId: string, callback: (candidate: any) => void) => {
  return supabase
    .channel(`ice_v2_${callId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ice_candidates', filter: `call_id=eq.${callId}` }, p => {
      if (p.new.sender_id !== userId) callback(p.new.candidate);
    })
    .subscribe();
};
