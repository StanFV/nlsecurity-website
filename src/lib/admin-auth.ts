import type { AstroCookies } from 'astro';
import { supabase } from './supabase';
import { supabaseAdmin } from './supabase-admin';

export type UserRole = 'super_admin' | 'admin';

export interface AdminUser {
  user: { id: string; email?: string };
  role: UserRole;
  mfa_required: boolean;
  aal: string;
}

function decodeJWT(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

export async function requireAdminAuth(
  cookies: AstroCookies,
  requireSuperAdmin = false
): Promise<AdminUser | null> {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  if (!accessToken || !refreshToken) return null;

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error || !data.user) return null;

  // Lees rol en MFA instelling uit app_metadata (via admin API)
  const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(data.user.id);
  const meta = adminUser?.user?.app_metadata ?? {};
  const role = (meta.role ?? 'admin') as UserRole;
  const mfa_required = meta.mfa_required ?? false;

  if (requireSuperAdmin && role !== 'super_admin') return null;

  const jwtPayload = decodeJWT(accessToken);
  const aal = jwtPayload?.aal ?? 'aal1';

  return { user: data.user, role, mfa_required, aal };
}
