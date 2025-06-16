"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";

export default function VideosSection() {
  const [ data ] = trpc.studio.getMany.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT,
  }, {
    getNextPageParam: (lastPage: { nextCursor: any; }) => lastPage.nextCursor,
  })
  return (
    <div className="">{JSON.stringify(data)}</div>
  )
}
