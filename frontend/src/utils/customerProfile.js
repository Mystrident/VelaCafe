const PROFILE_STORAGE_KEY = "customerProfile";

export const saveCustomerProfile = (user) => {
  if (!user?.name || !user?.email) return;
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify({ name: user.name, email: user.email, picture: user.picture }),
  );
};

export const getCustomerProfile = () => {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY)) || null;
  } catch {
    return null;
  }
};

export const clearCustomerProfile = () => {
  localStorage.removeItem(PROFILE_STORAGE_KEY);
};
