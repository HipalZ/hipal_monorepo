import PasswordMain from "@/components/passwordManager/index.tsx";
import { memo } from "react";

const MemoPassword = () => {
  return (
    <main>
      <PasswordMain />
    </main>
  );
};

const Password = memo(MemoPassword);
export default Password;
