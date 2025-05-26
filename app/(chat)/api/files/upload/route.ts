import { auth } from "@/app/(auth)/auth";
import { NextResponse } from 'next/server';
import { z } from "zod";
import { put } from "@vercel/blob";

const FileSchema = z.object({
    file: z.instanceof(Blob)
        .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
        .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), 'Only JPEG and PNG images are allowed'),
})

export async function POST(request: Request) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({
            error: 'Unauthorized',
        }, {
            status: 401,
        })
    }

    if (request.body === null) {
        return NextResponse.json({
            error: 'request body is null',
        }, {
            status: 400,
        })
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file) {
            return NextResponse.json({
                error: 'file is uploaded',
            }, {
                status: 400,
            })
        }

        // 校验文件类型和大小
        const validatedFile = FileSchema.safeParse({file});


        if (!validatedFile.success) {
            const errorMessage = validatedFile.error.errors.map((issue) => issue.message).join(', ');
            return NextResponse.json({
                error: errorMessage,
            }, {
                status: 400,
            })
        }

        const filename = (formData.get('file') as File).name;
        const fileBuffer = await file.arrayBuffer();

        try {
            const data = await put(`${filename}`, fileBuffer, {
                access: 'public',
            })
            return NextResponse.json(data);
        } catch (error) {
            console.error('Upload failed:', error);
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
        }
    } catch (error) {
        console.error('Upload preview failed:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 },
          );
    }
}