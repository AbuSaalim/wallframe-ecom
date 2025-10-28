import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { showToast } from "@/lib/showToast";
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
import { logout } from "@/store/reducer/authReducer";
import axios from "axios";
import { useRouter } from "next/navigation";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { useDispatch } from "react-redux";

const LogoutButton = () => {
  const dispatch = useDispatch(); // ✅ Fixed: Added parentheses
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { data: logoutResponse } = await axios.post('/api/auth/logout');
      if (!logoutResponse.success) {
        throw new Error(logoutResponse.message);
      }

      dispatch(logout());
      showToast('success', logoutResponse.message);
      router.push(WEBSITE_LOGIN);
    } catch (error) {
      showToast('error', error.message);
    }
  };

  return (
    <DropdownMenuItem asChild className="cursor-pointer">
      <button 
        onClick={handleLogout} 
        className="flex items-center gap-2 w-full"
      >
        <RiLogoutCircleRLine color="red" />
        <span>Logout</span>
      </button>
    </DropdownMenuItem>
  );
};

export default LogoutButton;
