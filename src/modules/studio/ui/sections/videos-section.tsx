"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default function VideosSection() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function VideosSectionSuspense() {
  const [ videos, query ] = trpc.studio.getMany.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT,
  }, {
    getNextPageParam: (lastPage: { nextCursor: any; }) => lastPage.nextCursor,
  })
  return (
    <div>
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            { videos.pages.flatMap((page) => page.items).map((video) => (
              <TableRow className="cursor-pointer" key={video.id}>
                  <TableCell className="p-0">
                    <Link href={`/studio/videos/${video.id}`} className="inline-flex p-2 w-full pl-3">
                      {video.title}
                    </Link>
                  </TableCell>
                  <TableCell className="p-0">
                    <Link href={`/studio/videos/${video.id}`} className="inline-flex p-2 w-full">
                      visibility
                    </Link>
                  </TableCell>
                  <TableCell className="p-0">
                    <Link href={`/studio/videos/${video.id}`} className="inline-flex p-2 w-full">
                      state
                    </Link>
                  </TableCell>
                  <TableCell className="p-0">
                    <Link href={`/studio/videos/${video.id}`} className="inline-flex p-2 w-full">
                      date
                    </Link>
                  </TableCell>
                  <TableCell className="p-0">
                    <Link href={`/studio/videos/${video.id}`} className="inline-flex p-2 w-full">
                      views
                    </Link>
                  </TableCell>
                  <TableCell className="p-0">
                    <Link href={`/studio/videos/${video.id}`} className="inline-flex p-2 w-full">
                      comment
                    </Link>
                  </TableCell>
                  <TableCell className="p-0">
                    <Link href={`/studio/videos/${video.id}`} className="inline-flex p-2 w-full">
                      likes
                    </Link>
                  </TableCell>
                </TableRow>
            )) }
          </TableBody>
        </Table>
      </div>
      <InfiniteScroll isManual hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} fetchNextPage={query.fetchNextPage} />
    </div>
  )
}
