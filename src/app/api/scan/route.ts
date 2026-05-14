import { NextRequest, NextResponse } from 'next/server';
import { getUserByFaceDescriptor, getEmergencyByUserId } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { faceDescriptor } = body;

    if (!faceDescriptor || faceDescriptor.length === 0) {
      return NextResponse.json(
        { error: 'Face descriptor is required' },
        { status: 400 }
      );
    }

    const user = getUserByFaceDescriptor(faceDescriptor);

    if (!user) {
      return NextResponse.json(
        { error: 'No matching user found' },
        { status: 404 }
      );
    }

    const emergencyDetails = getEmergencyByUserId(user.id);

    return NextResponse.json({
      user: {
        name: user.name,
        phone: user.phone,
      },
      emergencyDetails: emergencyDetails || null,
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
