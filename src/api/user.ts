
// src/api/user.ts
import { http } from "@/utils/http";
import type { AxiosRequestConfig } from "axios"; // 引入类型

export type UserResult = {
  code: number;
  token: string;
  userName: string;
  msg?: string;
};

export type UserInfoResult = {
  code: string | number;
  msg: string;
  data: {
    user: {
      userId: number;
      userName: string;
      nickName: string;
      avatar: string;
      [key: string]: any;
    };
    roles: Array<string>;
    permissions: Array<string>;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/api/system/login", { data });
};

/** * 获取用户信息 
 * 修改参数为 config，以便可以手动传递 headers
 */
export const getUserInfo = (config?: AxiosRequestConfig) => {
  return http.request<UserInfoResult>("get", "/api/system/getInfo", config);
};

/** 刷新token */
export const refreshTokenApi = (data?: object) => {
  return http.request<any>("post", "/api/refresh-token", { data });
};