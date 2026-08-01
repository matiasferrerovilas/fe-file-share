import { api } from "./axios";
import type { UserSetting, UserSettingKey } from "../models/UserSetting";

const baseUrl = "/settings/defaults";

export const getUserDefault = (key: UserSettingKey): Promise<UserSetting> =>
  api
    .get<UserSetting>(`${baseUrl}/${key}`)
    .then((r) => r.data)
    .catch((error) => {
      if (error?.response?.status === 404) {
        return { key, value: null };
      }
      throw error;
    });

export const setUserDefault = (key: UserSettingKey, value: number): Promise<UserSetting> =>
  api.put<UserSetting>(`${baseUrl}/${key}`, { value }).then((r) => r.data);
