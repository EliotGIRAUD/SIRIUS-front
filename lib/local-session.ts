import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  setup: 'sirius_setup_complete',
  user: 'sirius_user_snapshot',
  backendUid: 'sirius_backend_uid',
  authToken: 'sirius_auth_token',
} as const;

export type UserSnapshot = {
  uid: string;
  email: string;
  displayName: string;
  dogName: string;
};

export async function setSetupComplete(complete = true) {
  await AsyncStorage.setItem(KEYS.setup, complete ? 'true' : 'false');
}

export async function isSetupComplete() {
  return (await AsyncStorage.getItem(KEYS.setup)) === 'true';
}

export async function getUserSnapshot(): Promise<UserSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.user);
    if (!raw) return null;
    return JSON.parse(raw) as UserSnapshot;
  } catch {
    return null;
  }
}

export async function cacheSessionUser(opts: {
  uid: string;
  email: string;
  displayName?: string;
}) {
  const prev = await getUserSnapshot();
  const payload: UserSnapshot = {
    uid: opts.uid,
    email: opts.email ?? '',
    displayName: typeof opts.displayName === 'string' ? opts.displayName : '',
    dogName: prev?.dogName ?? '',
  };
  await AsyncStorage.setItem(KEYS.user, JSON.stringify(payload));
}

export async function updateUserSnapshot(partial: Partial<UserSnapshot>) {
  const prev = (await getUserSnapshot()) ?? {
    uid: '',
    email: '',
    displayName: '',
    dogName: '',
  };
  await AsyncStorage.setItem(KEYS.user, JSON.stringify({ ...prev, ...partial }));
}

export async function setBackendUserId(uid: string) {
  await AsyncStorage.setItem(KEYS.backendUid, uid);
}

export async function getBackendUserId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.backendUid);
}

export async function setAuthToken(token: string) {
  await AsyncStorage.setItem(KEYS.authToken, token);
}

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.authToken);
}

export async function clearLocalSession() {
  await AsyncStorage.multiRemove([KEYS.setup, KEYS.user, KEYS.backendUid, KEYS.authToken]);
}
