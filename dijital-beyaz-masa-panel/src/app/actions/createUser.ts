"use server";

import { createClient } from "@supabase/supabase-js";

// Service Role ile bağlandığımız client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function createNewUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as string;
  const departmentId = formData.get("departmentId") as string;

  // 1. Kullanıcıyı Auth sistemine ekle
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (authError) return { success: false, error: authError.message };
  if (!authData.user) return { success: false, error: "Kullanıcı oluşturulamadı." };

  // 2. Profillere ekle
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: authData.user.id,
      full_name: fullName,
      role: role,
      department_id: role === 'admin' ? null : parseInt(departmentId)
    });

  if (profileError) return { success: false, error: "Profil hatası: " + profileError.message };

  // 3. LOGLAMA (YENİ KISIM) 🔥
  // Bu işlem admin yetkisiyle yapıldığı için logu "Sistem Yöneticisi" adına kaydedebiliriz
  // Ancak Server Action'da "O anki giriş yapmış adminin ID'sini" bulmak için cookie okumamız gerekir.
  // Basitlik adına burada user_id'yi boş bırakabiliriz (sistem yapmış gibi) veya service role ile ekleriz.
  
  await supabaseAdmin.from("audit_logs").insert({
    // user_id: Burayı null bırakırsak "Sistem" yapmış olur veya bir admin ID'si verebilirsin.
    action_type: 'USER_CREATE',
    description: `Yeni personel eklendi: ${fullName} (${role})`
  });

  return { success: true };
}