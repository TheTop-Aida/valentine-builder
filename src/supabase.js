import { createClient } from '@supabase/supabase-js';

// ⚠️ ใส่ค่าจาก Supabase Dashboard → Project Settings → API
export const SUPABASE_URL  = 'https://ofmrddakijpjelqpuhff.supabase.co';
export const SUPABASE_ANON = 'sb_publishable_CfkdPi6VzGimWjgdNUxv2w_TJBn9kpq';

// Client หลัก (ใช้ทั่วไป)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// Client รอง (สำหรับ Admin สร้าง user โดยไม่กระทบ session ของ admin)
export const supabaseSecondary = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { storageKey: 'sb-secondary-auth' },
});
