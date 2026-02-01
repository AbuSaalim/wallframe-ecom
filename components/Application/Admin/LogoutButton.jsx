import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { showToast } from "@/lib/showToast";
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
import { logout } from "@/store/reducer/authReducer";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import axios from "axios";
import { useRouter } from "next/navigation";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { useDispatch } from "react-redux";

const LogoutButton = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Call logout API to clear server-side session
      const { data: logoutResponse } = await axios.post('/api/auth/logout');
      
      // Clear Redux auth state
      dispatch(logout());
      
      // Show success message and redirect
      showToast('success', logoutResponse.message || 'Logged out successfully');
      router.push(WEBSITE_LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
      showToast('error', error.message || 'Logout failed');
      // Still redirect even if API fails
      router.push(WEBSITE_LOGIN);
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
