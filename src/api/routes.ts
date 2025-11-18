import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data: Array<any>;
};

// export const getAsyncRoutes = () => {
//   return http.request<Result>("get", "/get-async-routes");
// };

// 传递 token 和 userId
export const getAsyncRoutes = (params?: object) => {
  return http.request<any>("get", "/system/getRouters", { params });
};