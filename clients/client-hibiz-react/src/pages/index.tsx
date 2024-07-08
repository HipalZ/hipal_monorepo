import SectionWithLogo from "@/components/atom/sectionWithLogo"
import { lazy } from "react";

// Lazy load the components
const Login = lazy(() => import('@/components/templates/loginPage/login'));

const Home: React.FC = () => {
  return (
      <SectionWithLogo>
        <Login />
      </SectionWithLogo>
  );
};

export default Home;
