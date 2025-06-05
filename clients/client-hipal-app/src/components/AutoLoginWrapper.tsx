"use client";

import { useSearchParams } from "next/navigation";
import AutoLogin from "./hotels/room/AutoLogin";
import { useUserToken } from "@hi/common/src/useUserToken";

export default function AutoLoginWrapper() {
  const searchParams = useSearchParams();
  const userID = searchParams.get("id");
  const accessToken = useUserToken.getState().accessToken;

  if (!userID || accessToken !== "") {
    return null;
  }

  return userID ? <AutoLogin userID={userID} /> : null;
}
