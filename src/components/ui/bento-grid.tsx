"use client";

import { cn } from "@/lib/utils";
import {
    Info,
    TrendingUp,
    Palette,
    Globe,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

export interface BentoItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    status?: string;
    tags?: string[];
    meta?: string;
    cta?: string;
    colSpan?: number;
    hasPersistentHover?: boolean;
    url?: string;
}

interface BentoGridProps {
    items: BentoItem[];
}

function BentoGrid({ items }: BentoGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 max-w-7xl mx-auto">
            {items.map((item, index) => {
                const CardContent = () => (
                    <>
                        <div
                            className={`absolute inset-0 ${
                                item.hasPersistentHover
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"
                            } transition-opacity duration-300`}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
                        </div>

                        <div className="relative flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 group-hover:bg-gradient-to-br transition-all duration-300">
                                    {item.icon}
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm",
                                        "bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300",
                                        "transition-colors duration-300 group-hover:bg-black/10 dark:group-hover:bg-white/20"
                                    )}
                                >
                                    {item.status || "Active"}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px]">
                                    {item.title}
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
                                        {item.meta}
                                    </span>
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug font-[425]">
                                    {item.description}
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                    {item.tags?.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/20"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.cta || "Explore →"}
                                </span>
                            </div>
                        </div>

                        <div
                            className={`absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10 ${
                                item.hasPersistentHover
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"
                            } transition-opacity duration-300`}
                        />
                    </>
                );

                return (
                    <div
                        key={index}
                        className={cn(
                            "group relative p-4 rounded-xl overflow-hidden transition-all duration-300",
                            "border border-gray-100/80 dark:border-white/10 bg-white dark:bg-black",
                            "hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]",
                            "hover:-translate-y-0.5 will-change-transform",
                            item.colSpan || "col-span-1",
                            item.colSpan === 2 ? "md:col-span-2" : "",
                            {
                                "shadow-[0_2px_12px_rgba(0,0,0,0.03)] -translate-y-0.5":
                                    item.hasPersistentHover,
                                "dark:shadow-[0_2px_12px_rgba(255,255,255,0.03)]":
                                    item.hasPersistentHover,
                            },
                            item.url ? "cursor-pointer" : ""
                        )}
                        onClick={() => {
                            if (item.url && typeof window !== 'undefined') {
                                window.open(item.url, "_blank", "noopener,noreferrer");
                            }
                        }}
                    >
                        <CardContent />
                    </div>
                );
            })}
        </div>
    );
}

function BentoGridContent() {
    const searchParams = useSearchParams();
    const accountId = searchParams.get('account') || '';
    
    const [items, setItems] = useState<BentoItem[]>([]);
    
    useEffect(() => {
        // Only set items after component is mounted (client-side)
        setItems([
            {
                title: "Web Squad Resources",
                description:
                    "Read up on some Web Squad resources while you wait.",
                icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
                status: "Web Resources",
                colSpan: 2,
                url: "https://churchmediasquad.com/websites",
            },
            {
                title: "Squad Website",
                description: "Visit our site for the latest on TheSquad.",
                icon: <Globe className="w-4 h-4 text-emerald-500" />,
                status: "TheSquad",
                url: "https://churchmediasquad.com",
            },
            {
                title: "Web Squad Feedback",
                description: "Your feedback is crucial as we continually strive to elevate our website support for churches.",
                icon: <Info className="w-4 h-4 text-sky-500" />,
                status: "Feedback",
                url: `https://forms.thesqd.com/website-feedback?memberid=${accountId}`,
            },
            {
                title: "Remix",
                description: "Premade graphics and templates for your church.",
                icon: <Palette className="w-4 h-4 text-purple-500" />,
                status: "Graphics",
                colSpan: 2,
                url: "https://remixchurchmedia.com/",
            },
        ]);
    }, [accountId]);

    return <BentoGrid items={items} />;
}

function BentoGridDemo() {
    return (
        <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 max-w-7xl mx-auto">
                {/* Loading overlay handles all loading states - no skeleton needed */}
            </div>
        }>
            <BentoGridContent />
        </Suspense>
    );
}

export { BentoGrid, BentoGridDemo } 