import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { uploadApi } from '../api/upload';

export function useUploadFile() {
    const [isUploading, setIsUploading] = useState(false);

    const uploadFile = async (
        file: File
    ): Promise<{ url: string; name: string; size: number; type: string } | null> => {
        const maxSize = 10 * 1024 * 1024; // 10 МБ
        if (file.size > maxSize) {
            notifications.show({
                title: 'Ошибка',
                message: 'Файл слишком большой (максимум 10 МБ)',
                color: 'red',
            });
            return null;
        }

        setIsUploading(true);
        try {
            const data = await uploadApi.uploadFile(file);
            return data;
        } catch {
            notifications.show({
                title: 'Ошибка',
                message: 'Не удалось загрузить файл',
                color: 'red',
            });
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadFile, isUploading };
}