// src/store/modules/user.ts
import { defineStore } from "pinia";
import {
  type userType,
  store,
  router,
  resetRouter,
  routerArrays,
  storageLocal
} from "../utils";
import {
  type UserResult,
  type UserInfoResult,
  getLogin,
  getUserInfo,
  refreshTokenApi
} from "@/api/user";
import { useMultiTagsStoreHook } from "./multiTags";
import { type DataInfo, setToken, removeToken, userKey, formatToken } from "@/utils/auth";

export const useUserStore = defineStore("pure-user", {
  state: (): userType => ({
    avatar: storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "",
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    nickname: storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "",
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    permissions: storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [],
    userId: storageLocal().getItem<DataInfo<number>>(userKey)?.userId ?? null,
    isRemembered: false,
    loginDay: 7
  }),
  actions: {
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    SET_USERNAME(username: string) {
      this.username = username;
    },
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname;
    },
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    SET_PERMS(permissions: Array<string>) {
      this.permissions = permissions;
    },
    SET_USERID(userId: number) {
      this.userId = userId;
    },
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<UserResult | UserInfoResult>((resolve, reject) => {
        // 1. 登录前先清理旧数据
        removeToken();

        // 2. 调用登录接口
        getLogin(data)
          .then(async res => {
            if (res.code === 200) {
              const token = res.token;

              // 3. 登录成功后，手动构造 Header 调用 getInfo
              // 因为此时 Token 还没存到 LocalStorage，拦截器拿不到，所以必须手动传
              try {
                const infoRes = await getUserInfo({
                  headers: {
                    Authorization: formatToken(token) // 手动携带 Token
                  }
                });

                if (infoRes.code === "0" || infoRes.code === 0) {
                  const { user, roles, permissions } = infoRes.data;

                  // 4. 获取信息成功后，统一保存 Token 和 用户信息
                  setToken({
                    accessToken: token,
                    refreshToken: "",
                    expires: 0 as any,
                    username: user.userName,
                    nickname: user.nickName,
                    avatar: user.avatar || "",
                    roles: roles,
                    permissions: permissions,
                    userId: user.userId
                  });
                  resolve(res);
                } else {
                  reject(infoRes.msg || "获取用户信息失败");
                }
              } catch (error) {
                reject(error);
              }
            } else {
              reject(res.msg || "登录失败");
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    // ... 其他 action (logOut, handRefreshToken) 保持不变 ...
    logOut() {
      this.username = "";
      this.roles = [];
      this.permissions = [];
      this.userId = null;
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
    },
    async handRefreshToken(data) {
      return new Promise<any>((resolve, reject) => {
        refreshTokenApi(data)
          .then(data => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}