import { useRouter } from "expo-router";
import { useEffect } from "react";
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkUserSession = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      const role = await SecureStore.getItemAsync('userRole');

      if (!token) {
        router.replace("/login");
      } else {
        const lowerRole = (role || 'owner').toLowerCase();
        if (lowerRole === 'customer') {
          router.replace("/(customer)");
        } else if (lowerRole === 'driver') {
          router.replace("/(driver)");
        } else {
          router.replace("/(tabs)");
        }
      }
    };

    checkUserSession();
  }, []);

  return null;
}
