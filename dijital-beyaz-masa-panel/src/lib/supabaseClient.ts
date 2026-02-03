import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL veya Key eksik!");
}

// Artık 'createBrowserClient' kullanıyoruz. 
// Bu sayede tarayıcıdaki çerezleri (cookies) otomatik yönetir.
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);