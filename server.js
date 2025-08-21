import express from 'express';
import multer from 'multer';
import { marked } from 'marked';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and PPT files are allowed.'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Set view engine (we'll serve HTML files directly)
app.set('views', path.join(__dirname, 'templates'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'chat.html'));
});

app.get('/analyzer', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'analyzer.html'));
});

// API Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Simulate LLM response (replace with actual LLM integration)
    const response = await simulateLLMResponse(message);
    
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    console.log('File uploaded:', file.originalname, file.mimetype, file.size);

    res.json({
      success: true,
      filename: file.originalname,
      size: file.size,
      type: file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided for analysis' });
    }

    const file = req.file;
    
    // Call the analyze_file function
    const analysisResult = await analyze_file(file);
    
    res.json({
      success: true,
      result: analysisResult
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Progress endpoint for real-time updates
app.get('/api/progress/:taskId', (req, res) => {
  const { taskId } = req.params;
  
  // In a real implementation, you would check the progress of the task
  // For now, we'll simulate progress
  const progress = Math.floor(Math.random() * 100);
  
  res.json({
    progress: progress,
    status: progress < 100 ? 'processing' : 'completed'
  });
});

// Simulate LLM response
async function simulateLLMResponse(message) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return `This is a simulated response to: "${message}". In a real implementation, this would be connected to your LLM service.`;
}

// The analyze_file function you requested
async function analyze_file(file) {
  console.log('Analyzing file:', file.originalname);
  console.log('File type:', file.mimetype);
  console.log('File size:', file.size);
  
  // Simulate analysis process
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return markdown content as requested
  return `# Analysis Result for ${file.originalname}

## File Information
- **Filename**: ${file.originalname}
- **Type**: ${file.mimetype}
- **Size**: ${(file.size / 1024 / 1024).toFixed(2)} MB

## Analysis Summary
This is a simulated analysis result. In a real implementation, you would:

1. **Extract content** from the PDF/PPT file
2. **Process the content** through your LLM
3. **Generate translations** or analysis
4. **Format the results** as markdown

## Key Findings
- Document contains ${Math.floor(Math.random() * 50) + 10} pages/slides
- Primary language detected: English
- Content type: ${file.mimetype.includes('pdf') ? 'PDF Document' : 'PowerPoint Presentation'}

## Recommendations
- Consider breaking down complex sections
- Add visual elements for better understanding
- Review technical terminology for accuracy

---
*Analysis completed at ${new Date().toLocaleString()}*`;
}

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'templates', '404.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});