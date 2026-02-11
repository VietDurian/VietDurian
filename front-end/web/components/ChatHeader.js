import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useRouter } from "next/navigation";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const router = useRouter();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <img
              src={selectedUser?.avatar || "/images/avatar.jpg"}
              alt={selectedUser?.full_name}
              className="size-10 object-cover rounded-full"
            />
            {onlineUsers.includes(selectedUser?._id) && (
              <span
                className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
              />
            )}
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser?.full_name}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser?._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            setSelectedUser(null);
            router.push(`/chat`);
          }}
        >
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
