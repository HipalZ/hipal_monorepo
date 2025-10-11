import { subNodeId } from "@/lib/utils";

interface DroppableSubcategoryProps {
  id: string;
  children: React.ReactNode;
}

export function DroppableSubcategory({
  id,
  children,
}: DroppableSubcategoryProps) {
  return <div id={subNodeId(id)}>{children}</div>;
}
