import Feed from "@/components/Feed";
import { Suspense } from "react";

export default function FeedPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="flex items-center justify-center p-12 text-gray-500 font-medium">Akış yükleniyor...</div>}>
        <Feed />
      </Suspense>
    </div>
  );
}
