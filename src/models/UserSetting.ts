export type UserSettingKey = "DEFAULT_WORKSPACE";

export interface UserSetting {
  key: UserSettingKey;
  value: number | null;
}
