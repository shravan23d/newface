import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getEmergencyByUserId, upsertEmergencyDetails } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const emergencyDetails = getEmergencyByUserId(session.userId);
  return NextResponse.json({ emergencyDetails: emergencyDetails || null });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    bloodType,
    allergies,
    medicalConditions,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactRelation,
    address,
    notes,
  } = body;

  const details = upsertEmergencyDetails({
    userId: session.userId,
    bloodType: bloodType || '',
    allergies: allergies || '',
    medicalConditions: medicalConditions || '',
    emergencyContactName: emergencyContactName || '',
    emergencyContactPhone: emergencyContactPhone || '',
    emergencyContactRelation: emergencyContactRelation || '',
    address: address || '',
    notes: notes || '',
  });

  return NextResponse.json({ message: 'Emergency details saved', details });
}
