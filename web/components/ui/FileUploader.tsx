"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, File, X } from "lucide-react";

interface FileUploaderProps {
    label: string;
    accept?: string;
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
}

export default function FileUploader({
    label,
    accept = "image/jpeg, image/png, application/pdf",
    onFileSelect,
    selectedFile
}: FileUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
        }
    };

    const handleRemove = () => {
        onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (selectedFile) {
        return (
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <div className="flex items-center justify-between p-4 border border-blue-500 rounded-lg bg-blue-50/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <File className="w-6 h-6 text-blue-500 shrink-0" />
                        <span className="text-sm font-medium text-gray-800 truncate">
                            {selectedFile.name}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isDragOver
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
                    }`}
            >
                <UploadCloud className={`w-8 h-8 mb-2 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-sm text-center text-gray-600">
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="mt-1 text-xs text-center text-gray-500">
                    JPG, PNG, or PDF (max 5MB)
                </p>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={accept}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}
