import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getEmergencyDetails, getUsers } from '@/lib/db';

const priorityFields = ['bloodType', 'emergencyContactName', 'emergencyContactPhone', 'address'] as const;

export async function GET() {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const emergencyDetails = getEmergencyDetails();
  const users = getUsers().map((user) => {
    const details = emergencyDetails.find((item) => item.userId === user.id) || null;
    const completedFields = details
      ? priorityFields.filter((field) => Boolean(details[field])).length
      : 0;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      hasFaceScan: user.faceDescriptor.length > 0,
      emergencyDetails: details,
      completion: Math.round((completedFields / priorityFields.length) * 100),
    };
  });

  return NextResponse.json({
    users,
    stats: {
      totalUsers: users.length,
      withFaceScan: users.filter((user) => user.hasFaceScan).length,
      withEmergencyDetails: users.filter((user) => Boolean(user.emergencyDetails)).length,
      completeProfiles: users.filter((user) => user.completion === 100).length,
    },
  });
}
