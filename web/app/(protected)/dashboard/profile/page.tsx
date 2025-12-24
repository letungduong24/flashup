'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, User, Save } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface UserProfile {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    gender?: string;
    address?: string;
    createdAt: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        gender: '',
        address: '',
    });

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const profileRes = await api.get<UserProfile>('/users/profile');

            setProfile(profileRes.data);
            setFormData({
                name: profileRes.data.name || '',
                phone: profileRes.data.phone || '',
                gender: profileRes.data.gender || '',
                address: profileRes.data.address || '',
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Không thể tải thông tin profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put('/users/profile', formData);
            toast.success('Cập nhật profile thành công');
            fetchProfileData();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Không thể cập nhật profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-3">
                <User className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
            </div>

            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={profile?.email || ''}
                            disabled
                            className="bg-muted"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nhập họ và tên"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Nhập số điện thoại"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">Giới tính</Label>
                        <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Nam</SelectItem>
                                <SelectItem value="female">Nữ</SelectItem>
                                <SelectItem value="other">Khác</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Địa chỉ</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Nhập địa chỉ"
                        />
                    </div>

                    <Button onClick={handleSave} disabled={saving} className="w-full">
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Lưu thay đổi
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
