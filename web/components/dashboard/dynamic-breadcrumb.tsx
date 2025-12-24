'use client';

import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import useFolderStore from '@/store/folder.store';

interface BreadcrumbSegment {
    label: string;
    href?: string;
    isCurrentPage?: boolean;
}

export function DynamicBreadcrumb() {
    const pathname = usePathname();
    const params = useParams();
    const { currentFolder, getFolder } = useFolderStore();
    const [segments, setSegments] = useState<BreadcrumbSegment[]>([]);

    useEffect(() => {
        // Don't show breadcrumb on dashboard home
        if (pathname === '/dashboard') {
            setSegments([]);
            return;
        }

        const pathParts = pathname.split('/').filter(Boolean);
        const breadcrumbs: BreadcrumbSegment[] = [];

        // Always start with Dashboard
        breadcrumbs.push({
            label: 'Dashboard',
            href: '/dashboard',
        });

        // Build breadcrumbs based on path
        for (let i = 1; i < pathParts.length; i++) {
            const part = pathParts[i];
            const isLast = i === pathParts.length - 1;

            // Skip 'dashboard' as we already added it
            if (part === 'dashboard') continue;

            // Handle different segments
            if (part === 'flashcard') {
                breadcrumbs.push({
                    label: 'Flashbook',
                    href: isLast ? undefined : '/dashboard/flashcard',
                    isCurrentPage: isLast,
                });
            } else if (part === 'explore') {
                breadcrumbs.push({
                    label: 'Khám phá',
                    href: isLast ? undefined : '/dashboard/explore',
                    isCurrentPage: isLast,
                });
            } else if (part === 'practice' && pathParts[i - 1] === 'dashboard') {
                // Practice page from dashboard
                breadcrumbs.push({
                    label: 'Luyện tập',
                    href: isLast ? undefined : '/dashboard/practice',
                    isCurrentPage: isLast,
                });
            } else if (part === 'folder') {
                // Skip 'folder' segment, we'll handle the ID next
                continue;
            } else if (part === 'study') {
                breadcrumbs.push({
                    label: 'Học tập',
                    isCurrentPage: isLast,
                });
            } else if (part === 'practice' && pathParts[i - 1] !== 'dashboard') {
                // Practice from folder - Skip adding "Luyện tập" segment as per user request
                continue;
            } else if (part === 'multiple-choice') {
                breadcrumbs.push({
                    label: 'Trắc nghiệm',
                    isCurrentPage: isLast,
                });
            } else if (part === 'fill-in-the-blank') {
                breadcrumbs.push({
                    label: 'Điền từ',
                    isCurrentPage: isLast,
                });
            } else if (part === 'sentence') {
                breadcrumbs.push({
                    label: 'Viết câu',
                    isCurrentPage: isLast,
                });
            } else if (part === 'profile') {
                breadcrumbs.push({
                    label: 'Hồ sơ cá nhân',
                    href: isLast ? undefined : '/dashboard/profile',
                    isCurrentPage: isLast,
                });
            } else if (pathParts[i - 1] === 'folder' && params.id) {
                // This is a folder ID
                const folderId = part;
                const folderName = currentFolder?.id === folderId ? currentFolder.name : 'Đang tải...';

                breadcrumbs.push({
                    label: folderName,
                    href: isLast ? undefined : `/dashboard/${pathParts[1]}/folder/${folderId}`,
                    isCurrentPage: isLast,
                });

                // Fetch folder data if not already loaded
                if (!currentFolder || currentFolder.id !== folderId) {
                    getFolder(folderId);
                }
            }
        }

        setSegments(breadcrumbs);
    }, [pathname, params, currentFolder, getFolder]);

    // Don't render if no segments (dashboard home page)
    if (segments.length === 0) {
        return null;
    }

    return (
        <div className="px-4 md:px-6 py-2">
            <Breadcrumb>
                <BreadcrumbList>
                    {segments.map((segment, index) => (
                        <div key={index} className="flex items-center gap-1.5">
                            {index > 0 && <BreadcrumbSeparator />}
                            <BreadcrumbItem>
                                {segment.isCurrentPage ? (
                                    <BreadcrumbPage className="max-w-[200px] truncate">
                                        {segment.label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={segment.href || '#'} className="max-w-[200px] truncate">
                                            {segment.label}
                                        </Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </div>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}
