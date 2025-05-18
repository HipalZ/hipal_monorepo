"use client";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { updateTheme } from "@/components/utils/themes";
import { memo, useEffect } from "react";

const MemoDynamicTheme = () => {
  const settings = _useAllBusiness((s) => s.data?.settings);
  useEffect(() => {
    updateTheme(settings);
  }, [settings]);
  return null;
};

const DynamicThemes = memo(MemoDynamicTheme);
export default DynamicThemes;
