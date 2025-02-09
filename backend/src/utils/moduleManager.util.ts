import { Module, IModule } from '../models/module.model';
import { publishModuleObject } from './tokenization.util';

export class ModuleManager {
    private static instance: ModuleManager;
    private constructor() {}

    public static getInstance(): ModuleManager {
        if (!ModuleManager.instance) {
            ModuleManager.instance = new ModuleManager();
        }
        return ModuleManager.instance;
    }

    public async createModule(
        moduleId: string,
        name: string,
        type: string,
        imageUrl: string,
        jsonContent: string,
        creatorId: string,
        description: string,
    ): Promise<IModule> {
        try {
            // Validate JSON content
            JSON.parse(jsonContent);

            // const moduleId = await publishModuleObject(
            //     name,
            //     type,
            //     imageUrl,
            //     imageUrl, // Using same URL for thumbnail for now
            //     description,
            //     creatorId
            // );

            // Create module in MongoDB
            const module = new Module({
                moduleId,
                name,
                type,
                imageUrl,
                thumbnailUrl: imageUrl,
                description,
                creatorId,
                content: jsonContent,
                isBackedUp: false,
            });

            await module.save();

            return module;
        } catch (error) {
            console.error('Error creating module:', error);
            throw error;
        }
    }

    public async readModuleContent(moduleId: string): Promise<string> {
        try {
            const module = await Module.findOne({ moduleId });
            if (!module) {
                console.error(`Module not found with ID: ${moduleId}`)
                return '';
            }
            return module.content;
        } catch (error) {
            console.error('Error reading module content:', error);
            throw error;
        }
    }

    public async appendModule(moduleId: string, newContent: string): Promise<IModule> {
        try {
            JSON.parse(newContent);

            const module = await Module.findOne({ moduleId });
            if (!module) {
                throw new Error(`Module not found with ID: ${moduleId}`);
            }

            // Parse existing content
            const existingContent = JSON.parse(module.content);
            const appendedContent = JSON.parse(newContent);

            // Merge content (assuming both are objects)
            const mergedContent = { ...existingContent, ...appendedContent };

            // Update module with merged content
            const updatedModule = await Module.findOneAndUpdate(
                { moduleId },
                { 
                    content: JSON.stringify(mergedContent),
                    isBackedUp: false // Reset backup flag as content has changed
                },
                { new: true }
            );

            if (!updatedModule) {
                throw new Error('Failed to update module');
            }

            return updatedModule;
        } catch (error) {
            console.error('Error appending to module:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const moduleManager = ModuleManager.getInstance();