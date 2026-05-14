import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserById, getEmergencyByUserId } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const emergencyDetails = getEmergencyByUserId(session.userId);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
    emergencyDetails: emergencyDetails || null,
  });
}
