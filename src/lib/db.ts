import fs from 'fs';
import os from 'os';
import path from 'path';

const SEED_DATA_DIR = path.join(process.cwd(), 'data');
const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'emergency-face-tracker-data')
  : SEED_DATA_DIR;
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const EMERGENCY_FILE = path.join(DATA_DIR, 'emergency.json');

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  faceDescriptor: number[];
  createdAt: string;
}

export interface EmergencyDetails {
  id: string;
  userId: string;
  age: string;
  gender: string;
  organDonor: string;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  address: string;
  notes: string;
  updatedAt: string;
}

function readJson<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      const seedFilePath = path.join(SEED_DATA_DIR, path.basename(filePath));
      if (seedFilePath !== filePath && fs.existsSync(seedFilePath)) {
        const seedData = fs.readFileSync(seedFilePath, 'utf-8');
        const parsedSeed = JSON.parse(seedData) as T;
        writeJson(filePath, parsedSeed);
        return parsedSeed;
      }

      writeJson(filePath, defaultValue);
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
}

function writeJson<T>(filePath: string, data: T): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function getUsers(): User[] {
  return readJson<User[]>(USERS_FILE, []);
}

export function saveUsers(users: User[]): void {
  writeJson(USERS_FILE, users);
}

export function deleteUserById(id: string): boolean {
  const users = getUsers();
  const nextUsers = users.filter(user => user.id !== id);

  if (nextUsers.length === users.length) {
    return false;
  }

  saveUsers(nextUsers);
  saveEmergencyDetails(getEmergencyDetails().filter(details => details.userId !== id));
  return true;
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function getEmergencyDetails(): EmergencyDetails[] {
  return readJson<EmergencyDetails[]>(EMERGENCY_FILE, []);
}

export function saveEmergencyDetails(details: EmergencyDetails[]): void {
  writeJson(EMERGENCY_FILE, details);
}

export function getEmergencyByUserId(userId: string): EmergencyDetails | undefined {
  return getEmergencyDetails().find(d => d.userId === userId);
}

export function upsertEmergencyDetails(details: Omit<EmergencyDetails, 'id' | 'updatedAt'>): EmergencyDetails {
  const allDetails = getEmergencyDetails();
  const existingIndex = allDetails.findIndex(d => d.userId === details.userId);
  
  const now = new Date().toISOString();
  const emergencyDetails: EmergencyDetails = {
    ...details,
    id: existingIndex >= 0 ? allDetails[existingIndex].id : Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    allDetails[existingIndex] = emergencyDetails;
  } else {
    allDetails.push(emergencyDetails);
  }

  saveEmergencyDetails(allDetails);
  return emergencyDetails;
}

export interface FaceMatch {
  user: User;
  distance: number;
  confidence: number;
}

export function findFaceMatch(faceDescriptor: number[], threshold: number = 0.48, minMargin: number = 0.05): FaceMatch | undefined {
  if (!Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
    return undefined;
  }

  const users = getUsers();
  const matches = users
    .filter(user => user.faceDescriptor && user.faceDescriptor.length === faceDescriptor.length)
    .map(user => ({
      user,
      distance: euclideanDistance(faceDescriptor, user.faceDescriptor),
    }))
    .sort((a, b) => a.distance - b.distance);

  const bestMatch = matches[0];
  const secondBest = matches[1];

  if (!bestMatch || bestMatch.distance > threshold) {
    return undefined;
  }

  if (secondBest && secondBest.distance - bestMatch.distance < minMargin) {
    return undefined;
  }

  return {
    ...bestMatch,
    confidence: Math.max(0, Math.min(99.8, Math.round((1 - bestMatch.distance / threshold) * 1000) / 10)),
  };
}

export function getUserByFaceDescriptor(faceDescriptor: number[]): User | undefined {
  return findFaceMatch(faceDescriptor)?.user;
}

function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}
