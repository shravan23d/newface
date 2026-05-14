import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession } from '@/lib/auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@emergencyface.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    await createAdminSession({
      role: 'admin',
      email: ADMIN_EMAIL,
      name: 'EmergencyFace Admin',
    });

    return NextResponse.json({
      message: 'Admin login successful',
      admin: { email: ADMIN_EMAIL, name: 'EmergencyFace Admin' },
    });
  } catch {
    return NextResponse.json({ error: 'Admin login failed' }, { status: 500 });
  }
}
