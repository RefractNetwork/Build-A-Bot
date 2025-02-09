import { Router } from 'express';
import { ModuleManager } from '../utils/moduleManager.util';

const router = Router();

router.post('/createModule', async (req, res) => {
  try {
      const { 
          moduleId,
          name, 
          type, 
          imageUrl, 
          content, 
          creatorId, 
          description 
      } = req.body;

      // Validate required fields
      if (!moduleId || !name || !type || !imageUrl || !content || !creatorId || !description) {
          res.status(400).json({ 
              error: 'Missing required fields', 
              required: ['moduleID', 'name', 'type', 'imageUrl', 'content', 'creatorId', 'description'] 
          });
          return;
      }

      // Validate content is valid JSON
      try {
          JSON.parse(content);
      } catch (e) {
          res.status(400).json({ 
              error: 'Content must be valid JSON string' 
          });
          return;
      }

      const module = await ModuleManager.getInstance().createModule(
          moduleId,
          name,
          type,
          imageUrl,
          content,
          creatorId,
          description
      );

      res.status(201).json({
          success: true,
          message: 'Module created successfully',
          data: module
      });

  } catch (error) {
      console.error('Error in createModule route:', error);
      res.status(500).json({ 
          error: 'Failed to create module',
          message: error instanceof Error ? error.message : 'Unknown error'
      });
  }
});

router.get('/getModule/:moduleId', async (req, res) => {
  try {
      const { moduleId } = req.params;

      if (!moduleId) {
          res.status(400).json({
              error: 'Missing moduleId parameter'
          });
          return;
      }

      const content = await ModuleManager.getInstance().readModuleContent(moduleId);

      res.status(200).json({
          success: true,
          data: {
              moduleId,
              content: JSON.parse(content) // Parse JSON for cleaner response
          }
      });

  } catch (error) {
      console.error('Error in getModule route:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
          res.status(404).json({
              error: 'Module not found',
              moduleId: req.params.moduleId
          });
          return;
      }

      res.status(500).json({
          error: 'Failed to retrieve module content',
          message: error instanceof Error ? error.message : 'Unknown error'
      });
  }
});

export default router;
