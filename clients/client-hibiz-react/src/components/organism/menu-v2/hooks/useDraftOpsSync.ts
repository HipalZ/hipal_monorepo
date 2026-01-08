import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { DraftOpsRepository } from "../db/DraftOpsRepository";
import { PendingImagesRepository } from "../db/PendingImagesRepository";
import { useMenuUIStore } from "../store/useMenuUIStore";
import useBusinessData from "@/components/store/useBusinessData";

export const useDraftOpsSync = () => {
  const setDraftOpsCount = useMenuUIStore((s) => s.setDraftOpsCount);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  
  const draftOpsCount = useLiveQuery(
    async () => await DraftOpsRepository.getDraftOpsCount(),
    []
  );
  
  const pendingImagesCount = useLiveQuery(
    async () => {
      if (!businessId) return 0;
      return await PendingImagesRepository.getAllPendingImages(businessId).then(imgs => imgs.length);
    },
    [businessId]
  );
  
  useEffect(() => {
    // Total count = draft ops + pending images (pending images will create draft ops when uploaded)
    const totalCount = (draftOpsCount || 0) + (pendingImagesCount || 0);
    setDraftOpsCount(totalCount);
  }, [draftOpsCount, pendingImagesCount, setDraftOpsCount]);
};
