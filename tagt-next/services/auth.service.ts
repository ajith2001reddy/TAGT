import { signInWithEmailAndPassword, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { AppUser } from "@/types/user";

export async function loginWithFirebase(email: string, password: string): Promise<FirebaseUser> {
  const credentials = await signInWithEmailAndPassword(auth, email, password);
  return credentials.user;
}

export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}

export async function fetchMyProfile(firebaseUser: FirebaseUser): Promise<AppUser> {
  await firebaseUser.getIdToken(true);
  const response = await api.get<ApiResponse<AppUser>>("/auth/me");
  return response.data.data;
}
