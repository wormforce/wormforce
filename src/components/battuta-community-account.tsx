"use client";
import { useEffect, useState } from "react";
import type { BattutaLocale } from "@/content/battuta";
const authPath = "/api/battuta/community/v1/auth";

export function BattutaCommunityAccount({ locale }: { locale: BattutaLocale }) {
  const en = locale === "en";
  const [status, setStatus] = useState<"loading" | "guest" | "signed-in" | "unavailable">("loading");
  const [name, setName] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${authPath}/me`, { cache: "no-store", signal: controller.signal }).then(async response => {
      if (response.status === 401) { setStatus("guest"); return; }
      if (!response.ok) { setStatus("unavailable"); return; }
      const data = await response.json();
      if (typeof data.user?.display_name !== "string") throw new Error("Invalid account response");
      setName(data.user.display_name); setStatus("signed-in");
    }).catch(() => { if (!controller.signal.aborted) setStatus("unavailable"); });
    return () => controller.abort();
  }, []);
  async function logout() {
    try {
      const response = await fetch(`${authPath}/logout`, { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      setName(""); setStatus("guest");
    } catch { setStatus("unavailable"); }
  }
  return <div className="community-account">
    {status === "guest" && <a href={`${authPath}/github`}>{en ? "Sign in with GitHub" : "GitHub 登录"}</a>}
    {status === "signed-in" && <><span>{name}</span><button onClick={logout}>{en ? "Sign out" : "退出"}</button></>}
    {status === "loading" && <span>{en ? "Checking account…" : "正在检查账号…"}</span>}
    {status === "unavailable" && <span>{en ? "Community sign-in is not available yet" : "社区登录暂未接通"}</span>}
  </div>;
}
