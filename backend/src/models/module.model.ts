import mongoose, { Schema, Document } from 'mongoose';

export interface IModule extends Document {
    moduleId: string;
    name: string;
    type: string;
    imageUrl: string;
    thumbnailUrl: string;
    description: string;
    creatorId: string;
    content: string;
    isBackedUp: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>({
    moduleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    description: { type: String, required: true },
    creatorId: { type: String, required: true },
    content: { type: String, required: true },
    isBackedUp: { type: Boolean, default: false },
}, { timestamps: true });

export const Module = mongoose.model<IModule>('Modules', ModuleSchema);