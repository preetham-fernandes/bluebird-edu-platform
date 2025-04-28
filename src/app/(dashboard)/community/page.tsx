// src/app/(dashboard)/community/page.tsx
import MessageList from "@/components/community/MessageList";

export default function CommunityPage() {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <MessageList />
    </div>
  );
}