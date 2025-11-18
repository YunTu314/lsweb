import Cookies from "js-cookie";
import { useUserStoreHook } from "@/store/modules/user";
import { storageLocal, isString, isIncludeAllChildren } from "@pureadmin/utils";

export interface DataInfo<T> {
  /** token */
  accessToken: string;
  /** `accessToken`的过期时间（时间戳） */
  expires: T;
  /** 用于调用刷新accessToken的接口时所需的token */
  refreshToken: string;
  /** 头像 */
  avatar?: string;
  /** 用户名 */
  username?: string;
  /** 昵称 */
  nickname?: string;
  /** 当前登录用户的角色 */
  roles?: Array<string>;
  /** 当前登录用户的按钮级别权限 */
  permissions?: Array<string>;
  /** 用户ID */
  userId?: number;
}

export const userKey = "user-info";
export const TokenKey = "authorized-token";
export const multipleTabsKey = "multiple-tabs";

/** 获取`token` */
export function getToken(): DataInfo<number> {
  return Cookies.get(TokenKey)
    ? JSON.parse(Cookies.get(TokenKey))
    : storageLocal().getItem(userKey);
}

export function setToken(data: DataInfo<Date>) {
  // 后端未返回过期时间，默认设为0（会话级或长期有效）
  let expires = 0;
  const { accessToken, refreshToken = "", userId } = data;
  const { isRemembered, loginDay } = useUserStoreHook();

  if (data.expires) {
    expires = new Date(data.expires).getTime();
  }

  const cookieString = JSON.stringify({ accessToken, expires, refreshToken, userId });

  expires > 0
    ? Cookies.set(TokenKey, cookieString, {
      expires: (expires - Date.now()) / 86400000
    })
    : Cookies.set(TokenKey, cookieString);

  Cookies.set(
    multipleTabsKey,
    "true",
    isRemembered
      ? {
        expires: loginDay
      }
      : {}
  );

  function setUserKey({ avatar, username, nickname, roles, permissions, userId }) {
    useUserStoreHook().SET_AVATAR(avatar);
    useUserStoreHook().SET_USERNAME(username);
    useUserStoreHook().SET_NICKNAME(nickname);
    useUserStoreHook().SET_ROLES(roles);
    useUserStoreHook().SET_PERMS(permissions);
    useUserStoreHook().SET_USERID(userId); // 存储 userId

    storageLocal().setItem(userKey, {
      refreshToken,
      expires,
      avatar,
      username,
      nickname,
      roles,
      permissions,
      userId
    });
  }

  if (data.username && data.roles) {
    const { username, roles } = data;
    setUserKey({
      avatar: data?.avatar ?? "",
      username,
      nickname: data?.nickname ?? "",
      roles,
      permissions: data?.permissions ?? [],
      userId: data?.userId ?? null
    });
  } else {
    const avatar = storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "";
    const username = storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "";
    const nickname = storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "";
    const roles = storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [];
    const permissions = storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [];
    const userId = storageLocal().getItem<DataInfo<number>>(userKey)?.userId ?? null;
    setUserKey({
      avatar,
      username,
      nickname,
      roles,
      permissions,
      userId
    });
  }
}

export function removeToken() {
  Cookies.remove(TokenKey);
  Cookies.remove(multipleTabsKey);
  storageLocal().removeItem(userKey);
}

export const formatToken = (token: string): string => {
  return "Bearer " + token;
};

export const hasPerms = (value: string | Array<string>): boolean => {
  if (!value) return false;
  const allPerms = "*:*:*";
  const { permissions } = useUserStoreHook();
  if (!permissions) return false;
  if (permissions.length === 1 && permissions[0] === allPerms) return true;
  const isAuths = isString(value)
    ? permissions.includes(value)
    : isIncludeAllChildren(value, permissions);
  return isAuths ? true : false;
};