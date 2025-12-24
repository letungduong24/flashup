'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderRequest, folderRequestSchema } from '@/types/folder';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '../ui/dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import useFolderStore from '@/store/folder.store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wand2, PenTool } from 'lucide-react';
import { BackgroundGradient } from '../ui/shadcn-io/background-gradient';

// Schema for AI
const aiAssistantSchema = z.object({
    folderName: z.string().min(1, 'Tên Flashbook không được để trống').max(100, 'Tên Flashbook quá dài'),
});

type AIAssistantFormData = z.infer<typeof aiAssistantSchema>;

interface CreateFlashbookModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    defaultTab?: 'ai' | 'manual';
}

export default function CreateFlashbookModal({
    open,
    onOpenChange,
    onSuccess,
    defaultTab = 'ai'
}: CreateFlashbookModalProps) {
    const { createFolder, createLoading, generateFolderWithFlashcards, generateLoading } = useFolderStore();
    const [activeTab, setActiveTab] = useState<string>(defaultTab);

    // Manual Form
    const {
        register: registerManual,
        handleSubmit: handleSubmitManual,
        formState: { errors: errorsManual },
        reset: resetManual,
    } = useForm<FolderRequest>({
        resolver: zodResolver(folderRequestSchema),
        defaultValues: { name: '', description: undefined },
    });

    // AI Form
    const {
        register: registerAI,
        handleSubmit: handleSubmitAI,
        formState: { errors: errorsAI },
        reset: resetAI,
    } = useForm<AIAssistantFormData>({
        resolver: zodResolver(aiAssistantSchema),
        defaultValues: { folderName: '' },
    });

    const onSubmitManual = async (data: FolderRequest) => {
        try {
            await createFolder(data);
            handleClose();
            onSuccess?.();
        } catch (error) { }
    };

    const onSubmitAI = async (data: AIAssistantFormData) => {
        try {
            await generateFolderWithFlashcards(data.folderName);
            handleClose();
            onSuccess?.();
        } catch (error) { }
    };

    const handleClose = () => {
        if (!createLoading && !generateLoading) {
            resetManual();
            resetAI();
            onOpenChange(false);
        }
    };

    const isLoading = createLoading || generateLoading;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-transparent border-0 shadow-none" showCloseButton={false}>
                <DialogTitle className="sr-only">Tạo Flashbook mới</DialogTitle>

                <BackgroundGradient className='w-full bg-background rounded-xl overflow-hidden' containerClassName="p-0" show={generateLoading}>
                    <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab} className="w-full bg-background rounded-xl border">
                        <div className="p-6 pb-2">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="ai" disabled={isLoading}>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Với AI
                                </TabsTrigger>
                                <TabsTrigger value="manual" disabled={isLoading}>
                                    <PenTool className="w-4 h-4 mr-2" />
                                    Thủ công
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* AI TAB */}
                        <TabsContent value="ai" className="mt-0">
                            <Card className="border-0 shadow-none">
                                <CardHeader>
                                    <CardTitle>Tạo Flashbook với AI</CardTitle>
                                    <CardDescription>
                                        Nhập tên chủ đề, AI sẽ tự động tạo Flashbook và các flashcard liên quan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmitAI(onSubmitAI)}>
                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="folderName">Tên chủ đề Flashbook *</Label>
                                                <Input
                                                    id="folderName"
                                                    placeholder="Ví dụ: Từ vựng IELTS, Du lịch..."
                                                    {...registerAI('folderName')}
                                                    disabled={isLoading}
                                                />
                                                {errorsAI.folderName && (
                                                    <p className="text-sm text-destructive">{errorsAI.folderName.message}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    AI sẽ tạo 10-15 flashcard liên quan đến chủ đề này.
                                                </p>
                                            </div>
                                        </div>
                                    </form>
                                </CardContent>
                                <CardFooter className="flex-col gap-2">
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white border-0"
                                        onClick={handleSubmitAI(onSubmitAI)}
                                        disabled={isLoading}
                                    >
                                        {generateLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Đang tạo với AI...
                                            </>
                                        ) : 'Tạo với AI'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        {/* MANUAL TAB */}
                        <TabsContent value="manual" className="mt-0">
                            <Card className="border-0 shadow-none">
                                <CardHeader>
                                    <CardTitle>Tạo Flashbook thủ công</CardTitle>
                                    <CardDescription>
                                        Tự tạo Flashbook và thêm flashcard sau.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmitManual(onSubmitManual)}>
                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Tên Flashbook *</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Nhập tên Flashbook"
                                                    {...registerManual('name')}
                                                    disabled={isLoading}
                                                />
                                                {errorsManual.name && (
                                                    <p className="text-sm text-destructive">{errorsManual.name.message}</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="description">Mô tả</Label>
                                                <Textarea
                                                    id="description"
                                                    placeholder="Nhập mô tả (tùy chọn)"
                                                    rows={3}
                                                    {...registerManual('description')}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                    </form>
                                </CardContent>
                                <CardFooter className="flex-col gap-2">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        onClick={handleSubmitManual(onSubmitManual)}
                                        disabled={isLoading}
                                    >
                                        {createLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Đang tạo...
                                            </>
                                        ) : 'Tạo Flashbook'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </BackgroundGradient>
            </DialogContent>
        </Dialog>
    );
}
