import TopNavBar from "@/components/TopNavBar";
import ChatArea from "@/components/ChatArea";

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-900">
      <TopNavBar />
      <main className="flex flex-1 overflow-hidden">
        <ChatArea />
      </main>
    </div>
  );
}
